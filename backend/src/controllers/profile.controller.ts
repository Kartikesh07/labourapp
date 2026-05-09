import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import sharp from 'sharp';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    let profileData: any = { ...user };

    if (user.role === 'worker') {
      const { data } = await supabaseAdmin.from('worker_profiles').select('*').eq('id', user.id).single();
      if (data) profileData = { ...profileData, ...data };
    } else {
      const { data } = await supabaseAdmin.from('employer_profiles').select('*').eq('id', user.id).single();
      if (data) profileData = { ...profileData, ...data };
    }

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: profileData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    let { name, phone, avatar_url, avatar_base64, avatar_type, role, ...roleSpecificData } = req.body;

    // Handle avatar upload via base64
    if (avatar_base64) {
      // Decode base64 
      const buffer = Buffer.from(avatar_base64, 'base64');
      
      // Convert to WebP format for fast loading and low payload
      const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
      const ext = 'webp';
      const fileName = `${user.id}-${Date.now()}.${ext}`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('avatars')
        .upload(fileName, webpBuffer, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Failed to upload avatar: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (publicUrlData) {
        avatar_url = publicUrlData.publicUrl;
      }
    }

    // Update main profile
    const profileUpdates: any = {};
    if (name) profileUpdates.name = name;
    if (phone) profileUpdates.phone = phone;
    if (avatar_url) profileUpdates.avatar_url = avatar_url;
    if (role) profileUpdates.role = role;

    if (Object.keys(profileUpdates).length > 0) {
      await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', user.id);
      
      // If role changed or was just set, we might also want to update the auth user's metadata
      if (role) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: { role }
        });
      }
    }

    // Update role specific profile
    if (Object.keys(roleSpecificData).length > 0 || role) {
      const activeRole = role || user.role;
      
      if (activeRole === 'worker') {
        const workerUpdates = {
          skills: roleSpecificData.skills,
          experience: roleSpecificData.experience,
          location: roleSpecificData.location,
          bio: roleSpecificData.bio,
        };
        Object.keys(workerUpdates).forEach((key) => (workerUpdates as any)[key] === undefined && delete (workerUpdates as any)[key]);
        
        await supabaseAdmin.from('worker_profiles').upsert([{ id: user.id, ...workerUpdates }]);
      } else {
        const employerUpdates = {
          company_name: roleSpecificData.company_name,
          company_logo_url: roleSpecificData.company_logo_url,
          location: roleSpecificData.location,
          description: roleSpecificData.description,
        };
        Object.keys(employerUpdates).forEach((key) => (employerUpdates as any)[key] === undefined && delete (employerUpdates as any)[key]);
        
        await supabaseAdmin.from('employer_profiles').upsert([{ id: user.id, ...employerUpdates }]);
      }
    }

    // Fetch and return the updated profile cleanly
    const { data: updatedBase } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
    let updatedFull = { ...updatedBase };
    if (updatedBase.role === 'worker') {
      const { data } = await supabaseAdmin.from('worker_profiles').select('*').eq('id', user.id).single();
      if(data) updatedFull = { ...updatedFull, ...data };
    } else {
      const { data } = await supabaseAdmin.from('employer_profiles').select('*').eq('id', user.id).single();
      if(data) updatedFull = { ...updatedFull, ...data };
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedFull
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { available } = req.body;

    const { data, error } = await supabaseAdmin
      .from('worker_profiles')
      .update({ available })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }

    res.status(200).json({
      success: true,
      message: `Availability status updated to ${available ? 'available' : 'unavailable'}`,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: (error as Error).message });
  }
};
