import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
          Welcome to the Web App
        </h1>
        <p className="mt-3 text-slate-600">
          Frontend Developer Task – Authentication & Dashboard with Tasks CRUD.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="btn-primary inline-flex items-center justify-center"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="btn-secondary inline-flex items-center justify-center"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
