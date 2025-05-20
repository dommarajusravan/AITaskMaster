import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useChat = (conversationId: number) => {
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        content: message,
      });
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      console.error('Failed to send message:', error);
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await sendMessageMutation.mutateAsync(content);
    },
    [sendMessageMutation]
  );

  const createConversationMutation = useMutation({
    mutationFn: async (title: string = 'New Conversation') => {
      return await apiRequest('POST', '/api/conversations', { title });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      return data.id;
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create conversation. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const createConversation = useCallback(
    async (title?: string) => {
      return await createConversationMutation.mutateAsync(title);
    },
    [createConversationMutation]
  );

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    createConversation,
    isPending: sendMessageMutation.isPending,
  };
};
