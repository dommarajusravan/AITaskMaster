import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';

export const useChat = (conversationId: number | null) => {
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only fetch messages if we have a valid conversation ID
  const isValidConversationId = conversationId !== null && !isNaN(Number(conversationId));
  
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    queryFn: () => {
      if (!isValidConversationId) return [];
      return api.getMessages(conversationId as number);
    },
    enabled: isValidConversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!isValidConversationId) {
        throw new Error('Invalid conversation ID');
      }
      return await api.sendMessage(conversationId as number, message);
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      if (isValidConversationId) {
        queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      }
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
      if (!content.trim() || !isValidConversationId) return;
      await sendMessageMutation.mutateAsync(content);
    },
    [sendMessageMutation, isValidConversationId]
  );

  const createConversationMutation = useMutation({
    mutationFn: async (title: string = 'New Conversation') => {
      return await api.createConversation(title);
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
    async (title: string = 'New Conversation'): Promise<number> => {
      try {
        const newConversation = await createConversationMutation.mutateAsync(title);
        return newConversation.id;
      } catch (error) {
        console.error('Failed to create conversation:', error);
        return 0;
      }
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
