// Media API endpoints
import { Request, Response } from 'express';

export async function uploadMedia(req: Request, res: Response) {
  // TODO: Implement media upload logic
  res.status(201).json({ message: 'Media uploaded (stub)' });
}

export async function getUserMedia(req: Request, res: Response) {
  // TODO: Implement get user media logic
  res.status(200).json({ message: 'User media (stub)' });
}
