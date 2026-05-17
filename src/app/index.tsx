import { useMemo } from 'react';

import LaunchesModel from '@/features/launches/LaunchesModel';
import LaunchesView from '@/features/launches/LaunchesView';

export default function LaunchesScreen() {
  const model = useMemo(() => new LaunchesModel(), []);
  return <LaunchesView model={model} />;
}
