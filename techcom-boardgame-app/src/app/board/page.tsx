'use client';

import BoardView from '@/components/BoardView';

export default function BoardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-sky-50 to-teal-100 px-6 py-16 font-sans text-slate-900">
      <section className="flex w-full max-w-5xl flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-semibold uppercase tracking-wide text-slate-800">
            Adventure Board
          </h1>
          <p className="mt-2 text-base text-slate-600">
            A branching travel map with hubs, shortcuts, and converging paths. Tap into the graph to plan multi-route journeys.
          </p>
        </header>

        <BoardView />
      </section>
    </main>
  );
}
