import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { EmailSummary } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useEmailSummary = () => {
  const [summary, setSummary] = useState<EmailSummary | null>(null);
  const { toast } = useToast();

  const summarizeEmailMutation = useMutation({
    mutationFn: async (emailContent: string) => {
      return await apiRequest('POST', '/api/email/summarize', { emailContent });
    },
    onSuccess: (data) => {
      setSummary(data as EmailSummary);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to summarize email. Please try again.',
        variant: 'destructive',
      });
      setSummary(null);
    },
  });

  const summarizeEmail = async (emailContent: string) => {
    if (!emailContent.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please provide email content to summarize.',
        variant: 'destructive',
      });
      return;
    }
    
    await summarizeEmailMutation.mutateAsync(emailContent);
  };

  return {
    summary,
    summarizeEmail,
    isLoading: summarizeEmailMutation.isPending,
    reset: () => setSummary(null),
  };
};
