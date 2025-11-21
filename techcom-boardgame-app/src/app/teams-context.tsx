'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  BOARD_GRAPH,
  type BoardGraph,
} from '@/lib/boardGraph';

type Team = {
  id: string;
  name: string;
  positionId: string;
  path: string[];
  coins: number;
  points: number;
};

type LastRoll = {
  teamId: string;
  teamName: string;
  value: number;
};

type MoveOption = {
  nodeId: string;
  distance: number;
  label: string;
};

type TeamsContextValue = {
  teams: Team[];
  addTeam: (name: string) => void;
  removeTeam: (index: number) => void;
  clearTeams: () => void;
  startGame: () => void;
  resetGame: () => void;
  recordRoll: () => number | null;
  moveCurrentTeam: (targetNodeId: string) => void;
  gameStarted: boolean;
  gameOver: boolean;
  currentTeamIndex: number;
  lastRoll: LastRoll | null;
  winnerIds: string[];
  availableMoves: MoveOption[];
  board: BoardGraph;
};

const TeamsContext = createContext<TeamsContextValue | undefined>(undefined);

const createTeamId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `team-${Math.random().toString(36).slice(2, 10)}`;
};


const computeMoveOptions = (startId: string, maxDistance: number): MoveOption[] => {
  if (!startId || maxDistance <= 0) {
    return [];
  }

  const adjacency = BOARD_GRAPH.adjacencyById;
  const nodesById = BOARD_GRAPH.nodesById;
  const visited = new Map<string, number>([[startId, 0]]);
  const queue: Array<{ id: string; distance: number }> = [{ id: startId, distance: 0 }];
  const destinations = new Map<string, number>();

  while (queue.length > 0) {
    const { id, distance } = queue.shift()!;
    if (distance >= maxDistance) {
      continue;
    }

    for (const neighborId of adjacency[id] ?? []) {
      const nextDistance = distance + 1;
      if (nextDistance > maxDistance) {
        continue;
      }

      const previousDistance = visited.get(neighborId);
      if (previousDistance !== undefined && previousDistance <= nextDistance) {
        continue;
      }

      visited.set(neighborId, nextDistance);
      queue.push({ id: neighborId, distance: nextDistance });

      if (neighborId !== startId) {
        const currentShortest = destinations.get(neighborId);
        if (currentShortest === undefined || nextDistance < currentShortest) {
          destinations.set(neighborId, nextDistance);
        }
      }
    }
  }

  return Array.from(destinations.entries())
    .map(([nodeId, distance]) => {
      const node = nodesById[nodeId];
      const labelCandidate = node?.label ?? '';
      const label = labelCandidate.trim().length > 0
        ? labelCandidate
        : node
          ? `${node.variant.charAt(0).toUpperCase()}${node.variant.slice(1)}`
          : nodeId;

      return { nodeId, distance, label };
    })
    .sort((a, b) =>
      a.distance === b.distance
        ? a.label.localeCompare(b.label)
        : a.distance - b.distance,
    );
};

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [lastRoll, setLastRoll] = useState<LastRoll | null>(null);
  const [winnerIds, setWinnerIds] = useState<string[]>([]);
  const [availableMoves, setAvailableMoves] = useState<MoveOption[]>([]);

  const addTeam = useCallback(
    (name: string) => {
      if (gameStarted) {
        return;
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        return;
      }

      const newTeam: Team = {
        id: createTeamId(),
        name: trimmedName,
        positionId: BOARD_GRAPH.startId,
        path: BOARD_GRAPH.startId ? [BOARD_GRAPH.startId] : [],
        coins: 0,
        points: 0,
      };

      setTeams((prev) => [...prev, newTeam]);
    },
    [gameStarted],
  );

  const removeTeam = useCallback(
    (index: number) => {
      if (gameStarted) {
        return;
      }

      setTeams((prev) => prev.filter((_, idx) => idx !== index));

      const previousLength = teams.length;
      setCurrentTeamIndex((prevIndex) => {
        if (previousLength <= 1) {
          return 0;
        }

        if (prevIndex > index) {
          return prevIndex - 1;
        }

        if (prevIndex >= previousLength - 1) {
          return previousLength - 2;
        }

        return prevIndex;
      });
    },
    [gameStarted, teams.length],
  );

  const clearTeams = useCallback(() => {
    setTeams([]);
    setGameStarted(false);
    setGameOver(false);
    setCurrentTeamIndex(0);
    setLastRoll(null);
    setWinnerIds([]);
    setAvailableMoves([]);
  }, []);

  const startGame = useCallback(() => {
    if (teams.length === 0) {
      return;
    }

    setTeams((prev) =>
      prev.map((team) => ({
        ...team,
        positionId: BOARD_GRAPH.startId,
        path: BOARD_GRAPH.startId ? [BOARD_GRAPH.startId] : [],
        coins: 0,
        points: 0,
      })),
    );
    setGameStarted(true);
    setGameOver(false);
    setWinnerIds([]);
    setCurrentTeamIndex(0);
    setLastRoll(null);
    setAvailableMoves([]);
  }, [teams.length]);

  const recordRoll = useCallback(() => {
    if (!gameStarted || gameOver || teams.length === 0) {
      return null;
    }

    if (availableMoves.length > 0) {
      return null;
    }

    const rollValue = Math.floor(Math.random() * 6) + 1;
    const actingTeam = teams[currentTeamIndex];

    if (!actingTeam) {
      return null;
    }

    const moveOptions = computeMoveOptions(actingTeam.positionId, rollValue);

    setLastRoll({
      teamId: actingTeam.id,
      teamName: actingTeam.name,
      value: rollValue,
    });
    setAvailableMoves(moveOptions);

    if (moveOptions.length === 0) {
      setCurrentTeamIndex((prevIndex) => {
        if (teams.length === 0) {
          return 0;
        }
        return (prevIndex + 1) % teams.length;
      });
    }

    return rollValue;
  }, [availableMoves.length, currentTeamIndex, gameOver, gameStarted, teams]);

  const moveCurrentTeam = useCallback(
    (targetNodeId: string) => {
      if (availableMoves.length === 0) {
        return;
      }

      const selectedOption = availableMoves.find(
        (option) => option.nodeId === targetNodeId,
      );

      if (!selectedOption) {
        return;
      }

      const teamCount = teams.length;
      if (teamCount === 0) {
        return;
      }

      const activeTeam = teams[currentTeamIndex];
      if (!activeTeam) {
        return;
      }

      // Check if the target node is a +1 coin node
      const targetNode = BOARD_GRAPH.nodesById[targetNodeId];
      const isCoinNode = targetNode?.variant === 'point';

      const updatedTeams = teams.map((team, index) => {
        if (index === currentTeamIndex) {
          const newCoins = isCoinNode ? team.coins + 1 : team.coins;
          return {
            ...team,
            positionId: targetNodeId,
            path: [...team.path, targetNodeId],
            coins: newCoins,
          };
        }
        return team;
      });

      setTeams(updatedTeams);

      // Check if team has reached 100 points
      const updatedActiveTeam = updatedTeams[currentTeamIndex];
      if (updatedActiveTeam.points >= 100) {
        setGameOver(true);
        setWinnerIds([activeTeam.id]);
      } else {
        setCurrentTeamIndex((prevIndex) => (prevIndex + 1) % teamCount);
      }

      setLastRoll(null);
      setAvailableMoves([]);
    },
    [availableMoves, currentTeamIndex, teams],
  );

  const resetGame = useCallback(() => {
    setTeams((prev) =>
      prev.map((team) => ({
        ...team,
        positionId: BOARD_GRAPH.startId,
        path: BOARD_GRAPH.startId ? [BOARD_GRAPH.startId] : [],
        coins: 0,
        points: 0,
      })),
    );
    setGameStarted(false);
    setGameOver(false);
    setCurrentTeamIndex(0);
    setLastRoll(null);
    setWinnerIds([]);
    setAvailableMoves([]);
  }, []);

  const value = useMemo(
    () => ({
      teams,
      addTeam,
      removeTeam,
      clearTeams,
      startGame,
      resetGame,
      recordRoll,
      moveCurrentTeam,
      gameStarted,
      gameOver,
      currentTeamIndex,
      lastRoll,
      winnerIds,
      availableMoves,
      board: BOARD_GRAPH,
    }),
    [
      teams,
      addTeam,
      removeTeam,
      clearTeams,
      startGame,
      resetGame,
      recordRoll,
      moveCurrentTeam,
      gameStarted,
      gameOver,
      currentTeamIndex,
      lastRoll,
      winnerIds,
      availableMoves,
    ],
  );

  return (
    <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
}

