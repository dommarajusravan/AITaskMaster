import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import MessageList from '@/components/chat/message-list';
import MessageInput from '@/components/chat/message-input';
import { useQuery } from '@tanstack/react-query';
import { Conversation } from '@/lib/types';
import { getConversations } from '@/lib/api';

const Chat: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    queryFn: getConversations,
    enabled: isAuthenticated,
  });

  const {
    messages,
    isLoading: messagesLoading,
    isTyping,
    sendMessage,
    createConversation,
    isPending,
  } = useChat(activeConversationId);

  // Create a new conversation if none exists
  useEffect(() => {
    let isMounted = true;
    
    const initChat = async () => {
      if (!isAuthenticated || authLoading || !isMounted) return;
      
      // If we already have an active conversation, don't do anything
      if (activeConversationId) return;
      
      try {
        // If we have conversations, set the first one as active
        if (conversations && conversations.length > 0) {
          console.log('Setting active conversation to:', conversations[0].id);
          setActiveConversationId(conversations[0].id);
          return;
        }
        
        // Otherwise create a new conversation
        console.log('Creating new conversation');
        const newConversationId = await createConversation('New Conversation');
        if (isMounted && newConversationId) {
          console.log('Created new conversation with ID:', newConversationId);
          setActiveConversationId(newConversationId);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    initChat();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading, conversations, activeConversationId, createConversation]);

  const handleSendMessage = (messageContent: string) => {
    if (activeConversationId && messageContent.trim()) {
      sendMessage(messageContent);
    }
  };

  const isLoading = authLoading || conversationsLoading || messagesLoading || activeConversationId === null;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        Please log in to access the chat
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin mb-2 mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p>Loading conversation...</p>
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} isTyping={isTyping} />
          <MessageInput onSendMessage={handleSendMessage} isDisabled={isPending} />
        </>
      )}
    </div>
  );
};

export default Chat;
