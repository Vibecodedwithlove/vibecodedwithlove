'use client';

import { useState } from 'react';
import { SuggestionFormData, SuggestionType } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { SUGGESTION_TYPES } from '@/lib/constants';
import CommunityGuidelines from '@/components/shared/CommunityGuidelines';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { cn } from '@/lib/utils';

interface SuggestionFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export default function SuggestionForm({
  projectId,
  onSuccess,
}: SuggestionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<'body' | 'how_to_fix'>('body');
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<SuggestionFormData>({
    type: 'general',
    title: '',
    body: '',
    how_to_fix: '',
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required');
        setIsLoading(false);
        return;
      }

      if (!formData.body.trim()) {
        setError('Description is required');
        setIsLoading(false);
        return;
      }

      if (!formData.how_to_fix.trim()) {
        setError('How to Fix is required');
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from('suggestions')
        .insert({
          project_id: projectId,
          author_id: user?.id || null,
          type: formData.type,
          title: formData.title,
          body: formData.body,
          how_to_fix: formData.how_to_fix,
          status: 'open',
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(true);
        setFormData({
          type: 'general',
          title: '',
          body: '',
          how_to_fix: '',
        });

        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card padding="md" className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Suggestion submitted!
            </h3>
          </div>
          <p className="text-green-700 dark:text-green-300">
            Thank you for helping improve this project. Your suggestion has been
            posted.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CommunityGuidelines collapsible defaultExpanded />

      <div className="flex items-start gap-2 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p>
          Tip: Reference specific files and line numbers when possible. Check the project&apos;s Code Map (if available above) to orient yourself in the codebase.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Card
            padding="md"
            className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
          >
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </Card>
        )}

        <Select
          label="Suggestion Type"
          value={formData.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value as SuggestionType,
            })
          }
          options={SUGGESTION_TYPES.map((t) => ({
            value: t.value,
            label: t.label,
          }))}
        />

        <Input
          label="Title"
          placeholder="Brief title for your suggestion"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          required
        />

        {/* Body Field with Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Description
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                setShowPreview(false);
                setPreviewTab('body');
              }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                !showPreview
                  ? 'bg-warmPrimary text-white'
                  : 'bg-input text-foreground hover:bg-border'
              )}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPreview(true);
                setPreviewTab('body');
              }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                showPreview && previewTab === 'body'
                  ? 'bg-warmPrimary text-white'
                  : 'bg-input text-foreground hover:bg-border'
              )}
            >
              Preview
            </button>
          </div>

          {!showPreview ? (
            <Textarea
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              placeholder="Describe the issue or suggestion in detail. Supports Markdown."
              rows={6}
              required
            />
          ) : (
            <Card padding="md" className="min-h-32">
              {formData.body.trim() ? (
                <MarkdownRenderer content={formData.body} />
              ) : (
                <p className="text-muted italic">
                  Your description will appear here...
                </p>
              )}
            </Card>
          )}
        </div>

        {/* How to Fix Field with Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            How to Fix — Required
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                setShowPreview(false);
                setPreviewTab('how_to_fix');
              }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                !showPreview && previewTab === 'how_to_fix'
                  ? 'bg-warmPrimary text-white'
                  : 'bg-input text-foreground hover:bg-border'
              )}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPreview(true);
                setPreviewTab('how_to_fix');
              }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                showPreview && previewTab === 'how_to_fix'
                  ? 'bg-warmPrimary text-white'
                  : 'bg-input text-foreground hover:bg-border'
              )}
            >
              Preview
            </button>
          </div>

          {!showPreview || previewTab === 'how_to_fix' ? (
            <>
              {!showPreview ? (
                <Textarea
                  value={formData.how_to_fix}
                  onChange={(e) =>
                    setFormData({ ...formData, how_to_fix: e.target.value })
                  }
                  placeholder="Provide specific steps on how to fix this issue. Supports Markdown."
                  rows={6}
                  required
                />
              ) : (
                <Card padding="md" className="min-h-32">
                  {formData.how_to_fix.trim() ? (
                    <MarkdownRenderer content={formData.how_to_fix} />
                  ) : (
                    <p className="text-muted italic">
                      Your fix suggestion will appear here...
                    </p>
                  )}
                </Card>
              )}
            </>
          ) : (
            <Card padding="md" className="min-h-32">
              {formData.body.trim() ? (
                <MarkdownRenderer content={formData.body} />
              ) : (
                <p className="text-muted italic">
                  Your description will appear here...
                </p>
              )}
            </Card>
          )}
        </div>

        <Button
          variant="primary"
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full"
        >
          Submit Suggestion
        </Button>
      </form>
    </div>
  );
}
