import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { supabaseAdmin } from '../config/supabase';
import { UserProfile } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Unauthorized', data: null });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT using Supabase
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      res.status(401).json({ success: false, message: 'Invalid or expired token', data: null });
      return;
    }

    // Fetch user profile from Supabase
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !profile) {
      console.log('Error fetching user profile:', error, authUser.id);
      res.status(401).json({ success: false, message: 'User not found', data: null });
      return;
    }

    req.user = profile as UserProfile;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication error', error: (error as Error).message });
  }
};

export const requireRole = (role: 'worker' | 'employer') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ success: false, message: `Access denied. Requires ${role} role.`, data: null });
      return;
    }
    next();
  };
};
