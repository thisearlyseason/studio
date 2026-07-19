'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Bold, Heading2, Image as ImageIcon, Italic, Link2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { isSafeRichTextUrl, richTextMarkdownToEditorHtml } from '@/lib/rich-text';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
  ariaLabel: string;
};

function serializeNode(node: ChildNode): string {
  if (node.nodeType === 3) return node.textContent || '';
  if (node.nodeType !== 1) return '';
  const element = node as HTMLElement;
  const children = Array.from(element.childNodes).map(serializeNode).join('');
  switch (element.tagName) {
    case 'STRONG':
    case 'B': return `**${children}**`;
    case 'EM':
    case 'I': return `*${children}*`;
    case 'A': {
      const href = element.getAttribute('href') || '';
      return isSafeRichTextUrl(href) ? `[${children}](${href})` : children;
    }
    case 'IMG': {
      const src = element.getAttribute('src') || '';
      const alt = (element.getAttribute('alt') || 'Newsletter image').replace(/[\[\]]/g, '');
      return isSafeRichTextUrl(src) ? `![${alt}](${src})` : '';
    }
    case 'LI': return `- ${children.trim()}\n`;
    case 'H2': return `## ${children.trim()}\n\n`;
    case 'BR': return '\n';
    case 'P':
    case 'DIV': return `${children.trimEnd()}\n\n`;
    default: return children;
  }
}
function serializeEditor(editor: HTMLDivElement): string {
  return Array.from(editor.childNodes)
    .map(serializeNode)
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  minHeightClassName = 'min-h-56',
  ariaLabel,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastEmittedValue = useRef(value);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === lastEmittedValue.current) return;
    editor.innerHTML = richTextMarkdownToEditorHtml(value);
    lastEmittedValue.current = value;
  }, [value]);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    const next = serializeEditor(editorRef.current);
    lastEmittedValue.current = next;
    onChange(next);
  }, [onChange]);

  const runCommand = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    emitChange();
  };

  const addLink = () => {
    const url = window.prompt('Enter the secure link URL (https://):', 'https://');
    if (!url) return;
    if (!isSafeRichTextUrl(url)) {
      toast({ title: 'Invalid Link', description: 'Links must use a valid https:// address.', variant: 'destructive' });
      return;
    }
    runCommand('createLink', url);
  };

  const addImage = () => {
    const url = window.prompt('Enter the public image URL (https://):', 'https://');
    if (!url) return;
    if (!isSafeRichTextUrl(url)) {
      toast({ title: 'Invalid Image', description: 'Images must use a public https:// address.', variant: 'destructive' });
      return;
    }
    const alt = (window.prompt('Describe the image for accessibility:', 'Newsletter image') || 'Newsletter image')
      .replace(/[\[\]]/g, '')
      .slice(0, 200);
    editorRef.current?.focus();
    document.execCommand('insertImage', false, url);
    const images = editorRef.current?.querySelectorAll(`img[src="${CSS.escape(url)}"]`);
    images?.forEach(image => image.setAttribute('alt', alt));
    emitChange();
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2" role="toolbar" aria-label={`${ariaLabel} formatting`}>
        {[
          { label: 'Bold', icon: Bold, action: () => runCommand('bold') },
          { label: 'Italic', icon: Italic, action: () => runCommand('italic') },
          { label: 'Heading', icon: Heading2, action: () => runCommand('formatBlock', 'h2') },
          { label: 'Bullet list', icon: List, action: () => runCommand('insertUnorderedList') },
          { label: 'Link', icon: Link2, action: addLink },
          { label: 'Inline image', icon: ImageIcon, action: addImage },
        ].map(({ label, icon: Icon, action }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={event => event.preventDefault()}
            onClick={action}
            aria-label={label}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Visual editor</span>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        className={`${minHeightClassName} max-h-[640px] overflow-y-auto px-4 py-3 text-sm leading-7 outline-none [&_a]:text-primary [&_a]:underline [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-black [&_img]:mx-auto [&_img]:my-4 [&_img]:max-h-96 [&_img]:max-w-full [&_img]:rounded-xl [&_li]:ml-6 [&_li]:list-disc [&_p]:my-2 empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]`}
        dangerouslySetInnerHTML={{ __html: richTextMarkdownToEditorHtml(value) }}
      />
    </div>
  );
}
