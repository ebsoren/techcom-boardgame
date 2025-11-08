'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTeams } from '../teams-context';

export default function LeaderboardPage() {
  const { teams, winnerIds, resetGame, board } = useTeams();
  const router = useRouter();

  const sortedTeams = useMemo(() => {
    const ranked = [...teams];
    ranked.sort((a, b) => {
      const aWinner = winnerIds.includes(a.id);
      const bWinner = winnerIds.includes(b.id);
      if (aWinner && !bWinner) {
        return -1;
      }
      if (!aWinner && bWinner) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
    return ranked;
  }, [teams, winnerIds]);

  const champion = sortedTeams.find((team) => winnerIds.includes(team.id));

  if (teams.length === 0) {
    return null;
  }

  const handlePlayAgain = () => {
    resetGame();
    router.push('/teams');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 font-sans text-black">
      <section className="w-full max-w-2xl space-y-8 text-center">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">Leaderboard</h1>
          {champion ? (
            <p className="text-base text-gray-600">
              {champion.name} reached the Finale!
            </p>
          ) : (
            <p className="text-base text-gray-600">
              No one reached the Finale this round.
            </p>
          )}
        </header>

        <div className="overflow-hidden rounded border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Team</th>
                <th className="px-4 py-3 font-medium text-gray-700">Location</th>
                <th className="px-4 py-3 font-medium text-gray-700">Steps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedTeams.map((team) => {
                const node = board.nodesById[team.positionId];
                const locationLabel = node?.label?.trim().length
                  ? node.label
                  : node
                    ? `${node.variant.charAt(0).toUpperCase()}${node.variant.slice(1)}`
                    : 'Unknown';

                return (
                  <tr
                    key={team.id}
                    className={
                      winnerIds.includes(team.id)
                        ? 'bg-purple-50 font-semibold'
                        : undefined
                    }
                  >
                    <td className="px-4 py-3">{team.name}</td>
                    <td className="px-4 py-3">{locationLabel}</td>
                    <td className="px-4 py-3">{Math.max(team.path.length - 1, 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handlePlayAgain}
          className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Play again
        </button>
      </section>
    </main>
  );
}

