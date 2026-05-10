import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import NoteContentPreview from '../components/NoteContentPreview';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

function formatClock(date, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

function formatClockDate(date, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function LocationClock() {
  const fallbackTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [timeZone, setTimeZone] = useState(fallbackTimeZone);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState('Detecting your location');

  useEffect(() => {
    let cancelled = false;

    const applyFallback = (message = 'Showing your local time') => {
      if (cancelled) return;
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      setStatus(message);
    };

    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    if (!navigator.geolocation) {
      applyFallback('Location access unavailable');
      return () => {
        cancelled = true;
        window.clearInterval(timer);
      };
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const apiKey = process.env.REACT_APP_WORLD_TIME_API_KEY;
          if (!apiKey) {
            applyFallback('Showing your local time');
            return;
          }

          const response = await fetch(
            `https://api.api-ninjas.com/v1/worldtime?lat=${coords.latitude}&lon=${coords.longitude}`,
            {
              headers: {
                'X-Api-Key': apiKey,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Unable to load world time');
          }

          const data = await response.json();
          if (cancelled) return;

          setTimeZone(data.timezone || fallbackTimeZone);
          setStatus('Your current local time');
        } catch (error) {
          applyFallback('Using your browser time zone');
        }
      },
      () => {
        applyFallback('Location permission denied');
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 600000,
      }
    );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [fallbackTimeZone]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Local Time</p>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            {formatClock(currentTime, timeZone)}
          </div>
          <p className="mt-1 text-sm text-gray-500">{status}</p>
        </div>

        <div className="sm:text-right">
          <p className="text-sm font-medium text-gray-700">{formatClockDate(currentTime, timeZone)}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">{timeZone}</p>
        </div>
      </div>
    </div>
  );
}

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
        <div className="space-y-3">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">Welcome to DevSpace</h2>
          <LocationClock />
        </div>

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
                <NoteContentPreview
                  html={note.content}
                  className="text-sm text-gray-500 line-clamp-2 whitespace-normal max-w-none"
                />
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
