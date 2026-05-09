import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function NoteEditor({ notes, setNotes }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const note = notes.find((n) => String(n.id) === String(id));

  if (!note) {
    return (
      <Layout>
        <h2 className="text-2xl font-bold text-gray-900">Note Not Found</h2>
      </Layout>
    );
  }

  const updateNote = (field, value) => {
    setNotes(
      notes.map((n) =>
        n.id === note.id ? { ...n, [field]: value } : n
      )
    );
  };

  const deleteNote = () => {
    setNotes(notes.filter((n) => n.id !== note.id));
    navigate('/notes');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-5">
        <button
          onClick={() => navigate('/notes')}
          className="text-gray-700 hover:text-gray-900"
        >
          ← Back to Notes
        </button>

        <input
          value={note.title}
          onChange={(e) => updateNote('title', e.target.value)}
          className="w-full text-4xl font-bold bg-white text-black outline-none border border-gray-300 rounded-xl px-4 py-3"
        />

        <textarea
          value={note.content}
          onChange={(e) => updateNote('content', e.target.value)}
          placeholder="Start typing your note..."
          className="w-full min-h-[400px] bg-white text-black rounded-2xl shadow p-5 outline-none resize-none border border-gray-300"
        />

        <div className="flex gap-3">
          <button
            onClick={deleteNote}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700"
          >
            Delete Note
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default NoteEditor;
