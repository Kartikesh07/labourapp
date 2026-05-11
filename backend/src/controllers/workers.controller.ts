import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { CacheService } from '../services/cache.service';

export const getWorkers = async (req: Request, res: Response) => {
  try {
    const { skill, location } = req.query;
    const cacheKey = `workers:${skill || 'all'}:${location || 'all'}`;

    const responseData = await CacheService.getOrSet(cacheKey, 600, async () => {
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

      return {
        success: true,
        message: 'Workers fetched successfully',
        data
      };
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};
