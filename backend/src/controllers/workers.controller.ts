import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const getWorkers = async (req: Request, res: Response) => {
  try {
    const { skill, location } = req.query;

    let query = supabaseAdmin
      .from('profiles')
      .select(`
        *,
        worker_profiles!inner(*)
      `)
      .eq('role', 'worker');

    if (skill && typeof skill === 'string') {
      query = query.contains('worker_profiles.skills', [skill]);
    }

    if (location && typeof location === 'string') {
      query = query.ilike('worker_profiles.location', `%${location}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Workers fetched successfully',
      data
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};
