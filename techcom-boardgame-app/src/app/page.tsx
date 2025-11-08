'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeams } from './teams-context';

export default function Home() {
  const [teamName, setTeamName] = useState('');
  const { teams, addTeam, removeTeam, gameStarted } = useTeams();
  const router = useRouter();

  const handleAddTeam = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = teamName.trim();
    if (!trimmedName) {
      return;
    }

    addTeam(trimmedName);
    setTeamName('');
  };

  const handleRemoveTeam = (index: number) => {
    removeTeam(index);
  };

  const handleDone = () => {
    if (teams.length === 0) {
      return;
    }

    router.push('/teams');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-white px-6 py-12 font-sans text-black">
      <section className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Set Up Teams</h1>
          <p className="text-base text-gray-600">
            Add each team by name, then continue when you&apos;re ready.
          </p>
        </header>

        {gameStarted ? (
          <p className="rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Game already started. Finish the game or reset from the leaderboard
            to edit teams.
          </p>
        ) : null}

        <form className="flex gap-3" onSubmit={handleAddTeam}>
          <input
            aria-label="Team name"
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
            placeholder="Team name"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            disabled={gameStarted}
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-gray-300"
            disabled={!teamName.trim() || gameStarted}
          >
            Add
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-medium">Teams</h2>
          {teams.length === 0 ? (
            <p className="text-sm text-gray-500">No teams yet. Add one above.</p>
          ) : (
            <ul className="space-y-2 rounded border border-gray-200 bg-gray-50 p-4">
              {teams.map((team, index) => (
                <li
                  key={team.id}
                  className="flex items-center justify-between gap-2 text-base"
                >
                  <span>
                    {index + 1}. {team.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeam(index)}
                    className="text-sm text-red-500 underline-offset-2 hover:underline"
                    disabled={gameStarted}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={handleDone}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
          disabled={teams.length === 0}
        >
          Done
        </button>
      </section>
    </main>
  );
}
