import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

// Function to get the JWT secret key
const getJwtSecretKey = (): string => {
  const secretKey = process.env.JWT_SECRET_KEY;
  if (!secretKey) {
    throw new Error('JWT_SECRET_KEY is not defined');
  }
  return secretKey;
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const user = jwt.verify(token, getJwtSecretKey()) as JwtPayload;
      req.user = user;
      next();
    } catch {
      res.sendStatus(403); // Forbidden
    }
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

export const authMiddleware = ({ req }: { req: Request }) => {
  const token = req.headers.authorization || '';

  if (token) {
    try {
      const data = jwt.verify(token, getJwtSecretKey()) as JwtPayload;
      req.user = data;
    } catch {
      console.log('Invalid token');
    }
  }

  return req;
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  return jwt.sign(payload, getJwtSecretKey(), { expiresIn: '1h' });
};

