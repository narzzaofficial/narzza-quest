'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';
import 'katex/dist/katex.min.css';

// Fix AI-generated markdown where "1.\n**Title**" renders as a separate empty
// list item + bold paragraph. Normalizes it to "1. **Title**" on one line.
function normalizeMarkdown(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        // "1.[optional spaces]\n[optional spaces]**" → "1. **"
        .replace(/^(\d+)\.[^\S\n]*\n+[^\S\n]*(\*\*)/gm, '$1. $2');
}

export function MarkdownMessage({ content, streaming }: { content: string; streaming?: boolean }) {
    return (
        <div className="prose-ai">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
                    pre: ({ children }) => <>{children}</>,
                    code: ({ children, className }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        if (match) {
                            return (
                                <SyntaxHighlighter
                                    language={match[1]}
                                    style={oneDark}
                                    customStyle={{ borderRadius: '0.75rem', fontSize: '0.75rem', margin: '0.5rem 0', padding: '0.75rem' }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            );
                        }
                        return <code className="bg-surface rounded px-1.5 py-0.5 text-xs font-mono">{children}</code>;
                    },
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-brand/40 pl-3 italic text-ink-soft my-2">{children}</blockquote>
                    ),
                    h1: ({ children }) => <h1 className="font-extrabold text-base mb-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="font-bold text-sm mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="font-semibold text-sm mb-1">{children}</h3>,
                    a: ({ href, children }) => {
                        const isInternal = href?.startsWith('/');
                        if (isInternal) {
                            return (
                                <Link
                                    href={href!}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-brand-soft text-brand text-[11px] font-bold hover:bg-brand hover:text-white transition-colors no-underline"
                                >
                                    {children}
                                </Link>
                            );
                        }
                        return <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand underline">{children}</a>;
                    },
                }}
            >
                {normalizeMarkdown(content)}
            </ReactMarkdown>
            {streaming && <span className="inline-block w-0.5 h-4 bg-brand/60 ml-0.5 animate-pulse align-middle" />}
        </div>
    );
}
