import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../services/api/applications';
import { CreateApplicationPayload, ApplicationStatus } from '../types';

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['myApplications'],
    queryFn: () => applicationsApi.getMyApplications(),
    select: (data) => data.data,
  });
};

export const useJobApplicants = (jobId: string) => {
  return useQuery({
    queryKey: ['jobApplicants', jobId],
    queryFn: () => applicationsApi.getJobApplicants(jobId),
    select: (data) => data.data,
    enabled: !!jobId,
  });
};

export const useApply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApplicationPayload) => applicationsApi.apply(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplicants'] });
    },
  });
};
