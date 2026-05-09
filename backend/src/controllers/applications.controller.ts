import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const createApplication = async (req: Request, res: Response) => {
  try {
    const worker_id = req.user!.id;
    const { job_id, message } = req.body;

    // Check if job exists and is active
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, is_active')
      .eq('id', job_id)
      .single();

    if (jobError || !job || !job.is_active) {
      return res.status(404).json({ success: false, message: 'Job not found or inactive', data: null });
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert([{ job_id, worker_id, message }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ success: false, message: 'You have already applied for this job', data: null });
      }
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const worker_id = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*, jobs(*, profiles(name, email, phone, avatar_url, employer_profiles(*)))')
      .eq('worker_id', worker_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    const formattedData = data.map((app: any) => ({
      ...app,
      jobs: app.jobs ? {
        ...app.jobs,
        employer_profiles: app.jobs.profiles?.employer_profiles || null
      } : null
    }));

    res.status(200).json({
      success: true,
      message: 'Applications fetched successfully',
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const getJobApplicants = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const employer_id = req.user!.id;

    // Verify ownership
    const { data: job } = await supabaseAdmin.from('jobs').select('employer_id').eq('id', jobId).single();
    if (!job || job.employer_id !== employer_id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these applications', data: null });
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*, profiles(name, email, phone, avatar_url, worker_profiles(skills, experience, location))')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    const formattedData = data.map((app: any) => ({
      ...app,
      worker_profiles: app.profiles?.worker_profiles || null
    }));

    res.status(200).json({
      success: true,
      message: 'Applicants fetched successfully',
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const employer_id = req.user!.id;

    // Verify ownership
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select('job_id, jobs(employer_id)')
      .eq('id', id)
      .single();

    if (appError || !application || (application.jobs as any).employer_id !== employer_id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application', data: null });
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};
