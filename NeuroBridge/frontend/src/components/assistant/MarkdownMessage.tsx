import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
  isAssistant?: boolean;
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, ~~strikethrough~~
 */
function parseInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*|__)(.*?)\1|(`)(.*?)\3|(\*|_)(.*?)\5|(~~)(.*?)\7/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      // Bold
      tokens.push(
        <strong key={`b-${match.index}`} className="font-extrabold text-inherit">
          {parseInline(match[2])}
        </strong>
      );
    } else if (match[4] !== undefined) {
      // Inline code
      tokens.push(
        <code
          key={`c-${match.index}`}
          className="px-1.5 py-0.5 rounded-md bg-slate-100/90 text-indigo-700 font-mono text-[11px] border border-slate-200/80 mx-0.5"
        >
          {match[4]}
        </code>
      );
    } else if (match[6] !== undefined) {
      // Italic
      tokens.push(
        <em key={`i-${match.index}`} className="italic text-inherit">
          {parseInline(match[6])}
        </em>
      );
    } else if (match[8] !== undefined) {
      // Strikethrough
      tokens.push(
        <del key={`d-${match.index}`} className="line-through text-slate-400">
          {parseInline(match[8])}
        </del>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}

interface BlockCode {
  type: 'code';
  language: string;
  code: string;
}

interface BlockHeading {
  type: 'h1' | 'h2' | 'h3';
  text: string;
}

interface BlockList {
  type: 'ul' | 'ol';
  items: string[];
}

interface BlockQuote {
  type: 'quote';
  text: string;
}

interface BlockParagraph {
  type: 'p';
  text: string;
}

type Block = BlockCode | BlockHeading | BlockList | BlockQuote | BlockParagraph;

function parseMarkdownBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let currentList: BlockList | null = null;
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block start / end
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'code',
          language: codeLang,
          code: codeBuffer.join('\n'),
        });
        inCodeBlock = false;
        codeLang = '';
        codeBuffer = [];
      } else {
        currentList = null;
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Blank line terminates active list
    if (!trimmed) {
      currentList = null;
      continue;
    }

    // Bullet list (- , * , • )
    const bulletMatch = line.match(/^(\s*)([-*•])\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        currentList = { type: 'ul', items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(bulletMatch[3]);
      continue;
    }

    // Numbered list (1. , 2. )
    const numMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        currentList = { type: 'ol', items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(numMatch[3]);
      continue;
    }

    currentList = null;

    // Blockquote (> )
    if (trimmed.startsWith('>')) {
      blocks.push({ type: 'quote', text: trimmed.replace(/^>\s*/, '') });
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) });
    } else if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2) });
    } else {
      blocks.push({ type: 'p', text: trimmed });
    }
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push({
      type: 'code',
      language: codeLang,
      code: codeBuffer.join('\n'),
    });
  }

  return blocks;
}

function CodeBlockRenderer({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-700/80 bg-[#1A202C] text-slate-100 text-xs font-mono shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 border-b border-slate-700/70 text-[10px] text-slate-400 font-sans font-bold">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownMessage({ content, isAssistant = true }: MarkdownMessageProps) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="space-y-2 leading-relaxed text-xs sm:text-[13px]">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'code':
            return (
              <CodeBlockRenderer
                key={idx}
                code={block.code}
                language={block.language}
              />
            );

          case 'h1':
            return (
              <h3 key={idx} className="text-sm sm:text-base font-black text-inherit mt-2 mb-1">
                {parseInline(block.text)}
              </h3>
            );

          case 'h2':
            return (
              <h4 key={idx} className="text-xs sm:text-sm font-black text-inherit mt-2 mb-0.5">
                {parseInline(block.text)}
              </h4>
            );

          case 'h3':
            return (
              <h5 key={idx} className="text-xs font-extrabold text-inherit mt-1.5 mb-0.5">
                {parseInline(block.text)}
              </h5>
            );

          case 'ul':
            return (
              <ul key={idx} className="space-y-1.5 my-1.5 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        isAssistant ? 'bg-[#2563EB]' : 'bg-white'
                      }`}
                    />
                    <span className="flex-1">{parseInline(item)}</span>
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={idx} className="space-y-1.5 my-1.5 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span className="font-bold text-[11px] opacity-75 shrink-0 min-w-[14px]">
                      {itemIdx + 1}.
                    </span>
                    <span className="flex-1">{parseInline(item)}</span>
                  </li>
                ))}
              </ol>
            );

          case 'quote':
            return (
              <blockquote
                key={idx}
                className="pl-3 py-1 border-l-3 border-blue-400/80 italic text-slate-600 my-1.5 bg-blue-50/40 rounded-r-lg"
              >
                {parseInline(block.text)}
              </blockquote>
            );

          case 'p':
          default:
            return (
              <p key={idx} className="leading-relaxed">
                {parseInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
