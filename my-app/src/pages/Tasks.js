import React, { useState } from 'react';
import Layout from '../components/Layout';

function Tasks({ tasks, setTasks }) {
  const [taskInput, setTaskInput] = useState('');

  const addTask = () => {
    if (!taskInput.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: taskInput,
        completed: false,
      },
    ]);

    setTaskInput('');
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-5 max-w-2xl">
        <h2 className="text-3xl font-bold">Tasks</h2>

        <div className="flex gap-3">
          <input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 p-3 rounded-xl border border-gray-300 bg-white text-black"
          />

          <button
            onClick={addTask}
            className="bg-gray-800 text-white px-4 rounded-xl hover:bg-gray-700"
          >
            Add
          </button>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow p-4 flex items-center gap-3 border border-gray-300"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />

              <p
                className={task.completed ? 'line-through text-gray-400' : ''}
              >
                {task.text}
              </p>

              <button
                onClick={() => removeTask(task.id)}
                className="ml-auto h-8 w-8 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition"
                aria-label="Remove task"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Tasks;
