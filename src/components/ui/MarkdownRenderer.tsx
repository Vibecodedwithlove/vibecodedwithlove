'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm md:prose-base', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-6 mb-4"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-2xl md:text-3xl font-heading font-bold text-foreground mt-5 mb-3"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-xl md:text-2xl font-heading font-bold text-foreground mt-4 mb-3"
              {...props}
            />
          ),
          h4: ({ ...props }) => (
            <h4
              className="text-lg md:text-xl font-heading font-bold text-foreground mt-4 mb-2"
              {...props}
            />
          ),
          h5: ({ ...props }) => (
            <h5
              className="text-base md:text-lg font-heading font-bold text-foreground mt-3 mb-2"
              {...props}
            />
          ),
          h6: ({ ...props }) => (
            <h6
              className="font-heading font-bold text-foreground mt-3 mb-2"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p className="text-foreground leading-relaxed mb-4" {...props} />
          ),
          a: ({ href, ...props }) => {
            // Only allow safe URL protocols to prevent javascript: XSS
            const safeHref = href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/') || href.startsWith('mailto:'))
              ? href
              : '#';
            return (
              <a
                href={safeHref}
                className="text-warmPrimary hover:text-warmPrimaryDark underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            );
          },
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-inside text-foreground space-y-2 mb-4"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside text-foreground space-y-2 mb-4"
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li className="text-foreground" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-warmPrimary pl-4 italic text-muted my-4"
              {...props}
            />
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code: (props: any) => {
            const { inline, ...rest } = props;
            if (inline) {
              return (
                <code
                  className="bg-input text-foreground rounded px-1.5 py-0.5 font-mono text-sm"
                  {...rest}
                />
              );
            }
            return <code {...rest} />;
          },
          pre: ({ ...props }) => (
            <pre
              className="bg-input border border-border rounded-lg p-4 overflow-x-auto my-4"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="w-full border-collapse border border-border"
                {...props}
              />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-input" {...props} />
          ),
          tbody: ({ ...props }) => <tbody {...props} />,
          tr: ({ ...props }) => (
            <tr className="border-b border-border hover:bg-input/50" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="border border-border px-4 py-2" {...props} />
          ),
          th: ({ ...props }) => (
            <th
              className="border border-border px-4 py-2 font-bold text-foreground bg-input"
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="border-t border-border my-6" {...props} />
          ),
          img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
            // Only allow https images to prevent tracking pixels and data exfiltration
            const safeSrc = src && src.startsWith('https://') ? src : '';
            if (!safeSrc) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="max-w-full h-auto rounded-lg my-4"
                alt={alt || ''}
                src={safeSrc}
                referrerPolicy="no-referrer"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
