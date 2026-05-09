import React from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

function SubpagesManager({ pages, setPages }) {
  const navigate = useNavigate();

  const createPage = () => {
    const newPage = { id: Date.now(), title: 'Untitled Page', content: '' };
    setPages([newPage, ...pages]);
    navigate('/pages');
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-700">Create subpages for custom content</div>
        <button onClick={createPage} className="bg-gray-800 text-white px-3 py-1 rounded-xl flex items-center gap-2 hover:bg-gray-700"><Plus size={14}/> New Page</button>
      </div>

      <div className="grid gap-3">
        {pages.map((p) => (
          <Link key={p.id} to={`/page/${p.id}`} className="p-3 border rounded-lg hover:bg-gray-50">{p.title}</Link>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ notes, tasks, pages, setPages, folders, setFolders }) {
  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-4xl font-bold">Welcome to DevSpace</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow border border-gray-300">
            <h3 className="text-lg font-semibold">Total Notes</h3>
            <p className="text-3xl mt-2">{notes.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border border-gray-300">
            <h3 className="text-lg font-semibold">Completed Tasks</h3>
            <p className="text-3xl mt-2">{completedTasks}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border border-gray-300">
            <h3 className="text-lg font-semibold">Favorites</h3>
            <p className="text-3xl mt-2">
              {notes.filter((note) => note.favorite).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border border-gray-300">
          <h3 className="text-xl font-semibold mb-4">Recent Notes</h3>

          <div className="space-y-3">
            {notes.slice(0, 3).map((note) => (
              <div key={note.id} className="border rounded-xl p-3">
                <p className="font-semibold">{note.title}</p>
                <p className="text-sm text-gray-500 truncate">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>

          <div className="bg-white rounded-2xl shadow p-5 border border-gray-300">
          <h3 className="text-xl font-semibold mb-4">Subpages</h3>

          <SubpagesManager pages={pages} setPages={setPages} />
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
