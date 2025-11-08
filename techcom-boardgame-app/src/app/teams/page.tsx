'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTeams } from '../teams-context';

export default function TeamsPage() {
  const { teams, gameStarted, startGame } = useTeams();
  const router = useRouter();
  const hasTeams = teams.length > 0;

  const handleStart = () => {
    if (!hasTeams) {
      return;
    }

    if (!gameStarted) {
      startGame();
    }

    router.push('/game');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 font-sans text-black">
      <section className="w-full max-w-md space-y-6 text-center">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Teams Ready to Play</h1>
          <p className="text-base text-gray-600">
            {gameStarted
              ? 'Game in progress. Continue or finish the current match.'
              : 'Review the roster, then start the game when you are ready.'}
          </p>
        </header>

        {hasTeams ? (
          <ul className="space-y-2 rounded border border-gray-200 bg-gray-50 p-4 text-left">
            {teams.map((team, index) => (
              <li key={team.id} className="text-base">
                {index + 1}. {team.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            No teams were provided. Go back and add some.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleStart}
            className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={!hasTeams}
          >
            {gameStarted ? 'Resume Game' : 'Start Game'}
          </button>

          <Link
            href="/"
            className="inline-block rounded border border-transparent bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/80"
          >
            Edit teams
          </Link>
        </div>
      </section>
    </main>
  );
}

