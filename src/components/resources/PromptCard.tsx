'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';

interface PromptCardProps {
  title: string;
  description: string;
  prompt: string;
  id?: string;
}

export default function PromptCard({ title, description, prompt, id }: PromptCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <Card padding="lg" hover className="flex flex-col" {...(id ? { id } : {})}>
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">{title}</h3>
      <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">{description}</p>

      <div className="flex-grow">
        <pre className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4 text-xs text-stone-700 dark:text-stone-300 overflow-x-auto mb-4 leading-relaxed whitespace-pre-wrap break-words border border-stone-200 dark:border-stone-700">
          {prompt}
        </pre>
      </div>

      <button
        onClick={copyToClipboard}
        className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-200"
      >
        {isCopied ? 'Copied!' : 'Copy to Clipboard'}
      </button>
    </Card>
  );
}
