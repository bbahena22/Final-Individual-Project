import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import Layout from '../components/Layout';

function Notes({ notes, setNotes }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredNotes = useMemo(() => {
    return notes.filter((note) =>
      note.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [notes, search]);

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      favorite: false,
    };

    setNotes([newNote, ...notes]);
    navigate(`/note/${newNote.id}`);
  };

  const toggleFavorite = (id) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? { ...note, favorite: !note.favorite }
          : note
      )
    );
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">My Notes</h2>

          <button
            onClick={createNote}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-700"
          >
            <Plus size={18} /> New Note
          </button>
        </div>

        <div className="bg-white rounded-xl p-3 flex items-center gap-2 shadow border border-gray-300">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="outline-none flex-1 text-black"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl shadow p-5 border border-gray-300 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-black">{note.title}</h3>

                <button onClick={() => toggleFavorite(note.id)}>
                  {note.favorite ? '⭐' : '☆'}
                </button>
              </div>

              <p className="text-black/70 line-clamp-3">
                {note.content || 'No content yet...'}
              </p>

              <button
                onClick={() => navigate(`/note/${note.id}`)}
                className="mt-4 text-gray-800 font-semibold"
              >
                Open Note →
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Notes;
