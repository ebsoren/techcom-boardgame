'use client';

type ScenarioResponse = {
  id: string;
  label: string;
  text: string;
  evaluation: string;
  points: number;
};

type Scenario = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  responses: ScenarioResponse[];
};

type ScenarioModalProps = {
  scenario: Scenario;
  onSelectResponse: (responseId: string) => void;
};

export default function ScenarioModal({
  scenario,
  onSelectResponse,
}: ScenarioModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-4xl">{scenario.emoji}</span>
          <h2 className="text-2xl font-bold">{scenario.title}</h2>
        </div>

        <p className="mb-6 text-base text-gray-700">{scenario.description}</p>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Choose your response:</h3>
          {scenario.responses.map((response) => (
            <button
              key={response.id}
              type="button"
              onClick={() => onSelectResponse(response.id)}
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  {response.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">{response.text}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

