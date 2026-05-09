import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import useLocalStorage from '../hooks/useLocalStorage';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

function Subpage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useLocalStorage('pages', []);

  const page = useMemo(() => pages.find((p) => String(p.id) === String(id)), [pages, id]);

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [background, setBackground] = useState('');
  const [defaultFont, setDefaultFont] = useState('inherit');
  const [parentId, setParentId] = useState(null);
  const [emoji, setEmoji] = useState('📄');
  const [profileImage, setProfileImage] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [showBackgroundButton, setShowBackgroundButton] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(280);
  const [resizing, setResizing] = useState(null);
  const [leftNotes, setLeftNotes] = useState(['Enter text or type "/" for commands']);
  const [rightNotes, setRightNotes] = useState(['Enter text or type "/" for commands']);
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const loadedPageId = useRef(null);
  const saveTimerRef = useRef(null);

  const blocknoteEditor = useMemo(() => BlockNoteEditor.create(), []);
  const leftEditor = useMemo(() => BlockNoteEditor.create(), []);
  const rightEditor = useMemo(() => BlockNoteEditor.create(), []);

  const whiteTheme = useMemo(
    () => ({
      colors: {
        editor: { text: '#000000', background: '#ffffff' },
        menu: { text: '#000000', background: '#ffffff' },
        tooltip: { text: '#000000', background: '#ffffff' },
        hovered: { text: '#000000', background: '#f3f4f6' },
        selected: { text: '#000000', background: '#e5e7eb' },
        disabled: { text: '#6b7280', background: '#ffffff' },
        shadow: '#d1d5db',
        border: '#d1d5db',
        sideMenu: '#d1d5db',
      },
      borderRadius: 6,
      fontFamily: 'inherit',
    }),
    []
  );

  const blocknoteTheme = whiteTheme;

  useEffect(() => {
    if (!page) return;
    if (loadedPageId.current === page.id) return;
    loadedPageId.current = page.id;
    setTitle(page.title || 'Untitled');

    if (page.blocks && Array.isArray(page.blocks)) {
      setBlocks(page.blocks);
    } else if (typeof page.content === 'string') {
      setBlocks([{ id: Date.now(), type: 'text', text: page.content }]);
    } else {
      setBlocks(page.blocks || []);
    }

    setBackground(page.background || '');
    setDefaultFont(page.defaultFont || 'inherit');
    setParentId(page.parentId || null);
    setEmoji(page.emoji || '📄');
    setProfileImage(page.profileImage || null);
  }, [page]);

  useEffect(() => {
    if (!page) return;
    if (loadedPageId.current !== page.id) return;
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      setPages((currentPages) =>
        currentPages.map((p) => {
          if (String(p.id) !== String(page.id)) return p;

          const sameTitle = p.title === title;
          const sameBlocks = JSON.stringify(p.blocks || []) === JSON.stringify(blocks);
          const sameBackground = (p.background || '') === background;
          const sameFont = (p.defaultFont || 'inherit') === defaultFont;
          const sameParent = (p.parentId || null) === parentId;

          if (sameTitle && sameBlocks && sameBackground && sameFont && sameParent) {
            return p;
          }

          return { ...p, title, blocks, background, defaultFont, parentId, emoji, profileImage };
        })
      );
    }, 150);

    return () => window.clearTimeout(saveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, blocks, background, defaultFont, parentId, emoji, profileImage]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;

      if (resizing === 'left') {
        setLeftSidebarWidth(Math.max(180, Math.min(420, mouseX)));
      }

      if (resizing === 'right') {
        const rightWidth = containerRect.right - e.clientX;
        setRightSidebarWidth(Math.max(180, Math.min(420, rightWidth)));
      }
    };

    const handleMouseUp = () => setResizing(null);

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const horizontalThreshold = 220;
      const verticalThreshold = 180;
      const distanceFromRightEdge = window.innerWidth - e.clientX;
      const distanceFromLeftEdge = e.clientX;
      const distanceFromTopEdge = e.clientY;
      setShowBackButton(distanceFromLeftEdge <= horizontalThreshold || distanceFromTopEdge <= verticalThreshold);
      setShowBackgroundButton(
        distanceFromRightEdge <= horizontalThreshold || distanceFromTopEdge <= verticalThreshold
      );
    };

    handleMouseMove({ clientX: window.innerWidth });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!page) {
    return (
      <Layout>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
          <button onClick={() => navigate('/pages')} className="text-gray-700 hover:text-gray-900">← Back to Pages</button>
        </div>
      </Layout>
    );
  }

  const addTextBlock = () => {
    const b = { id: Date.now(), type: 'text', text: '' };
    setBlocks((s) => [...s, b]);
    try {
      if (editorRef.current && typeof editorRef.current.insertText === 'function') {
        editorRef.current.insertText('');
      } else if (editorRef.current && typeof editorRef.current.insert === 'function') {
        editorRef.current.insert({ type: 'paragraph', children: [{ text: '' }] });
      }
    } catch (e) {
      // ignore
    }
  };

  const addImageBlock = () => {
    const url = window.prompt('Image URL');
    if (!url) return;
    const b = { id: Date.now(), type: 'image', src: url };
    setBlocks((s) => [...s, b]);
    try {
      if (editorRef.current && typeof editorRef.current.insertImage === 'function') {
        editorRef.current.insertImage(url);
      } else if (editorRef.current && typeof editorRef.current.insert === 'function') {
        editorRef.current.insert({ type: 'image', src: url });
      }
    } catch (e) {
      // ignore
    }
  };

  const clearBackground = () => setBackground('');

  const updateBlock = (id, patch) => setBlocks((s) => s.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const removeBlock = (id) => setBlocks((s) => s.filter((b) => b.id !== id));

  const changeFont = (font) => setDefaultFont(font || 'inherit');

  const addLeftNote = () => {
    setLeftNotes((current) => [...current, 'Enter text or type "/" for commands']);
  };

  const addRightNote = () => {
    setRightNotes((current) => [...current, 'Enter text or type "/" for commands']);
  };

  const handleBlocknoteChange = (val) => {
    let text = '';

    if (val && typeof val === 'object' && val.document) {
      const documentBlocks = val.document;
      text = documentBlocks
        .map((b) => {
          if (typeof b.content === 'string') return b.content;
          if (Array.isArray(b.content)) return b.content.map((c) => c.text || '').join('');
          return '';
        })
        .join('\n\n');
    } else if (typeof val === 'string') {
      text = val;
    }

    setBlocks([{ id: Date.now(), type: 'text', text }]);
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') setProfileImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') setBackground(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileInsert = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        const b = { id: Date.now(), type: 'image', src: dataUrl };
        setBlocks((s) => [...s, b]);
        try {
          if (editorRef.current && typeof editorRef.current.insertImage === 'function') {
            editorRef.current.insertImage(dataUrl);
          } else if (editorRef.current && typeof editorRef.current.insert === 'function') {
            editorRef.current.insert({ type: 'image', src: dataUrl });
          }
        } catch (err) {
          // ignore
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <div className="w-full space-y-5">
        {/* Page Header with Profile/Emoji */}
        <div
          className={`-mx-6 -mt-6 border border-gray-300 p-0 shadow-sm relative min-h-[280px] overflow-hidden ${
            background ? '' : 'bg-gradient-to-r from-blue-50 to-indigo-50'
          }`}
          style={
            background
              ? {
                  backgroundImage: `url(${background})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          <button
            onClick={() => navigate('/')}
            onMouseEnter={() => setShowBackButton(true)}
            onMouseLeave={() => setShowBackButton(false)}
            className="absolute top-4 left-4 z-30 text-gray-700 hover:text-gray-900 bg-white/90 hover:bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm transition-all duration-300"
            style={{
              transform: `translateX(${showBackButton ? '0' : '-120%'})`,
              opacity: showBackButton ? 1 : 0.65,
            }}
          >
            ← Back
          </button>

          <button
            onClick={() => document.getElementById('background-image-input')?.click()}
            onMouseEnter={() => setShowBackgroundButton(true)}
            onMouseLeave={() => setShowBackgroundButton(false)}
            className="absolute top-4 right-4 z-20 px-3 py-2 rounded-lg border border-gray-300 bg-white/90 hover:bg-white text-sm text-gray-700 transition-all duration-300 shadow-sm"
            style={{
              transform: `translateX(${showBackgroundButton ? '0' : '120%'})`,
              opacity: showBackgroundButton ? 1 : 0.65,
            }}
          >
            + Background Image
          </button>

          <div className="absolute bottom-4 left-4 flex-shrink-0 z-20">
            <div className="w-48 rounded-2xl bg-white border-4 border-gray-300 flex flex-col shadow-md overflow-hidden">
              <div
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-48 h-40 flex items-center justify-center text-7xl font-bold bg-white hover:bg-gray-100 transition cursor-pointer relative"
              >
                {profileImage ? (
                  <img src={profileImage} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{emoji}</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition rounded-tl-xl">
                  <span className="text-xl opacity-0 hover:opacity-100 transition">+</span>
                </div>
              </div>

              {/* Profile Menu */}
              {profileMenuOpen && (
                <div className="absolute top-20 left-0 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      document.getElementById('profile-image-input')?.click();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2"
                  >
                    📤 Upload from Computer
                  </button>
                  <button
                    onClick={() => {
                      const newEmoji = window.prompt('Enter an emoji or text:', emoji);
                      if (newEmoji !== null && newEmoji !== '') setEmoji(newEmoji);
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2"
                  >
                    😀 Change Emoji
                  </button>
                  <button
                    onClick={() => {
                      const color = window.prompt('Enter a color (hex code, e.g., #FF5733):', '#3B82F6');
                      if (color !== null && color !== '') setProfileImage(color);
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    🎨 Select Color
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
                id="profile-image-input"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
                id="background-image-input"
              />
            </div>

            {profileMenuOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileMenuOpen(false)}
              />
            )}
          </div>
        </div>

        <div className="space-y-5 mt-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold bg-transparent text-gray-900 outline-none border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 pb-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <button onClick={() => setShowLeftSidebar(!showLeftSidebar)} className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100" title="Toggle left sidebar">◀</button>
            <button onClick={() => setShowRightSidebar(!showRightSidebar)} className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100" title="Toggle right sidebar">▶</button>
          </div>
        </div>

        {/* BlockNote editor with matching side panels */}
        <div ref={containerRef} className="mb-4 w-full flex gap-0 border border-gray-200 rounded-lg overflow-hidden bg-white" style={{ minHeight: '600px', userSelect: resizing ? 'none' : 'auto' }}>
          {showLeftSidebar && (
            <>
              <div style={{ width: `${leftSidebarWidth}px` }} className="border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
                <div className="flex-grow p-0 overflow-hidden">
                  <BlockNoteView editor={leftEditor} theme={blocknoteTheme} onChange={() => {}} />
                </div>
              </div>

              <div onMouseDown={() => setResizing('left')} className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition" />
            </>
          )}

          <div className="flex-grow min-w-0 overflow-hidden">
            <BlockNoteView editor={blocknoteEditor} theme={blocknoteTheme} onChange={handleBlocknoteChange} />
          </div>

          {showRightSidebar && (
            <>
              <div onMouseDown={() => setResizing('right')} className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition" />

              <div style={{ width: `${rightSidebarWidth}px` }} className="border-l border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
                <div className="flex-grow p-0 overflow-hidden">
                  <BlockNoteView editor={rightEditor} theme={blocknoteTheme} onChange={() => {}} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Subpage;
