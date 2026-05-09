import React, { useMemo } from 'react';

function sanitizeHtml(html) {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html), 'text/html');

  doc.querySelectorAll('script, style, iframe, object, embed').forEach((node) => node.remove());

  doc.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      if (attr.name.startsWith('on')) node.removeAttribute(attr.name);
    });
  });

  return doc.body.innerHTML;
}

export default function NoteContentPreview({ html, className = '' }) {
  const safeHtml = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safeHtml || '<span style="color:#9ca3af;">No content yet...</span>' }}
    />
  );
}
