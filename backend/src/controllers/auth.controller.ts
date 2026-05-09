import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';

const createTempClient = () => createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role, skills, location } = req.body;

    if (!location) {
      return res.status(400).json({ success: false, message: 'Location is required', data: null });
    }

    if (role === 'worker' && (!skills || skills.length === 0)) {
      return res.status(400).json({ success: false, message: 'Profession (skills) is required for workers', data: null });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
        role,
        skills,
        location
      }
    });

    if (authError) {
      return res.status(400).json({ success: false, message: authError.message, data: null });
    }

    const tempClient = createTempClient();
    // Login to get tokens
    const { data: signInData, error: signInError } = await tempClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(400).json({ success: false, message: signInError.message, data: null });
    }

    // Wait a brief moment to ensure trigger has created the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: profile,
        session: signInData.session
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const tempClient = createTempClient();

    const { data, error } = await tempClient.auth.signInWithPassword({       
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, message: error.message, data: null });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: profile,
        session: data.session
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      await supabaseAdmin.auth.admin.signOut(token);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authenticated', data: null });
    }

    let fullProfile = { ...user };

    if (user.role === 'worker') {
      const { data } = await supabaseAdmin.from('worker_profiles').select('*').eq('id', user.id).single();
      if (data) fullProfile = { ...fullProfile, ...data };
    } else {
      const { data } = await supabaseAdmin.from('employer_profiles').select('*').eq('id', user.id).single();
      if (data) fullProfile = { ...fullProfile, ...data };
    }

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: fullProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    const tempClient = createTempClient();

    const { data, error } = await tempClient.auth.refreshSession({ refresh_token });

    if (error) {
      return res.status(401).json({ success: false, message: error.message, data: null });

    }

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        session: data.session
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};
