'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Task, TaskStatus } from '@/lib/api';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
});

type FormData = z.infer<typeof schema>;

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

type Props = {
  initial?: Task;
  onSubmit: (data: { title: string; description?: string; status?: TaskStatus }) => void;
  onCancel: () => void;
  submitLabel: string;
};

export function TaskForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      status: (initial?.status as TaskStatus) ?? 'todo',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Title</label>
        <input type="text" className="input-field" {...register('title')} />
        {errors.title && <p className="error-text">{errors.title.message}</p>}
      </div>
      <div>
        <label className="label">Description (optional)</label>
        <textarea rows={3} className="input-field" {...register('description')} />
        {errors.description && <p className="error-text">{errors.description.message}</p>}
      </div>
      <div>
        <label className="label">Status</label>
        <select className="input-field" {...register('status')}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
