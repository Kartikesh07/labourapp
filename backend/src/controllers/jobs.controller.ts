import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import redisClient from '../config/redis';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const { category, job_type, location, search, limit = '10', cursor } = req.query;
    const limitNum = parseInt(limit as string, 10);

    // Create a unique cache key based on query params
    const cacheKey = `jobs:${category || 'all'}:${job_type || 'all'}:${location || 'all'}:${search || 'none'}:${limitNum}:${cursor || 'none'}`;
    
    if (redisClient.isOpen) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
    }

    let query = supabaseAdmin
      .from('jobs')
      .select('*, profiles!inner(name, avatar_url, employer_profiles!inner(company_name, company_logo_url))')
      .eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (job_type) query = query.eq('job_type', job_type);
    if (location) query = query.ilike('location', `%${location}%`);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    query = query.order('created_at', { ascending: false }).limit(limitNum);

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    const formattedData = data.map((job: any) => ({
      ...job,
      employer_profiles: job.profiles?.employer_profiles || null
    }));

    const nextCursor = data.length === limitNum ? data[data.length - 1].created_at : null;

    const responseData = {
      success: true,
      message: 'Jobs fetched successfully',
      data: {
        jobs: formattedData,
        pagination: {
          nextCursor,
          limit: limitNum,
        }
      }
    };

    if (redisClient.isOpen) {
      // Cache the response for 10 minutes
      await redisClient.setEx(cacheKey, 600, JSON.stringify(responseData));
    }

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `job:${id}`;

    if (redisClient.isOpen) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*, profiles(name, avatar_url, employer_profiles(company_name, company_logo_url, description))')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Job not found', data: null });
    }

    const formattedData = {
      ...data,
      employer_profiles: data.profiles?.employer_profiles || null
    };

    const responseData = {
      success: true,
      message: 'Job fetched successfully',
      data: formattedData
    };

    if (redisClient.isOpen) {
      // Cache job details for 30 mins
      await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));
    }

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

const clearJobsCache = async () => {
  if (!redisClient.isOpen) return;
  // Use scan to find and delete all list caches for jobs
  let cursor = '0';
  do {
    const res = await redisClient.scan(cursor, { MATCH: 'jobs:*', COUNT: 100 });
    cursor = res.cursor;
    if (res.keys.length > 0) {
      await redisClient.del(res.keys);
    }
  } while (cursor !== '0');
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const employer_id = req.user!.id;
    const jobData = { ...req.body, employer_id };

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert([jobData])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    await clearJobsCache();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employer_id = req.user!.id;

    // Check ownership
    const { data: job } = await supabaseAdmin.from('jobs').select('employer_id').eq('id', id).single();
    if (!job || job.employer_id !== employer_id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job', data: null });
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    await clearJobsCache();
    if (redisClient.isOpen) await redisClient.del(`job:${id}`);

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employer_id = req.user!.id;

    // Check ownership
    const { data: job } = await supabaseAdmin.from('jobs').select('employer_id').eq('id', id).single();
    if (!job || job.employer_id !== employer_id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job', data: null });
    }

    // Soft delete
    const { error } = await supabaseAdmin
      .from('jobs')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    await clearJobsCache();
    if (redisClient.isOpen) await redisClient.del(`job:${id}`);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const getMyJobs = async (req: Request, res: Response) => {
  try {
    const employer_id = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        profiles:employer_id (
          name,
          avatar_url,
          employer_profiles (company_name, company_logo_url, description)
        )
      `)
      .eq('employer_id', employer_id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    const formattedData = data.map((job: any) => ({
      ...job,
      employer_profiles: job.profiles?.employer_profiles || null
    }));

    res.status(200).json({
      success: true,
      message: 'Employer jobs fetched successfully',
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};
