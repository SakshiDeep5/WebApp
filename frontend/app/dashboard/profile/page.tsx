'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/api';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, token, setAuth } = useAuth();
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError('');
    setSuccess(false);
    const { data: res, error } = await updateProfile(data);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    if (res?.user && token) {
      setAuth(res.user, token);
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="text-primary-600 hover:underline font-medium">
            ← Dashboard
          </Link>
          <span className="text-slate-600 text-sm">{user?.email}</span>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="card">
          <h1 className="text-xl font-bold text-slate-800">Profile</h1>
          <p className="mt-1 text-slate-600 text-sm">Update your name and email.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="label">Name</label>
              <input type="text" className="input-field" {...register('name')} />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" {...register('email')} />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            {submitError && <p className="error-text">{submitError}</p>}
            {success && <p className="text-sm text-green-600">Profile updated. Token refreshed on next request.</p>}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
