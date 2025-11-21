'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import BoardView from '@/components/BoardView';

import { useTeams } from '../teams-context';

export default function GamePage() {
  const {
    teams,
    gameStarted,
    gameOver,
    currentTeamIndex,
    recordRoll,
    lastRoll,
    availableMoves,
    moveCurrentTeam,
    board,
  } = useTeams();
  const router = useRouter();
  const hasTeams = teams.length > 0;
  const currentTeam = hasTeams ? teams[currentTeamIndex] : null;
  const nodesById = board.nodesById;

  useEffect(() => {
    if (!hasTeams) {
      router.replace('/');
    }
  }, [hasTeams, router]);

  useEffect(() => {
    if (gameOver) {
      router.push('/leaderboard');
    }
  }, [gameOver, router]);

  useEffect(() => {
    if (hasTeams && !gameStarted) {
      router.replace('/teams');
    }
  }, [gameStarted, hasTeams, router]);

  const handleRoll = () => {
    recordRoll();
  };

  const handleMove = (nodeId: string) => {
    moveCurrentTeam(nodeId);
  };

  const scoreboard = useMemo(
    () =>
      teams.map((team) => {
        const node = nodesById[team.positionId];
        const label = node?.label?.trim().length
          ? node.label
          : node
            ? `${node.variant.charAt(0).toUpperCase()}${node.variant.slice(1)}`
            : 'Unknown';
        return {
          id: team.id,
          name: team.name,
          label,
        };
      }),
    [nodesById, teams],
  );

  if (!hasTeams) {
    return null;
  }

  const boardTokens = teams.map((team, index) => {
    const palette = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-teal-500'];
    return {
      teamId: team.id,
      teamName: team.name,
      nodeId: team.positionId,
      colorClass: palette[index % palette.length],
    };
  });

  const highlightNodeIds = useMemo(
    () => new Set(availableMoves.map((option) => option.nodeId)),
    [availableMoves],
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-4 py-10 font-sans text-black">
      <div className="flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          <BoardView
            tokens={boardTokens}
            highlightNodeIds={highlightNodeIds}
            onSelectNode={handleMove}
          />
        </div>

        <section className="flex w-full max-w-md flex-col gap-6 self-center rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <header className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Turn Control</h1>
            <p className="text-sm text-gray-600">
              Roll the die and move to a connected square. Reach 100 points to win.
            </p>
          </header>

          <div className="space-y-3 rounded border border-gray-200 bg-white p-4 text-center">
            <h2 className="text-xl font-semibold">
              {currentTeam ? `${currentTeam.name}'s turn` : 'Awaiting teams'}
            </h2>
            <button
              type="button"
              onClick={handleRoll}
              className="w-full rounded bg-blue-600 px-6 py-3 text-lg font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={gameOver || availableMoves.length > 0}
            >
              Roll Die
            </button>
            {lastRoll ? (
              <p className="text-base text-gray-700">
                {lastRoll.teamName} rolled a {lastRoll.value}.
              </p>
            ) : (
              <p className="text-base text-gray-500">No rolls yet.</p>
            )}
            {availableMoves.length > 0 ? (
              <p className="text-sm text-purple-700">
                Select a highlighted square on the board ({availableMoves.length}{' '}
                option{availableMoves.length === 1 ? '' : 's'} available).
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">Current Positions</h3>
            <ul className="space-y-2 rounded border border-gray-200 bg-white p-4">
              {scoreboard.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between text-base"
                >
                  <span>{entry.name}</span>
                  <span className="font-medium text-gray-600">{entry.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

