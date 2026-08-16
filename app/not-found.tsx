import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="max-w-md rounded-xl border border-slate-700 bg-slate-900 p-8 text-center shadow-lg">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
          404
        </p>
        <h1 className="mb-3 text-2xl font-semibold">Page not found</h1>
        <p className="mb-6 text-sm text-slate-300">
          The page you requested could not be found.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
