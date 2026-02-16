'use client';
import { useState, useEffect } from 'react';

export default function TaskMonitor() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  // 1. Fetch function to see the "Visibility" of tasks [cite: 25]
  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/tasks');
      const data = await res.json();
      setTasks(data || []);
    } catch (err) {
      console.error("Backend not running:", err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // 2. Function for the "Task Entry" module 
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await fetch('http://localhost:8080/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: '', status: 'todo' }),
    });
    
    setTitle(''); // Clear input
    fetchTasks(); // Refresh "Visibility" [cite: 25]
  };

  return (
    <main className="max-w-4xl mx-auto p-8 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Branch Task Monitor</h1>
        <p className="text-gray-600 italic">Centralized system for small business operations [cite: 22, 36]</p>
      </header>

      {/* Task Creation Module  */}
      <section className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
        <form onSubmit={addTask} className="flex gap-4">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done today?"
            className="flex-1 border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg active:scale-95">
            Add Task
          </button>
        </form>
      </section>

      {/* Task Status Tracking Module  */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Active Branch Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No tasks monitored yet.</p>
        ) : (
          tasks.map((task: any) => (
            <div key={task.id} className="bg-white p-5 rounded-lg border-l-8 border-yellow-400 shadow-sm flex justify-between items-center transition-transform hover:scale-[1.01]">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Status: {task.status}</p>
              </div>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">IN PROGRESS</span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}