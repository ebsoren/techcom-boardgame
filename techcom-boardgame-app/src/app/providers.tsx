'use client';

import { ReactNode } from 'react';
import { TeamsProvider } from './teams-context';

export default function Providers({ children }: { children: ReactNode }) {
  return <TeamsProvider>{children}</TeamsProvider>;
}

