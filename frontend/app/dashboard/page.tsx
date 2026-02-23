'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type TaskStatus,
} from '@/lib/api';
import { TaskForm } from '@/components/TaskForm';
import { TaskFilters } from '@/components/TaskFilters';

export default function DashboardPage() {
  const { user, logout, refreshProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    const { data } = await getTasks({
      search: search || undefined,
      status: statusFilter || undefined,
    });
    setTasks(data?.tasks ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    loadTasks();
  }, [search, statusFilter]);

  const handleCreate = async (payload: { title: string; description?: string; status?: TaskStatus }) => {
    setError('');
    const { data, error: err } = await createTask(payload);
    if (err) {
      setError(err.message);
      return;
    }
    if (data?.task) setTasks((prev) => [data.task!, ...prev]);
    setShowForm(false);
  };

  const handleUpdate = async (
    id: string,
    payload: { title: string; description?: string; status?: TaskStatus }
  ) => {
    setError('');
    const { data, error: err } = await updateTask(id, payload);
    if (err) {
      setError(err.message);
      return;
    }
    if (data?.task) {
      setTasks((prev) => prev.map((t) => (t._id === id ? data.task! : t)));
    }
    setEditingTask(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    const { error: err } = await deleteTask(id);
    if (err) {
      setError(err.message);
      return;
    }
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-sm text-slate-600">
              {user?.name} · {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/profile" className="btn-secondary text-sm">
              Profile
            </Link>
            <button type="button" onClick={logout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Tasks</h2>
          <button type="button" onClick={() => { setShowForm(true); setEditingTask(null); }} className="btn-primary">
            Add task
          </button>
        </div>

        <TaskFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {error && <p className="mb-4 error-text">{error}</p>}

        {showForm && (
          <div className="card mb-6">
            <h3 className="font-medium text-slate-800 mb-4">New task</h3>
            <TaskForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              submitLabel="Create"
            />
          </div>
        )}

        {editingTask && (
          <div className="card mb-6">
            <h3 className="font-medium text-slate-800 mb-4">Edit task</h3>
            <TaskForm
              initial={editingTask}
              onSubmit={(payload) => handleUpdate(editingTask._id, payload)}
              onCancel={() => setEditingTask(null)}
              submitLabel="Save"
            />
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <div className="card text-center text-slate-500 py-12">
            No tasks yet. Click &quot;Add task&quot; to create one.
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task._id} className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-slate-800 truncate">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mt-1">{task.description}</p>
                  )}
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.status === 'done'
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => { setEditingTask(task); setShowForm(false); }}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(task._id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
