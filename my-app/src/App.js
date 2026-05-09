import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import useLocalStorage from './hooks/useLocalStorage';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NoteEditor from './pages/NoteEditor';
import Tasks from './pages/Tasks';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';
import Subpage from './pages/Subpage';
import SubpagesIndex from './pages/SubpagesIndex';
import './App.css';

export default function App() {
  const [notes, setNotes] = useLocalStorage('notes', [
    {
      id: 1,
      title: 'CS300 Final Project',
      content: 'Build a Notion-style productivity app using React.',
      favorite: true,
    },
  ]);

  const [tasks, setTasks] = useLocalStorage('tasks', [
    {
      id: 1,
      text: 'Finish React routing',
      completed: false,
    },
  ]);

  const [pages, setPages] = useLocalStorage('pages', [
    {
      id: 1,
      title: 'Welcome Page',
      content: 'This is your personal subpage — edit and customize it like Notion.',
      parentId: null,
    },
  ]);

  const [folders, setFolders] = useLocalStorage('folders', []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Dashboard notes={notes} tasks={tasks} pages={pages} setPages={setPages} folders={folders} setFolders={setFolders} />}
        />

        <Route
          path="/notes"
          element={<Notes notes={notes} setNotes={setNotes} />}
        />

        <Route
          path="/note/:id"
          element={<NoteEditor notes={notes} setNotes={setNotes} />}
        />

        <Route
          path="/pages"
          element={<SubpagesIndex pages={pages} setPages={setPages} folders={folders} setFolders={setFolders} />}
        />

        <Route
          path="/tasks"
          element={<Tasks tasks={tasks} setTasks={setTasks} />}
        />

        <Route
          path="/favorites"
          element={<Favorites notes={notes} />}
        />

        <Route
          path="/page/:id"
          element={<Subpage pages={pages} setPages={setPages} folders={folders} setFolders={setFolders} />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
