import React from 'react';
import Layout from '../components/Layout';

function Favorites({ notes }) {
  const favorites = notes.filter((note) => note.favorite);

  return (
    <Layout>
      <div>
        <h2 className="text-3xl font-bold mb-5">My Favorites ⭐</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {favorites.map((note) => (
            <div key={note.id} className="bg-white p-5 rounded-2xl shadow border border-gray-300">
              <h3 className="font-bold text-lg text-black">{note.title}</h3>
              <p className="text-black/70 mt-2">{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Favorites;
