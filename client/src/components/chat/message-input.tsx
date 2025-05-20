import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isDisabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight < 120 ? scrollHeight : 120}px`;
    }
  }, [message]);

  return (
    <div className="p-4 border-t border-neutral-200 bg-white">
      <form className="flex items-end space-x-2" onSubmit={handleSubmit}>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className="w-full border border-neutral-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-google-blue focus:border-google-blue resize-none transition-all outline-none bg-white text-neutral-800"
            placeholder="Type your message..."
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isDisabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="button"
            className="absolute right-3 bottom-3 text-neutral-400 hover:text-neutral-600 transition-colors"
            disabled={isDisabled}
          >
            <Paperclip className="h-5 w-5" />
          </button>
        </div>
        <Button
          type="submit"
          className="rounded-full p-3 bg-google-blue hover:bg-blue-600 text-white"
          disabled={isDisabled || !message.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
