import { Request, Response, NextFunction } from 'express';
import contactService from '../services/contact.service';
import { IdentifyRequest } from '../types';

/**
 * Contact Controller - Handles HTTP requests for contact operations
 */
class ContactController {
  async identify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: IdentifyRequest = req.body;

      const result = await contactService.identify(data);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ContactController();
