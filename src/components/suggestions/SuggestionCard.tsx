'use client';

import { useState } from 'react';
import { SuggestionWithAuthor, SuggestionType } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import SuggestionTypeBadge from './SuggestionTypeBadge';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { SUGGESTION_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
  suggestion: SuggestionWithAuthor;
  isProjectOwner: boolean;
  isAuthor: boolean;
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 border-blue-300',
  acknowledged: 'bg-amber-100 text-amber-800 border-amber-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
  removed: 'bg-gray-100 text-gray-800 border-gray-300',
};

export default function SuggestionCard({
  suggestion,
  isProjectOwner,
  isAuthor,
}: SuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHowToFixExpanded, setIsHowToFixExpanded] = useState(true);
  const [editFormData, setEditFormData] = useState({
    type: suggestion.type,
    title: suggestion.title,
    body: suggestion.body,
    how_to_fix: suggestion.how_to_fix,
  });

  const supabase = createClient();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase.rpc('update_suggestion_status', {
        suggestion_id: suggestion.id,
        new_status: newStatus,
      });

      if (error) {
        console.error('Error updating status:', error);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({
          type: editFormData.type,
          title: editFormData.title,
          body: editFormData.body,
          how_to_fix: editFormData.how_to_fix,
          updated_at: new Date().toISOString(),
        })
        .eq('id', suggestion.id);

      if (error) {
        console.error('Error updating suggestion:', error);
      } else {
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating suggestion:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing && isAuthor) {
    return (
      <Card padding="md" hover={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Type
            </label>
            <Select
              value={editFormData.type}
              onChange={(e) =>
                setEditFormData({ ...editFormData, type: e.target.value as SuggestionType })
              }
              options={SUGGESTION_TYPES.map((t) => ({
                value: t.value,
                label: t.label,
              }))}
            />
          </div>

          <Input
            label="Title"
            value={editFormData.title}
            onChange={(e) =>
              setEditFormData({ ...editFormData, title: e.target.value })
            }
          />

          <Textarea
            label="Description"
            value={editFormData.body}
            onChange={(e) =>
              setEditFormData({ ...editFormData, body: e.target.value })
            }
            rows={4}
          />

          <Textarea
            label="How to Fix — Required"
            value={editFormData.how_to_fix}
            onChange={(e) =>
              setEditFormData({ ...editFormData, how_to_fix: e.target.value })
            }
            rows={4}
          />

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md" hover={false}>
      <div className="space-y-4">
        {/* Header with type and status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SuggestionTypeBadge type={suggestion.type} />
            {isProjectOwner && (
              <select
                value={suggestion.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md border',
                  statusColors[suggestion.status]
                )}
              >
                <option value="open">Open</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="removed">Removed</option>
              </select>
            )}
            {!isProjectOwner && (
              <span
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md border',
                  statusColors[suggestion.status]
                )}
              >
                {suggestion.status.charAt(0).toUpperCase() +
                  suggestion.status.slice(1)}
              </span>
            )}
          </div>

          {isAuthor && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground">
          {suggestion.title}
        </h3>

        {/* Body */}
        <div>
          <MarkdownRenderer content={suggestion.body} />
        </div>

        {/* How to Fix Section */}
        <div className="border-t border-border pt-4">
          <button
            onClick={() => setIsHowToFixExpanded(!isHowToFixExpanded)}
            className="flex items-center justify-between w-full text-left hover:opacity-75 transition-opacity"
          >
            <h4 className="text-base font-semibold text-foreground">
              How to Fix
            </h4>
            <svg
              className={cn(
                'w-5 h-5 text-foreground transition-transform duration-200',
                isHowToFixExpanded && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {isHowToFixExpanded && (
            <div className="mt-3">
              <MarkdownRenderer content={suggestion.how_to_fix} />
            </div>
          )}
        </div>

        {/* Footer with author and date */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted border-t border-border pt-4">
          <div>
            {suggestion.profiles ? (
              <span>
                By{' '}
                <span className="font-medium text-foreground">
                  {suggestion.profiles.display_name ||
                    suggestion.profiles.username}
                </span>
              </span>
            ) : (
              <span className="text-gray-500">[deleted user]</span>
            )}
          </div>
          <span>{formatRelativeDate(suggestion.created_at)}</span>
        </div>
      </div>
    </Card>
  );
}
