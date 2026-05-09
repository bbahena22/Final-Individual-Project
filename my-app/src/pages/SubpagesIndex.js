import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderPlus, ChevronDown, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import NamePromptModal from '../components/NamePromptModal';

function SubpagesIndex({ pages, setPages, folders, setFolders }) {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [nameDialog, setNameDialog] = useState({ open: false, title: '', label: '', initialValue: '', confirmLabel: 'Save', mode: null, parentId: null });
  const navigate = useNavigate();

  const closeNameDialog = () => {
    setNameDialog({ open: false, title: '', label: '', initialValue: '', confirmLabel: 'Save', mode: null, parentId: null });
  };

  const openNameDialog = (config) => {
    setNameDialog({
      open: true,
      title: config.title,
      label: config.label,
      initialValue: config.initialValue || '',
      confirmLabel: config.confirmLabel || 'Save',
      mode: config.mode,
      parentId: config.parentId || null,
    });
  };

  const createPage = (parentId = null) => {
    openNameDialog({
      mode: 'create-page',
      title: 'Create Page',
      label: 'Page name',
      confirmLabel: 'Create',
      parentId,
    });
  };

  const createFolder = () => {
    openNameDialog({
      mode: 'create-folder',
      title: 'Create Folder',
      label: 'Folder name',
      confirmLabel: 'Create',
    });
  };

  const handleNameSubmit = (name) => {
    if (nameDialog.mode === 'create-page') {
      const newPage = { id: Date.now(), title: name, content: '', blocks: [], parentId: nameDialog.parentId };
      setPages([newPage, ...pages]);
      if (nameDialog.parentId) {
        setExpandedFolders((s) => ({ ...s, [nameDialog.parentId]: true }));
      }
      navigate(`/page/${newPage.id}`);
    }

    if (nameDialog.mode === 'create-folder') {
      const f = { id: Date.now(), title: name };
      setFolders([...folders, f]);
    }

    closeNameDialog();
  };

  const toggleFolder = (id) => {
    setExpandedFolders((s) => ({ ...s, [id]: !s[id] }));
  };

  const rootPages = pages.filter((p) => !p.parentId);

  const renderFolderSection = (folderId) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return null;
    const isExpanded = expandedFolders[folderId];
    const childPages = pages.filter((p) => p.parentId === folderId);

    return (
      <div key={folderId} className="border border-gray-300 rounded-lg p-3 mb-3 bg-white">
        <div className="flex justify-between items-center">
          <button onClick={() => toggleFolder(folderId)} className="flex items-center gap-2 text-gray-900">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <span className="font-semibold">📁 {folder.title}</span>
          </button>
          <button onClick={() => createPage(folderId)} className="px-2 py-1 text-sm bg-gray-200 text-gray-900 rounded hover:bg-gray-300">
            <Plus size={14} className="inline mr-1" /> Add Page
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-2 ml-4">
            {childPages.map((p) => (
              <Link key={p.id} to={`/page/${p.id}`} className="block p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-gray-900">
                <div className="font-semibold text-black">{p.title}</div>
                <div className="text-sm text-black/70">{(p.content || '').slice(0, 60)}</div>
              </Link>
            ))}
            {childPages.length === 0 && <div className="text-sm text-black/60">No pages in this folder</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-5 max-w-3xl">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Pages</h2>
          <div className="flex gap-2">
            <button onClick={() => createPage()} className="bg-gray-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-700">
              <Plus size={16} /> New Page
            </button>
            <button onClick={createFolder} className="bg-gray-300 text-gray-900 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-400">
              <FolderPlus size={16} /> New Folder
            </button>
          </div>
        </div>

        {/* Root pages */}
        {rootPages.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Root Pages</h3>
            <div className="grid gap-3">
              {rootPages.map((p) => (
                <Link key={p.id} to={`/page/${p.id}`} className="p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-gray-900">
                  <div className="font-semibold text-black">{p.title}</div>
                  <div className="text-sm text-black/70">{(p.content || '').slice(0, 80)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Folders with pages */}
        {folders.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Folders</h3>
            {folders.map((f) => renderFolderSection(f.id))}
          </div>
        )}

        {pages.length === 0 && folders.length === 0 && (
          <div className="text-center text-black/60 mt-10">No pages or folders - create one to get started!</div>
        )}
      </div>

      <NamePromptModal
        open={nameDialog.open}
        title={nameDialog.title}
        label={nameDialog.label}
        initialValue={nameDialog.initialValue}
        confirmLabel={nameDialog.confirmLabel}
        onSubmit={handleNameSubmit}
        onCancel={closeNameDialog}
      />
    </Layout>
  );
}

export default SubpagesIndex;
