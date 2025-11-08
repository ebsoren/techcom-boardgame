type NodeVariant =
  | 'start'
  | 'goal'
  | 'question'
  | 'milestone'
  | 'shipyard'
  | 'basic'
  | 'point'
  | 'shop';

type BoardLink = {
  targetId: string;
  distance: number;
};

export type BoardNode = {
  id: string;
  row: number;
  col: number;
  label: string;
  variant: NodeVariant;
  sequence: number;
  links: BoardLink[];
};

export type BoardGraph = {
  nodes: BoardNode[];
  nodesById: Record<string, BoardNode>;
  cellsByKey: Map<string, BoardNode>;
  adjacencyById: Record<string, string[]>;
  startId: string;
  finaleId: string;
};

export const BOARD_ROWS = 13;
export const BOARD_COLS = 13;
export const ROW_OFFSET = 2;
export const COL_OFFSET = 1;
const EXTRA_POINT_COUNT = 9;

export const BOARD_ROW_INDICES = Object.freeze(
  Array.from({ length: BOARD_ROWS - ROW_OFFSET }, (_, index) => index + ROW_OFFSET),
);
export const BOARD_COL_INDICES = Object.freeze(
  Array.from({ length: BOARD_COLS - COL_OFFSET }, (_, index) => index + COL_OFFSET),
);

export const cellKey = (row: number, col: number) => `${row}-${col}`;

const nodeDefinitions: Array<{
  id: string;
  label: string;
  row: number;
  col: number;
  variant?: NodeVariant;
}> = [
  { id: 'node-start', label: 'Start', row: 6, col: 1, variant: 'start' },
  { id: 'node-crossing', label: '?', row: 6, col: 3, variant: 'question' },
  { id: 'node-cloud-gate', label: 'Cloud Gate', row: 2, col: 3 },
  { id: 'node-arcade', label: 'Arcade', row: 2, col: 5 },
  { id: 'node-market', label: 'Market', row: 4, col: 5 },
  { id: 'node-forge', label: 'Forge', row: 6, col: 5 },
  { id: 'node-crossroads', label: '?', row: 6, col: 7, variant: 'question' },
  { id: 'node-observatory', label: 'Observatory', row: 3, col: 7 },
  { id: 'node-sanctum', label: 'Sanctum', row: 3, col: 9 },
  { id: 'node-gate', label: 'Crystal Gate', row: 6, col: 9 },
  { id: 'node-harbor', label: '?', row: 6, col: 11, variant: 'question' },
  { id: 'node-shipyard', label: 'Shipyard', row: 8, col: 11 },
  { id: 'node-beacon', label: 'Beacon', row: 8, col: 12 },
  { id: 'node-sky-gate', label: 'Sky Gate', row: 10, col: 12 },
  { id: 'node-temple', label: '+1', row: 10, col: 10, variant: 'point' },
  { id: 'node-lagoon', label: 'Lagoon', row: 10, col: 9 },
  { id: 'node-wilds', label: 'Wilds', row: 10, col: 7 },
  { id: 'node-bazaar', label: 'Bazaar', row: 8, col: 7 },
  { id: 'node-ruins', label: 'Ruins', row: 8, col: 6 },
  { id: 'node-caverns', label: 'Caverns', row: 8, col: 3 },
  { id: 'node-river', label: 'River', row: 10, col: 3 },
  { id: 'node-falls', label: 'Falls', row: 10, col: 5 },
  { id: 'node-causeway', label: 'Causeway', row: 12, col: 8 },
  { id: 'node-delta', label: 'Delta', row: 12, col: 9 },
  { id: 'node-coast', label: 'Coastline', row: 12, col: 11 },
  { id: 'node-finale', label: 'Finale', row: 12, col: 7, variant: 'goal' },
];

const pathSegments: Array<Array<[number, number]>> = [
  [
    [6, 1],
    [6, 2],
    [6, 3],
    [6, 4],
    [6, 5],
    [6, 6],
    [6, 7],
    [6, 8],
    [6, 9],
    [6, 10],
    [6, 11],
  ],
  [
    [6, 3],
    [5, 3],
    [4, 3],
    [3, 3],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [6, 5],
  ],
  [
    [6, 7],
    [5, 7],
    [4, 7],
    [3, 7],
    [3, 8],
    [3, 9],
    [4, 9],
    [5, 9],
    [6, 9],
  ],
  [
    [6, 7],
    [7, 7],
    [8, 7],
    [9, 7],
    [10, 7],
    [11, 7],
    [12, 7],
  ],
  [
    [8, 7],
    [8, 8],
    [8, 9],
    [8, 10],
    [8, 11],
    [8, 12],
    [9, 12],
    [10, 12],
    [10, 11],
    [10, 10],
    [9, 10],
    [8, 10],
  ],
  [
    [6, 6],
    [7, 6],
    [8, 6],
    [8, 5],
    [8, 4],
    [8, 3],
    [9, 3],
    [10, 3],
    [10, 4],
    [10, 5],
    [10, 6],
    [10, 7],
  ],
  [
    [6, 11],
    [7, 11],
    [8, 11],
    [9, 11],
    [10, 11],
    [11, 11],
    [12, 11],
    [12, 10],
    [12, 9],
    [11, 9],
    [10, 9],
    [10, 10],
  ],
  [
    [12, 9],
    [12, 8],
    [12, 7],
  ],
];

const QUESTION_COORDINATES = new Set(
  [
    [6, 4],
    [6, 6],
    [7, 7],
    [8, 8],
    [9, 7],
    [10, 8],
  ].map(([row, col]) => cellKey(row, col)),
);

const SHOP_COORDINATES = new Set(
  [
    [7, 8],
    [9, 10],
    [11, 9],
  ].map(([row, col]) => cellKey(row, col)),
);

type InternalCell = {
  id: string;
  row: number;
  col: number;
  label: string;
  variant: NodeVariant;
  sequence: number;
  links?: BoardLink[];
};

function buildBoardCells(): Map<string, InternalCell> {
  const map = new Map<string, InternalCell>();

  let sequenceCounter = 1;
  for (const node of nodeDefinitions) {
    if (node.row < ROW_OFFSET || node.col < COL_OFFSET) {
      continue;
    }

    const key = cellKey(node.row, node.col);
    let variant: NodeVariant;
    let label: string;

    if (node.variant === 'start' || node.id === 'node-start') {
      variant = 'start';
      label = 'Start';
    } else if (node.variant === 'goal' || node.id === 'node-finale') {
      variant = 'goal';
      label = node.label;
    } else if (node.variant === 'question' || node.label === '?') {
      variant = 'question';
      label = '?';
    } else if (node.label === 'Shop' || SHOP_COORDINATES.has(key)) {
      variant = 'shop';
      label = 'Shop';
    } else {
      variant = 'point';
      label = '+1';
    }

    map.set(key, {
      id: node.id,
      row: node.row,
      col: node.col,
      label,
      variant,
      sequence: sequenceCounter,
    });
    sequenceCounter++;
  }

  let extraPointsAssigned = 0;
  for (const segment of pathSegments) {
    for (const [row, col] of segment) {
      if (row < ROW_OFFSET || col < COL_OFFSET) {
        continue;
      }

      const key = cellKey(row, col);
      if (map.has(key)) {
        continue;
      }

      const isQuestion = QUESTION_COORDINATES.has(key);
      const isShop = !isQuestion && SHOP_COORDINATES.has(key);
      const isPoint =
        !isQuestion && !isShop && extraPointsAssigned < EXTRA_POINT_COUNT;

      map.set(key, {
        id: `basic-${row}-${col}`,
        row,
        col,
        label: isQuestion ? '?' : isShop ? 'Shop' : isPoint ? '+1' : '',
        variant: isQuestion
          ? 'question'
          : isShop
            ? 'shop'
            : isPoint
              ? 'point'
              : 'basic',
        sequence: sequenceCounter,
      });

      if (isPoint && extraPointsAssigned < EXTRA_POINT_COUNT) {
        extraPointsAssigned++;
      }

      sequenceCounter++;
    }
  }

  return map;
}

function buildConnectionMap(board: Map<string, InternalCell>): Map<string, string[]> {
  const connections = new Map<string, string[]>();
  const offsets: Array<[number, number]> = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  for (const cell of board.values()) {
    const key = cellKey(cell.row, cell.col);
    const neighbors: string[] = [];
    for (const [dRow, dCol] of offsets) {
      const neighborKey = cellKey(cell.row + dRow, cell.col + dCol);
      if (board.has(neighborKey)) {
        neighbors.push(neighborKey);
      }
    }
    connections.set(key, neighbors);
  }

  return connections;
}

function computeDirectedDistances(
  source: InternalCell,
  board: Map<string, InternalCell>,
  connections: Map<string, string[]>,
): BoardLink[] {
  const originKey = cellKey(source.row, source.col);
  const allowBackward = source.variant === 'start';
  const queue: Array<{ key: string; distance: number }> = [
    { key: originKey, distance: 0 },
  ];
  const visited = new Set<string>([originKey]);
  const shortest = new Map<string, number>();

  while (queue.length > 0) {
    const { key, distance } = queue.shift()!;

    if (distance >= 10) {
      continue;
    }

    for (const neighborKey of connections.get(key) ?? []) {
      if (visited.has(neighborKey)) {
        continue;
      }

      visited.add(neighborKey);
      const neighborCell = board.get(neighborKey);
      const nextDistance = distance + 1;

      queue.push({ key: neighborKey, distance: nextDistance });

      if (!neighborCell || neighborCell.variant === 'basic') {
        continue;
      }

      if (!allowBackward && neighborCell.sequence <= source.sequence) {
        continue;
      }

      const previous = shortest.get(neighborCell.id);
      if (previous === undefined || nextDistance < previous) {
        shortest.set(neighborCell.id, nextDistance);
      }
    }
  }

  return Array.from(shortest.entries())
    .map(([targetId, distance]) => ({ targetId, distance }))
    .sort((a, b) =>
      a.distance === b.distance
        ? a.targetId.localeCompare(b.targetId)
        : a.distance - b.distance,
    );
}

function attachLinks(
  board: Map<string, InternalCell>,
  connections: Map<string, string[]>,
) {
  for (const cell of board.values()) {
    if (cell.variant === 'basic') {
      cell.links = [];
      continue;
    }

    cell.links = computeDirectedDistances(cell, board, connections);
  }
}

function toBoardGraph(cells: Map<string, InternalCell>, connections: Map<string, string[]>): BoardGraph {
  const nodes: BoardNode[] = Array.from(cells.values())
    .map((cell) => ({
      id: cell.id,
      row: cell.row,
      col: cell.col,
      label: cell.label,
      variant: cell.variant,
      sequence: cell.sequence,
      links: cell.links ?? [],
    }))
    .sort((a, b) => a.sequence - b.sequence);

  const nodesById: Record<string, BoardNode> = {};
  const adjacencyById: Record<string, string[]> = {};

  for (const node of nodes) {
    nodesById[node.id] = node;
  }

  for (const [key, neighborKeys] of connections.entries()) {
    const cell = cells.get(key);
    if (!cell) {
      continue;
    }

    adjacencyById[cell.id] = neighborKeys
      .map((neighborKey) => cells.get(neighborKey)?.id)
      .filter((value): value is string => Boolean(value));
  }

  const startId = nodes.find((node) => node.variant === 'start')?.id ?? '';
  const finaleId =
    nodes.find((node) => node.id === 'node-finale' || node.variant === 'goal')?.id ?? '';

  return {
    nodes,
    nodesById,
    cellsByKey: cells,
    adjacencyById,
    startId,
    finaleId,
  };
}

function buildBoardGraph(): BoardGraph {
  const cellMap = buildBoardCells();
  const connections = buildConnectionMap(cellMap);
  attachLinks(cellMap, connections);
  return toBoardGraph(cellMap, connections);
}

export const BOARD_GRAPH = buildBoardGraph();

export type { NodeVariant, BoardLink };

