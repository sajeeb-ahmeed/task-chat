'use client';

import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

export function AIAnswer({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  return (
    <div className="sajib-ai-answer">
      <div className="sajib-ai-markdown">
        <Markdown
          remarkPlugins={[remarkGfm]}
          skipHtml
          disallowedElements={['img', 'input']}
          components={{
            h1: ({ children }) => <h3>{children}</h3>,
            h2: ({ children }) => <h3>{children}</h3>,
            h3: ({ children }) => <h4>{children}</h4>,
            a: ({ href, children }) =>
              href && /^https?:\/\//i.test(href) ? (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ) : (
                <span>{children}</span>
              ),
            table: ({ children }) => (
              <div className="sajib-ai-table" tabIndex={0} role="region" aria-label="Answer table">
                <table>{children}</table>
              </div>
            ),
          }}
        >
          {content}
        </Markdown>
      </div>
      <button
        className="sajib-ai-copy"
        aria-label={copied ? 'Answer copied' : 'Copy answer'}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setCopyError(false);
          } catch {
            setCopyError(true);
          }
        }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy answer'}
      </button>
      {copyError && (
        <span role="status" className="sajib-ai-copy-error">
          Select the text to copy it.
        </span>
      )}
    </div>
  );
}
