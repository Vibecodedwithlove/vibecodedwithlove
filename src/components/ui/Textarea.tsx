'use client';

import { useId, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
  autoResize?: boolean;
}

export default function Textarea({
  label,
  error,
  helperText,
  maxLength,
  showCharCount = false,
  autoResize = false,
  className,
  id,
  value,
  onChange,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground mb-2"
        >
          {label}
        </label>
      )}

      <textarea
        ref={textareaRef}
        id={textareaId}
        className={cn(
          'w-full px-4 py-2 bg-input border border-border rounded-lg',
          'text-foreground placeholder-muted',
          'focus-ring outline-none',
          'transition-all duration-200',
          'resize-none',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        {...props}
      />

      <div className="flex justify-between items-start mt-2">
        <div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {helperText && !error && (
            <p className="text-sm text-muted">{helperText}</p>
          )}
        </div>

        {showCharCount && maxLength && (
          <p className="text-xs text-muted">
            {charCount} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
