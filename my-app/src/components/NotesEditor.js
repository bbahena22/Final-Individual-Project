import React, { useEffect, useRef, useState } from 'react';

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];

function normalizeLegacyHtml(html) {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html), 'text/html');
  const body = doc.body;

  // Unwrap lists accidentally nested under headings in legacy content.
  body.querySelectorAll('h1 > ul, h1 > ol, h2 > ul, h2 > ol, h3 > ul, h3 > ol').forEach((list) => {
    const heading = list.parentElement;
    if (!heading) return;
    heading.replaceWith(list);
  });

  // Remove empty and broken list shells.
  body.querySelectorAll('ul, ol').forEach((list) => {
    const hasListItems = Array.from(list.children).some((child) => child.tagName === 'LI');
    if (!hasListItems) {
      list.remove();
    }
  });

  body.querySelectorAll('li').forEach((li) => {
    if (!li.textContent?.trim() && !li.querySelector('ul, ol, br')) {
      li.remove();
    }
  });

  return body.innerHTML;
}

function getAnchorElement(anchorNode) {
  if (!anchorNode) return null;
  return anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;
}

export default function NotesEditor({ initialContent = '', onChange }) {
  const editorRef = useRef(null);
  const selectionRef = useRef(null);
  const [content, setContent] = useState(initialContent);
  const [textColor, setTextColor] = useState('#111827');
  const [highlightColor, setHighlightColor] = useState('#fff59d');
  const [toolbarState, setToolbarState] = useState({
    bold: false,
    italic: false,
    underline: false,
    bulletList: false,
    numberList: false,
    fontSize: 16,
  });

  const updateContent = () => {
    const html = editorRef.current?.innerHTML ?? '';
    setContent(html);
    onChange?.(html);
  };

  const syncToolbarState = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) return;
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !editor.contains(anchorNode)) return;
    const anchorEl = getAnchorElement(anchorNode);
    const computedFontSize = anchorEl ? parseInt(window.getComputedStyle(anchorEl).fontSize, 10) : 16;

    setToolbarState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      bulletList: document.queryCommandState('insertUnorderedList'),
      numberList: document.queryCommandState('insertOrderedList'),
      fontSize: Number.isFinite(computedFontSize) ? computedFontSize : 16,
    });
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const editor = editorRef.current;
    if (!editor || !editor.contains(range.commonAncestorContainer)) return;
    selectionRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = selectionRef.current;
    const editor = editorRef.current;

    if (!selection || !range || !editor) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    editor.focus();
    return true;
  };

  const applyCommand = (command, value = null) => {
    if (!restoreSelection()) return;
    document.execCommand(command, false, value);
    updateContent();
    syncToolbarState();
  };

  const applyFontSize = (fontSize) => {
    if (!restoreSelection()) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!range || range.collapsed) return;

    const anchorEl = getAnchorElement(selection.anchorNode);
    const focusEl = getAnchorElement(selection.focusNode);
    const existingSizedSpan = anchorEl?.closest('span[style*="font-size"]');

    if (existingSizedSpan && focusEl && existingSizedSpan.contains(focusEl)) {
      existingSizedSpan.style.fontSize = `${fontSize}px`;
      const nextRange = document.createRange();
      nextRange.selectNodeContents(existingSizedSpan);
      selection.removeAllRanges();
      selection.addRange(nextRange);
      selectionRef.current = nextRange.cloneRange();
      updateContent();
      syncToolbarState();
      return;
    }

    const wrapper = document.createElement('span');
    wrapper.style.fontSize = `${fontSize}px`;

    try {
      range.surroundContents(wrapper);
    } catch (error) {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }

    const nextRange = document.createRange();
    nextRange.selectNodeContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    selectionRef.current = nextRange.cloneRange();

    updateContent();
    syncToolbarState();
  };

  const applyTextColor = (color) => {
    setTextColor(color);
    if (!restoreSelection()) return;
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, color);
    updateContent();
    syncToolbarState();
  };

  const applyHighlightColor = (color) => {
    setHighlightColor(color);
    if (!restoreSelection()) return;
    document.execCommand('styleWithCSS', false, true);
    const success = document.execCommand('hiliteColor', false, color);
    if (!success) {
      document.execCommand('backColor', false, color);
    }
    updateContent();
    syncToolbarState();
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const normalizedIncoming = normalizeLegacyHtml(initialContent);

    if (editor.innerHTML !== normalizedIncoming && document.activeElement !== editor) {
      editor.innerHTML = normalizedIncoming;
      setContent(normalizedIncoming);
      if (normalizedIncoming !== initialContent) {
        onChange?.(normalizedIncoming);
      }
    }
  }, [initialContent, onChange]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.style.setProperty('direction', 'ltr');
    editor.style.setProperty('unicode-bidi', 'normal');
    editor.style.setProperty('text-align', 'left');
    editor.style.setProperty('caret-color', '#111827');

    const onSelectionChange = () => {
      if (document.activeElement === editor) syncToolbarState();
    };

    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  const buttonClass = (active) =>
    `toolbar-btn ${active ? 'toolbar-btn-active' : ''}`;

  const handleKeyDown = (event) => {
    if (event.key !== 'Tab') return;

    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;
    const editor = editorRef.current;
    const anchorEl = getAnchorElement(anchorNode);

    if (!editor || !anchorEl || !editor.contains(anchorEl)) return;

    const inListItem = !!anchorEl.closest('li');
    if (!inListItem) return;

    event.preventDefault();
    if (event.shiftKey) {
      applyCommand('outdent');
    } else {
      applyCommand('indent');
    }
  };

  return (
    <section className="notes-editor-shell">
      <div className="notes-editor-toolbar" onMouseDownCapture={saveSelection}>
        <div className="toolbar-group">
          <label className="toolbar-label" htmlFor="text-color-input">
            Text
          </label>
          <input
            id="text-color-input"
            type="color"
            className="toolbar-color-input"
            value={textColor}
            onMouseDown={saveSelection}
            onFocus={saveSelection}
            onChange={(e) => applyTextColor(e.target.value)}
            aria-label="Text color"
          />
          <label className="toolbar-label" htmlFor="highlight-color-input">
            Highlight
          </label>
          <input
            id="highlight-color-input"
            type="color"
            className="toolbar-color-input"
            value={highlightColor}
            onMouseDown={saveSelection}
            onFocus={saveSelection}
            onChange={(e) => applyHighlightColor(e.target.value)}
            aria-label="Highlight color"
          />
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('bold')}
            className={buttonClass(toolbarState.bold)}
            aria-pressed={toolbarState.bold}
          >
            Bold
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('italic')}
            className={buttonClass(toolbarState.italic)}
            aria-pressed={toolbarState.italic}
          >
            Italic
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('underline')}
            className={buttonClass(toolbarState.underline)}
            aria-pressed={toolbarState.underline}
          >
            Underline
          </button>
        </div>

        <div className="toolbar-group">
          <label className="toolbar-label" htmlFor="font-size-select">
            Font
          </label>
          <select
            id="font-size-select"
            className="toolbar-select"
            value={toolbarState.fontSize}
            onMouseDown={saveSelection}
            onFocus={saveSelection}
            onChange={(e) => applyFontSize(Number(e.target.value))}
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('insertUnorderedList')}
            className={buttonClass(toolbarState.bulletList)}
            aria-pressed={toolbarState.bulletList}
          >
            Bullet List
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('insertOrderedList')}
            className={buttonClass(toolbarState.numberList)}
            aria-pressed={toolbarState.numberList}
          >
            Number List
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('justifyLeft')}
            className="toolbar-btn"
          >
            Left
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('justifyCenter')}
            className="toolbar-btn"
          >
            Center
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('justifyRight')}
            className="toolbar-btn"
          >
            Right
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('undo')}
            className="toolbar-btn"
          >
            Undo
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyCommand('redo')}
            className="toolbar-btn"
          >
            Redo
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        suppressContentEditableWarning
        className="notes-editor-area"
        data-placeholder="Start writing your note..."
        onInput={updateContent}
        onKeyDown={handleKeyDown}
        onMouseUp={() => {
          saveSelection();
          syncToolbarState();
        }}
        onKeyUp={() => {
          saveSelection();
          syncToolbarState();
        }}
        onFocus={() => {
          saveSelection();
          syncToolbarState();
        }}
        onClick={() => {
          saveSelection();
          syncToolbarState();
        }}
      />

      <div className="notes-editor-status">
        <span>HTML saved to the note</span>
        <span>{content ? 'Updated' : 'Empty'}</span>
      </div>
    </section>
  );
}
