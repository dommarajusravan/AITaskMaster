import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import MessageList from '@/components/chat/message-list';
import MessageInput from '@/components/chat/message-input';
import { useQuery } from '@tanstack/react-query';
import { Conversation } from '@/lib/types';

const Chat: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    enabled: isAuthenticated,
  });

  const {
    messages,
    isLoading: messagesLoading,
    isTyping,
    sendMessage,
    createConversation,
    isPending,
  } = useChat(activeConversationId as number);

  // Create a new conversation if none exists
  useEffect(() => {
    const initChat = async () => {
      if (isAuthenticated && !authLoading && conversations) {
        // If there are no conversations or no active conversation set
        if (conversations.length === 0 || !activeConversationId) {
          if (conversations.length > 0) {
            // Use the most recent conversation
            setActiveConversationId(conversations[0].id);
          } else {
            // Create a new conversation
            const newConversationId = await createConversation('New Conversation');
            setActiveConversationId(newConversationId);
          }
        }
      }
    };

    initChat();
  }, [isAuthenticated, authLoading, conversations, activeConversationId, createConversation]);

  const handleSendMessage = (messageContent: string) => {
    if (activeConversationId) {
      sendMessage(messageContent);
    }
  };

  const isLoading = authLoading || messagesLoading || !activeConversationId;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">Loading...</div>
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
