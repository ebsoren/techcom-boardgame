'use client';

import { useMemo } from 'react';

import {
  BOARD_COL_INDICES,
  BOARD_GRAPH,
  BOARD_ROW_INDICES,
  type BoardNode,
  type NodeVariant,
  cellKey,
} from '@/lib/boardGraph';

const rows = BOARD_ROW_INDICES;
const cols = BOARD_COL_INDICES;
const boardCells = BOARD_GRAPH.cellsByKey;

const variantClasses: Record<NodeVariant, string> = {
  start: 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-emerald-200/70',
  goal: 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-indigo-200/70',
  question:
    'border-amber-500 bg-amber-50 text-amber-900 shadow-amber-200/70 ring-2 ring-amber-400/60',
  milestone: 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-cyan-200/70',
  shipyard: 'border-slate-500 bg-slate-50 text-slate-800 shadow-slate-200/70',
  basic: 'border-slate-500 bg-slate-50 text-slate-800 shadow-slate-200/70',
  point: 'border-purple-500 bg-purple-50 text-purple-900 shadow-purple-200/70',
  shop: 'border-rose-500 bg-rose-50 text-rose-900 shadow-rose-200/70',
};

export type BoardViewProps = {
  className?: string;
  tokens?: Array<{
    teamId: string;
    teamName: string;
    nodeId: string;
    colorClass: string;
  }>;
  highlightNodeIds?: Set<string> | string[];
  onSelectNode?: (nodeId: string) => void;
};

export default function BoardView({ className, tokens = [], highlightNodeIds, onSelectNode }: BoardViewProps) {
  const containerClass = [
    'w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-xl shadow-slate-200/60 backdrop-blur',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const highlightSet = useMemo(() => {
    if (!highlightNodeIds) {
      return new Set<string>();
    }
    return highlightNodeIds instanceof Set
      ? highlightNodeIds
      : new Set<string>(highlightNodeIds);
  }, [highlightNodeIds]);

  const tokensByNode = tokens.reduce<Record<string, BoardViewProps['tokens']>>((acc, token) => {
    if (!acc[token.nodeId]) {
      acc[token.nodeId] = [];
    }
    acc[token.nodeId]!.push(token);
    return acc;
  }, {});

  return (
    <div className={containerClass}>
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
      >
        {rows.map((row) =>
          cols.map((col) => {
            const key = cellKey(row, col);
            const cell = boardCells.get(key);

            if (!cell) {
              return <EmptyTile key={key} row={row} col={col} />;
            }

            return (
              <NodeTile
                key={key}
                cell={cell}
                variantClass={variantClasses[cell.variant ?? 'shipyard']}
                tokens={tokensByNode[cell.id] ?? []}
                isHighlighted={highlightSet.has(cell.id)}
                onSelect={onSelectNode}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

function NodeTile({
  cell,
  variantClass,
  tokens,
  isHighlighted,
  onSelect,
}: {
  cell: BoardNode;
  variantClass: string;
  tokens: Exclude<BoardViewProps['tokens'], undefined>;
  isHighlighted: boolean;
  onSelect?: (nodeId: string) => void;
}) {
  const tileClass = [
    'pointer-events-none absolute inset-1 z-30 flex h-auto min-h-[2.25rem] w-auto flex-col items-center justify-center gap-1 rounded-md border-2 px-1.5 py-1 text-center text-[0.65rem] font-semibold leading-tight tracking-wide shadow-sm transition-transform duration-200 hover:scale-[1.025]',
    variantClass,
  ].join(' ');

  const outerClass = [
    'relative aspect-square min-w-[3.25rem] rounded-md transition-shadow',
    isHighlighted ? 'cursor-pointer ring-2 ring-offset-2 ring-yellow-400 shadow-lg' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (isHighlighted && onSelect) {
      onSelect(cell.id);
    }
  };

  return (
    <div id={cell.id} className={outerClass} onClick={handleClick}>
      <div className="absolute inset-0 rounded-md border border-slate-200/50 bg-gradient-to-br from-slate-50/60 to-white/40 shadow-inner shadow-white/60" />
      <div className={tileClass}>
        {cell.label ? <span className="text-xs">{cell.label}</span> : null}
      </div>
      {tokens.length > 0 ? (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-start justify-end p-1">
          <div className="flex flex-wrap justify-end gap-1">
            {tokens.map((token) => (
              <span
                key={token.teamId}
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-white text-[0.65rem] font-semibold text-white shadow ${token.colorClass}`}
              >
                {token.teamName.slice(0, 1).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyTile({ row, col }: { row: number; col: number }) {
  return (
    <div
      id={`empty-${row}-${col}`}
      className="relative aspect-square min-w-[3.25rem] rounded-md border border-slate-200/40 bg-slate-100/30 shadow-inner shadow-white/30"
    />
  );
}
