import React from 'react';
import { SeasonCode } from '../../types';
import { BettingOddsWidget } from '../BettingOddsWidget';

interface BettingOddsViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  onSelectGameForPlayByPlay?: (gameKey: string) => void;
}

export const BettingOddsView: React.FC<BettingOddsViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange,
  onSelectGameForPlayByPlay
}) => {
  return (
    <div className="space-y-6">
      <BettingOddsWidget
        selectedSeason={selectedSeason}
        onSeasonChange={onSeasonChange}
        onSelectGameForPlayByPlay={onSelectGameForPlayByPlay}
      />
    </div>
  );
};
