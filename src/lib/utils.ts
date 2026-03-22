/**
 * Utility functions
 */

/**
 * Convert a title to a URL-safe slug
 * @example
 * generateSlug("My Awesome Project") // "my-awesome-project"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Format an ISO date string to a readable format
 * @example
 * formatDate("2026-03-22T10:30:00Z") // "Mar 22, 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date as a relative time string
 * @example
 * formatRelativeDate("2026-03-20T10:30:00Z") // "2 days ago"
 * formatRelativeDate("2026-03-22T10:25:00Z") // "5 minutes ago"
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return seconds === 1 ? 'just now' : `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Truncate text to a maximum length with ellipsis
 * @example
 * truncateText("This is a very long string", 10) // "This is a ..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Merge class names conditionally
 * Similar to clsx or classnames library
 * @example
 * cn('px-2', isActive && 'bg-blue-500', undefined, false) // "px-2 bg-blue-500"
 */
export function cn(
  ...classes: (string | undefined | null | false)[]
): string {
  return classes
    .filter((cls) => typeof cls === 'string' && cls.length > 0)
    .join(' ');
}

/**
 * Get Tailwind background color for an AI tool
 * @example
 * getAiToolColor('ChatGPT') // "bg-green-100"
 */
export function getAiToolColor(tool: string): string {
  const colors: Record<string, string> = {
    'ChatGPT': 'bg-green-100 text-green-800',
    'Claude': 'bg-cyan-100 text-cyan-800',
    'Gemini': 'bg-blue-100 text-blue-800',
    'Copilot': 'bg-purple-100 text-purple-800',
    'Cursor': 'bg-orange-100 text-orange-800',
    'v0': 'bg-pink-100 text-pink-800',
    'Bolt': 'bg-yellow-100 text-yellow-800',
    'Replit': 'bg-rose-100 text-rose-800',
    'GitHub Copilot': 'bg-gray-100 text-gray-800',
    'Perplexity': 'bg-indigo-100 text-indigo-800',
    'Together AI': 'bg-lime-100 text-lime-800',
    'DeepSeek': 'bg-red-100 text-red-800',
    'Qwen': 'bg-amber-100 text-amber-800',
    'LLaMA': 'bg-fuchsia-100 text-fuchsia-800',
    'Mixtral': 'bg-teal-100 text-teal-800',
  };

  return colors[tool] || 'bg-gray-100 text-gray-800';
}

/**
 * Get Tailwind color classes for suggestion type
 * @example
 * getSuggestionTypeColor('security') // "bg-red-100 text-red-800 border-red-300"
 */
export function getSuggestionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'security': 'bg-red-100 text-red-800 border-red-300',
    'performance': 'bg-blue-100 text-blue-800 border-blue-300',
    'ux': 'bg-purple-100 text-purple-800 border-purple-300',
    'bug': 'bg-orange-100 text-orange-800 border-orange-300',
    'general': 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
}
