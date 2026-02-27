import { Contact, LinkPrecedence } from '@prisma/client';
import prisma from '../prisma/client';
import { IdentifyRequest, IdentifyResponse, AppError } from '../types';

/**
 * Contact Service - Handles all business logic for contact identity reconciliation
 */
class ContactService {
  /**
   * Main method to identify and reconcile contact information
   */
  async identify(data: IdentifyRequest): Promise<IdentifyResponse> {
    const { email, phoneNumber } = data;

    // Validation: At least one of email or phoneNumber must be provided
    if (!email && !phoneNumber) {
      throw new AppError('At least one of email or phoneNumber must be provided', 400);
    }

    // Use transaction to ensure data consistency
    return await prisma.$transaction(async (tx: any) => {
      // Step 1: Find all matching contacts
      const matchingContacts = await this.findMatchingContacts(tx, email, phoneNumber);

      // Step 2: If no contacts found, create a new primary contact
      if (matchingContacts.length === 0) {
        const newContact = await tx.contact.create({
          data: {
            email,
            phoneNumber,
            linkPrecedence: LinkPrecedence.primary,
            linkedId: null,
          },
        });

        return this.formatResponse([newContact]);
      }

      // Step 3: Get all related contacts (including linked ones)
      const allRelatedContacts = await this.getAllRelatedContacts(tx, matchingContacts);

      // Step 4: Determine the primary contact (oldest one)
      const primaryContact = this.determinePrimaryContact(allRelatedContacts);

      // Step 5: Convert other primaries to secondaries if needed
      await this.convertSecondariesToPrimary(tx, allRelatedContacts, primaryContact.id);

      // Step 6: Check if we need to create a new secondary contact
      const needsNewContact = this.checkIfNeedsNewContact(
        allRelatedContacts,
        email,
        phoneNumber
      );

      if (needsNewContact) {
        const newSecondary = await tx.contact.create({
          data: {
            email,
            phoneNumber,
            linkPrecedence: LinkPrecedence.secondary,
            linkedId: primaryContact.id,
          },
        });

        allRelatedContacts.push(newSecondary);
      }

      // Step 7: Fetch fresh data to ensure consistency
      const finalContacts = await this.getAllContactsInChain(tx, primaryContact.id);

      return this.formatResponse(finalContacts);
    });
  }

  /**
   * Find all contacts matching the email or phone number
   */
  private async findMatchingContacts(
    tx: any,
    email?: string,
    phoneNumber?: string
  ): Promise<Contact[]> {
    const conditions: any[] = [];

    if (email) {
      conditions.push({ email });
    }

    if (phoneNumber) {
      conditions.push({ phoneNumber });
    }

    return await tx.contact.findMany({
      where: {
        OR: conditions,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Get all related contacts including primary and all secondaries in the chain
   */
  private async getAllRelatedContacts(tx: any, initialContacts: Contact[]): Promise<Contact[]> {
    const contactIds = new Set<number>();
    const primaryIds = new Set<number>();

    // Collect all IDs
    for (const contact of initialContacts) {
      contactIds.add(contact.id);
      if (contact.linkedId) {
        primaryIds.add(contact.linkedId);
      }
      if (contact.linkPrecedence === LinkPrecedence.primary) {
        primaryIds.add(contact.id);
      }
    }

    // Fetch all contacts related to these primaries
    const allContacts = await tx.contact.findMany({
      where: {
        OR: [
          { id: { in: Array.from(contactIds) } },
          { id: { in: Array.from(primaryIds) } },
          { linkedId: { in: Array.from(primaryIds) } },
        ],
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return allContacts;
  }

  /**
   * Determine which contact should be the primary (oldest one)
   */
  private determinePrimaryContact(contacts: Contact[]): Contact {
    return contacts.reduce((oldest, current) => {
      return current.createdAt < oldest.createdAt ? current : oldest;
    });
  }

  /**
   * Convert all contacts to point to the correct primary
   */
  private async convertSecondariesToPrimary(
    tx: any,
    contacts: Contact[],
    primaryId: number
  ): Promise<void> {
    for (const contact of contacts) {
      if (contact.id === primaryId) {
        // This is the primary contact
        if (contact.linkPrecedence !== LinkPrecedence.primary || contact.linkedId !== null) {
          await tx.contact.update({
            where: { id: contact.id },
            data: {
              linkPrecedence: LinkPrecedence.primary,
              linkedId: null,
            },
          });
        }
      } else {
        // This should be a secondary contact
        if (
          contact.linkPrecedence !== LinkPrecedence.secondary ||
          contact.linkedId !== primaryId
        ) {
          await tx.contact.update({
            where: { id: contact.id },
            data: {
              linkPrecedence: LinkPrecedence.secondary,
              linkedId: primaryId,
            },
          });
        }
      }
    }
  }

  /**
   * Check if we need to create a new contact with the given information
   */
  private checkIfNeedsNewContact(
    existingContacts: Contact[],
    email?: string,
    phoneNumber?: string
  ): boolean {
    // If both email and phoneNumber are provided
    if (email && phoneNumber) {
      // Check if any contact has this exact combination
      const hasExactMatch = existingContacts.some(
        (c) => c.email === email && c.phoneNumber === phoneNumber
      );
      if (hasExactMatch) {
        return false;
      }

      // Check if this is completely new information
      const hasEmail = existingContacts.some((c) => c.email === email);
      const hasPhone = existingContacts.some((c) => c.phoneNumber === phoneNumber);

      // If we have both email and phone separately but not together, create new secondary
      if (hasEmail && hasPhone) {
        return true;
      }

      // If we have one but not the other, create new secondary
      if (hasEmail || hasPhone) {
        return true;
      }
    }

    // If only email or phoneNumber is provided, no need for new contact
    // (we already found a match to get here)
    return false;
  }

  /**
   * Get all contacts in the chain for a given primary ID
   */
  private async getAllContactsInChain(tx: any, primaryId: number): Promise<Contact[]> {
    return await tx.contact.findMany({
      where: {
        OR: [{ id: primaryId }, { linkedId: primaryId }],
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Format the response according to the required structure
   */
  private formatResponse(contacts: Contact[]): IdentifyResponse {
    // Find the primary contact
    const primary = contacts.find((c) => c.linkPrecedence === LinkPrecedence.primary);

    if (!primary) {
      throw new AppError('Primary contact not found', 500);
    }

    // Collect all unique emails and phoneNumbers
    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const secondaryContactIds: number[] = [];

    // Add primary's email and phone first
    if (primary.email) emails.push(primary.email);
    if (primary.phoneNumber) phoneNumbers.push(primary.phoneNumber);

    // Add secondary contacts' information
    for (const contact of contacts) {
      if (contact.id === primary.id) continue;

      if (contact.email && !emails.includes(contact.email)) {
        emails.push(contact.email);
      }

      if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
        phoneNumbers.push(contact.phoneNumber);
      }

      if (contact.linkPrecedence === LinkPrecedence.secondary) {
        secondaryContactIds.push(contact.id);
      }
    }

    return {
      contact: {
        primaryContactId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }
}

export default new ContactService();
