import { useState, useCallback } from 'react';
import * as workersApi from '../services/api/workers';

export const useWorkers = () => {
    const [workers, setWorkers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadWorkers = useCallback(async (params: workersApi.WorkerFilterParams = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await workersApi.fetchWorkers(params);
            if (response.success) {
                // Supabase join sometimes puts the joined table in the parent object directly, sometimes under the table name.
                // Our backend joins `worker_profiles`, so it will be `worker_profiles` field.
                const formattedWorkers = response.data.map((w: any) => ({
                    ...w,
                    skills: w.worker_profiles?.skills || [],
                    location: w.worker_profiles?.location || 'Not specified',
                    bio: w.worker_profiles?.bio || '',
                    available: w.worker_profiles?.available,
                    phone: w.phone,
                    email: w.email,
                    avatar_url: w.avatar_url
                }));
                setWorkers(formattedWorkers);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load workers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { workers, isLoading, error, loadWorkers };
};
