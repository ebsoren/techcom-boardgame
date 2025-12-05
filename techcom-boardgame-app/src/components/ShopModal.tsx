'use client';

type ShopModalProps = {
  teamName: string;
  currentCoins: number;
  onTrade: () => void;
  onSkip: () => void;
};

export default function ShopModal({
  teamName,
  currentCoins,
  onTrade,
  onSkip,
}: ShopModalProps) {
  const canTrade = currentCoins >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-4xl">🛒</span>
          <h2 className="text-2xl font-bold">Shop</h2>
        </div>

        <p className="mb-4 text-base text-gray-700">
          Welcome to the shop, <span className="font-semibold">{teamName}</span>!
        </p>

        <div className="mb-6 rounded-lg border-2 border-rose-200 bg-rose-50 p-4">
          <p className="mb-2 text-sm font-semibold text-rose-900">
            Special Offer:
          </p>
          <p className="text-base text-gray-800">
            Trade <span className="font-bold">2 coins</span> for{' '}
            <span className="font-bold">15 points</span>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Your current coins: <span className="font-semibold">{currentCoins}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onTrade}
            disabled={!canTrade}
            className="flex-1 rounded-lg bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {canTrade ? 'Trade (2 coins → 15 points)' : 'Not enough coins'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

