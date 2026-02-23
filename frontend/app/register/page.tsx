'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { register as registerApi } from '@/lib/api';
import { useState } from 'react';

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters').regex(/\d/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitError('');
    const { data: res, error } = await registerApi({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (error) {
      setSubmitError(error.message);
      return;
    }
    if (res?.token && res?.user) {
      setAuth(res.user, res.token);
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800">Create account</h1>
        <p className="mt-1 text-slate-600 text-sm">Register with name, email and password.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="label">Name</label>
            <input type="text" autoComplete="name" className="input-field" {...reg('name')} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" autoComplete="email" className="input-field" {...reg('email')} />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" autoComplete="new-password" className="input-field" {...reg('password')} />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input type="password" autoComplete="new-password" className="input-field" {...reg('confirmPassword')} />
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
          </div>
          {submitError && <p className="error-text">{submitError}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
