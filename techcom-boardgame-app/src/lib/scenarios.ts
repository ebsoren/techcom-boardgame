export type ScenarioResponse = {
  id: string;
  label: string;
  text: string;
  evaluation: string;
  points: number;
};

export type Scenario = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  responses: ScenarioResponse[];
};

export type ScenariosData = Scenario[];

import scenariosData from './scenarios.json';

export const scenarios: ScenariosData = scenariosData as ScenariosData;

export function getRandomScenario(): Scenario {
  const randomIndex = Math.floor(Math.random() * scenarios.length);
  return scenarios[randomIndex];
}

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((scenario) => scenario.id === id);
}

