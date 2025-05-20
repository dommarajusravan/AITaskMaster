import React, { useEffect, useRef } from 'react';
import MessageItem from './message-item';
import { Message } from '@/lib/types';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const welcomeMessage: Message = {
    id: -1,
    conversationId: -1,
    role: 'assistant',
    content: "Hi there! I'm your AI assistant. I can help you with tasks like summarizing emails, answering questions, and more. How can I help you today?",
    createdAt: new Date(),
  };

  return (
    <div
      ref={messageContainerRef}
      className="flex-1 overflow-y-auto p-4 pb-0 message-container"
    >
      {messages.length === 0 ? (
        <MessageItem message={welcomeMessage} />
      ) : (
        messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))
      )}

      {isTyping && (
        <div className="flex mb-4">
          <div className="bg-white rounded-2xl p-3 shadow-sm flex items-center">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
