import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';

interface CreateSilencePayload {
  event_id: string;
  duration: string;
  comment: string;
}

const createSilence = async (payload: CreateSilencePayload) => {
  const response = await apiClient.post('/silence-rules', payload);
  return response.data;
};

export const useCreateSilence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSilence,
    onSuccess: () => {
      // Invalidate and refetch queries that should be updated after creating a silence
      // For example, the silences list or the events list if status changes
      queryClient.invalidateQueries({ queryKey: ['silences'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};
