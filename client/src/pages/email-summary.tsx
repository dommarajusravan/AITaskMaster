import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useEmailSummary } from '@/hooks/use-email-summary';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const EmailSummary: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [emailContent, setEmailContent] = useState('');
  const { summary, summarizeEmail, isLoading, reset } = useEmailSummary();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    summarizeEmail(emailContent);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">Email Summarization</h2>
          <p className="text-neutral-500 mb-6">
            Paste an email or forward it to get a concise summary of the most important information.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email-input" className="block text-sm font-medium text-neutral-700 mb-1">
                Email Content
              </label>
              <Textarea
                id="email-input"
                rows={8}
                placeholder="Paste your email content here..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-google-blue focus:border-google-blue transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-google-blue text-white hover:bg-blue-600"
              disabled={isLoading || !emailContent.trim()}
            >
              {isLoading ? 'Summarizing...' : 'Summarize Email'}
            </Button>
          </form>

          {summary && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-800 mb-3">Summary Results</h3>
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <p className="font-semibold text-neutral-800">Email Summary:</p>
                <div className="mt-2 space-y-2">
                  <p className="text-neutral-800">
                    <span className="font-medium">Subject:</span> {summary.subject}
                  </p>
                  <p className="text-neutral-800">
                    <span className="font-medium">Key Info:</span> {summary.keyInfo}
                  </p>
                  {summary.actionItems.length > 0 && (
                    <>
                      <p className="text-neutral-800">
                        <span className="font-medium">Action Items:</span>
                      </p>
                      <ul className="list-disc pl-5 text-neutral-800">
                        {summary.actionItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {summary.deadline && (
                    <p className="text-neutral-800">
                      <span className="font-medium">Deadline:</span> {summary.deadline}
                    </p>
                  )}
                  {summary.sender && (
                    <p className="text-neutral-800">
                      <span className="font-medium">Sender:</span> {summary.sender}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setEmailContent('');
                  reset();
                }}
              >
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSummary;
