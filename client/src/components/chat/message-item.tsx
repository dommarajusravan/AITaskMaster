import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/types';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUserMessage = message.role === 'user';

  return (
    <div className={cn('flex mb-4', isUserMessage ? 'justify-end' : '')}>
      <div
        className={cn(
          'rounded-2xl p-3 max-w-[80%] shadow-sm',
          isUserMessage 
            ? 'user-message bg-google-blue text-white' 
            : 'ai-message bg-white text-neutral-800'
        )}
      >
        <p dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }} />
      </div>
    </div>
  );
};

// Helper function to format message content with line breaks and lists
const formatMessageContent = (content: string): string => {
  // Replace line breaks with <br> tags
  let formattedContent = content.replace(/\n/g, '<br>');
  
  // Format lists (simple implementation)
  formattedContent = formattedContent.replace(/- (.*?)(?=<br>|$)/g, '<li>$1</li>');
  if (formattedContent.includes('<li>')) {
    formattedContent = formattedContent.replace(/<li>(.*?)<\/li>/g, '<ul class="list-disc pl-5 mb-2">$&</ul>');
    formattedContent = formattedContent.replace(/<\/ul><ul class="list-disc pl-5 mb-2">/g, '');
  }
  
  return formattedContent;
};

export default MessageItem;
