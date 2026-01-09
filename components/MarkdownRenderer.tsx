import React from 'react';

// A simple regex-based parser to avoid heavy dependencies for this demo.
// In a real production app, use 'react-markdown'.

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split by newlines to handle paragraphs
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2 text-sm md:text-base leading-relaxed">
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} className="h-2" />;
        
        // Handle bullet points
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
           return (
             <div key={i} className="flex items-start ml-2">
               <span className="mr-2 text-primary">•</span>
               <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^[\*\-] /, '')) }} />
             </div>
           );
        }

        // Handle numbered lists
        if (/^\d+\.\s/.test(line.trim())) {
             return (
             <div key={i} className="flex items-start ml-2">
               <span className="mr-2 text-primary font-bold">{line.match(/^\d+\./)?.[0]}</span>
               <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\.\s/, '')) }} />
             </div>
           );
        }

        // Standard paragraph
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
      })}
    </div>
  );
};

// Helper to handle bold (**text**) and italic (*text*)
const formatInline = (text: string): string => {
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded text-pink-600 font-mono text-xs">$1</code>'); // Inline code
    
  return formatted;
};

export default MarkdownRenderer;