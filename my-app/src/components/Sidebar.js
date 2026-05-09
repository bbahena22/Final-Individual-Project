import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, StickyNote, CheckSquare, Star, ChevronDown, ChevronRight, MoreHorizontal, Edit2, Trash2, Plus, Copy, Menu } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import NamePromptModal from './NamePromptModal';
import ConfirmModal from './ConfirmModal';

function Sidebar() {
  const [pages, setPages] = useLocalStorage('pages', []);
  const [folders, setFolders] = useLocalStorage('folders', []);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [hiddenSidebar, setHiddenSidebar] = useLocalStorage('sidebarHidden', false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [ctx, setCtx] = useState({ visible: false, x: 0, y: 0, item: null, type: null });
  const [nameDialog, setNameDialog] = useState({ open: false, title: '', label: '', initialValue: '', confirmLabel: 'Save', mode: null, id: null, parentId: null, itemType: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, title: '', message: '', id: null, itemType: null });
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const onContext = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();
    setCtx({ visible: true, x: e.clientX, y: e.clientY, item, type });
  };

  const closeNameDialog = () => {
    setNameDialog({ open: false, title: '', label: '', initialValue: '', confirmLabel: 'Save', mode: null, id: null, parentId: null, itemType: null });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, title: '', message: '', id: null, itemType: null });
  };

  const openNameDialog = (config) => {
    setNameDialog({
      open: true,
      title: config.title,
      label: config.label,
      initialValue: config.initialValue || '',
      confirmLabel: config.confirmLabel || 'Save',
      mode: config.mode,
      id: config.id || null,
      parentId: config.parentId || null,
      itemType: config.itemType || null,
    });
  };

  const renameItem = (id, type) => {
    const item = type === 'page' ? pages.find((x) => x.id === id) : folders.find((x) => x.id === id);
    openNameDialog({
      mode: 'rename',
      title: type === 'page' ? 'Rename Page' : 'Rename Folder',
      label: type === 'page' ? 'Page name' : 'Folder name',
      initialValue: item?.title || '',
      confirmLabel: 'Save',
      id,
      itemType: type,
    });
    setCtx({ visible: false, x: 0, y: 0, item: null, type: null });
  };

  const deleteItem = (id, type) => {
    setDeleteDialog({
      open: true,
      title: type === 'page' ? 'Delete Page' : 'Delete Folder',
      message:
        type === 'page'
          ? 'This page will be permanently removed.'
          : 'This folder will be removed and its pages will be moved to the root level.',
      id,
      itemType: type,
    });
    setCtx({ visible: false, x: 0, y: 0, item: null, type: null });
  };

  const handleDeleteConfirm = () => {
    if (!deleteDialog.id || !deleteDialog.itemType) return;
    if (deleteDialog.itemType === 'page') {
      setPages(pages.filter((x) => x.id !== deleteDialog.id));
      navigate('/');
    } else {
      // soft delete folder: orphan its children
      setFolders(folders.filter((x) => x.id !== deleteDialog.id));
      setPages(pages.map((p) => (p.parentId === deleteDialog.id ? { ...p, parentId: null } : p)));
    }
    closeDeleteDialog();
  };

  const openItem = (id, type) => {
    if (type === 'page') {
      navigate(`/page/${id}`);
    }
    setCtx({ visible: false, x: 0, y: 0, item: null, type: null });
  };

  const expandFolderForPage = useCallback((pageId) => {
    const page = pages.find((p) => p.id === pageId);
    if (page?.parentId) {
      setExpandedFolders((s) => ({ ...s, [page.parentId]: true }));
    }
  }, [pages]);

  useEffect(() => {
    function onGlobalClick() {
      if (ctx.visible) setCtx({ visible: false, x: 0, y: 0, item: null, type: null });
    }

    function onEscape(e) {
      if (e.key === 'Escape') onGlobalClick();
    }

    window.addEventListener('click', onGlobalClick);
    window.addEventListener('contextmenu', onGlobalClick);
    window.addEventListener('keydown', onEscape);

    return () => {
      window.removeEventListener('click', onGlobalClick);
      window.removeEventListener('contextmenu', onGlobalClick);
      window.removeEventListener('keydown', onEscape);
    };
  }, [ctx.visible, expandFolderForPage]);

  const createFolder = () => {
    openNameDialog({
      mode: 'create-folder',
      title: 'Create Folder',
      label: 'Folder name',
      confirmLabel: 'Create',
    });
  };

  const duplicateFolder = (folderId) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;
    const newFolder = { ...folder, id: Date.now(), title: `${folder.title} (copy)` };
    setFolders([...folders, newFolder]);
    // optionally duplicate child pages too
    const childPages = pages.filter((p) => p.parentId === folderId);
    const duplicatedPages = childPages.map((p) => ({
      ...p,
      id: Date.now() + Math.random(),
      parentId: newFolder.id,
    }));
    setPages([...pages, ...duplicatedPages]);
    setCtx({ visible: false, x: 0, y: 0, item: null, type: null });
  };

  const createPageInFolder = (parentId) => {
    openNameDialog({
      mode: 'create-page',
      title: 'Create Page',
      label: 'Page name',
      confirmLabel: 'Create',
      parentId,
    });
    setCtx({ visible: false, x: 0, y: 0, item: null, type: null });
  };

  const handleNameSubmit = (name) => {
    if (nameDialog.mode === 'create-folder') {
      const f = { id: Date.now(), title: name };
      setFolders([...folders, f]);
    }

    if (nameDialog.mode === 'create-page') {
      const newPage = { id: Date.now(), title: name, content: '', blocks: [], parentId: nameDialog.parentId };
      setPages([newPage, ...pages]);
      setExpandedFolders((s) => ({ ...s, [nameDialog.parentId]: true }));
      navigate(`/page/${newPage.id}`);
    }

    if (nameDialog.mode === 'rename' && nameDialog.itemType === 'page') {
      setPages(pages.map((x) => (x.id === nameDialog.id ? { ...x, title: name } : x)));
    }

    if (nameDialog.mode === 'rename' && nameDialog.itemType === 'folder') {
      setFolders(folders.map((x) => (x.id === nameDialog.id ? { ...x, title: name } : x)));
    }

    closeNameDialog();
  };

  const toggleFolder = (id) => {
    setExpandedFolders((s) => ({ ...s, [id]: !s[id] }));
  };

  const rootPages = pages.filter((p) => !p.parentId);
  const pagesByFolder = {};
  folders.forEach((f) => {
    pagesByFolder[f.id] = pages.filter((p) => p.parentId === f.id);
  });

  useEffect(() => {
    const match = location.pathname.match(/^\/page\/(\d+)$/);
    if (!match) return;

    const pageId = Number(match[1]);
    expandFolderForPage(pageId);
  }, [location.pathname, expandFolderForPage]);

  const renderFolderTree = (folderId) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return null;
    const isExpanded = expandedFolders[folderId];
    const childPages = pagesByFolder[folderId] || [];

    return (
      <div key={folderId}>
        <div className="flex items-center justify-between ml-6 hover:bg-black rounded px-1 py-1">
          <button onClick={() => toggleFolder(folderId)} className="p-0 transition-transform duration-300">
            <ChevronRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
          </button>
          <span className="text-sm text-white flex-1">📁 {folder.title}</span>
          <button onClick={() => createPageInFolder(folderId)} className="p-1 text-gray-300 hover:text-white" title="Add page to folder">
            <Plus size={14} />
          </button>
          <button onClick={(e) => onContext(e, folder, 'folder')} className="p-1 text-gray-300 hover:text-white">
            <MoreHorizontal size={14} />
          </button>
        </div>

        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isExpanded ? '1000px' : '0px',
          }}
        >
          <div className="ml-8">
            {childPages.map((p) => (
              <div key={p.id} className="flex items-center justify-between hover:bg-black rounded px-1 py-1">
                <Link
                  to={`/page/${p.id}`}
                  onClick={() => expandFolderForPage(p.id)}
                  className="text-sm text-white hover:text-gray-200 truncate mr-2"
                >
                  • {p.title}
                </Link>
                <button onClick={(e) => onContext(e, p, 'page')} className="p-1 text-gray-300 hover:text-white">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const isVisible = !hiddenSidebar || hoverExpanded;
  const widthClass = isVisible ? 'w-64' : 'w-12';

  const toggleSidebar = () => setHiddenSidebar((value) => !value);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => hiddenSidebar && setHoverExpanded(true)}
      onMouseLeave={() => hiddenSidebar && setHoverExpanded(false)}
      className={`${widthClass} bg-black text-white p-5 flex flex-col gap-4 min-h-screen relative border-r border-gray-800 transition-all duration-200 overflow-hidden`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute left-2 top-4 z-40 h-10 w-10 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
        title={hiddenSidebar ? 'Show sidebar' : 'Hide sidebar'}
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center justify-between pl-12">
        {isVisible ? (
          <h1 className="text-2xl font-bold">DevSpace</h1>
        ) : (
          <div className="flex items-center justify-center w-full">
            <Home size={18} />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:text-gray-300">
            <Home size={18} /> <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-1">
            {!collapsed && (
              <button onClick={createFolder} className="p-1 text-gray-300 hover:text-white" title="New Folder">
                <Plus size={16} />
              </button>
            )}
            <button onClick={() => setCollapsed((s) => !s)} className="p-1 hover:text-gray-300 transition-transform duration-300">
              <ChevronDown size={18} className={`transition-transform duration-300 ${collapsed ? '-rotate-90' : 'rotate-0'}`} />
            </button>
          </div>
        </div>

        {!collapsed && isVisible && (
          <>
            <div className="mt-2 ml-6 flex flex-col gap-1">
              {rootPages.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <Link
                    to={`/page/${p.id}`}
                    onClick={() => expandFolderForPage(p.id)}
                    className="text-sm text-white hover:text-gray-200 truncate mr-2"
                  >
                    • {p.title}
                  </Link>
                  <button onClick={(e) => onContext(e, p, 'page')} className="p-1 text-gray-300 hover:text-white">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              ))}

              {folders.map((f) => renderFolderTree(f.id))}
            </div>
          </>
        )}
      </div>

      <Link to="/notes" className="flex items-center gap-2 hover:text-gray-300">
        <StickyNote size={18} />
        <span className={`${isVisible ? '' : 'hidden'}`}>Notes</span>
      </Link>

      <Link to="/tasks" className="flex items-center gap-2 hover:text-gray-300">
        <CheckSquare size={18} />
        <span className={`${isVisible ? '' : 'hidden'}`}>Tasks</span>
      </Link>

      <Link to="/favorites" className="flex items-center gap-2 hover:text-gray-300">
        <Star size={18} />
        <span className={`${isVisible ? '' : 'hidden'}`}>Favorites</span>
      </Link>

      {ctx.visible && (
        <div
          className="absolute z-50 bg-white text-black rounded shadow-lg w-44"
          style={{ left: ctx.x, top: ctx.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {ctx.type === 'page' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); renameItem(ctx.item.id, 'page'); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-gray-900">
                <Edit2 size={14} /> Rename
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteItem(ctx.item.id, 'page'); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-gray-900">
                <Trash2 size={14} /> Delete
              </button>
              <button onClick={(e) => { e.stopPropagation(); openItem(ctx.item.id, 'page'); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-gray-900">
                Open
              </button>
            </>
          )}
          {ctx.type === 'folder' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); renameItem(ctx.item.id, 'folder'); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-gray-900">
                <Edit2 size={14} /> Rename
              </button>
              <button onClick={(e) => { e.stopPropagation(); duplicateFolder(ctx.item.id); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-gray-900">
                <Copy size={14} /> Duplicate
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteItem(ctx.item.id, 'folder'); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-gray-900">
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      )}

      <NamePromptModal
        open={nameDialog.open}
        title={nameDialog.title}
        label={nameDialog.label}
        initialValue={nameDialog.initialValue}
        confirmLabel={nameDialog.confirmLabel}
        onSubmit={handleNameSubmit}
        onCancel={closeNameDialog}
      />

      <ConfirmModal
        open={deleteDialog.open}
        title={deleteDialog.title}
        message={deleteDialog.message}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}

export default Sidebar;
