import React from 'react';
import { DraftMockSimulator } from '../football/DraftMockSimulator';

interface DraftMockSimulatorViewProps {
  onNavigateToTrades?: () => void;
}

export const DraftMockSimulatorView: React.FC<DraftMockSimulatorViewProps> = ({
  onNavigateToTrades
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <DraftMockSimulator onNavigateToTrades={onNavigateToTrades} />
    </div>
  );
};
