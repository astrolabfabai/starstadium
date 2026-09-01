import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScoringDriveAlert, ScoreType } from '../types';
import { NFL_TEAMS, SCHEDULES_DATA } from '../data/sportsDataMock';
import { playScoringChime } from '../utils/audioChime';

interface ScoringNotificationContextType {
  alerts: ScoringDriveAlert[];
  activeToasts: ScoringDriveAlert[];
  unreadCount: number;
  isSoundEnabled: boolean;
  isNotificationsEnabled: boolean;
  isAutoSimulationActive: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  setIsNotificationsEnabled: (enabled: boolean) => void;
  setIsAutoSimulationActive: (active: boolean) => void;
  dismissToast: (alertId: string) => void;
  markAllAsRead: () => void;
  clearAlertHistory: () => void;
  triggerSampleScoringDrive: (customType?: ScoreType, specificGameKey?: string) => ScoringDriveAlert;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
}

const ScoringNotificationContext = createContext<ScoringNotificationContextType | undefined>(undefined);

// Initial real-world drive alerts from active Week 1 matchups
const INITIAL_ALERTS: ScoringDriveAlert[] = [
  {
    id: 'score-init-1',
    gameKey: '202610101',
    timestamp: Date.now() - 1000 * 60 * 3, // 3 mins ago
    scoreType: 'TOUCHDOWN',
    scoringTeam: 'KC',
    scoringTeamName: 'Kansas City Chiefs',
    scoringTeamColor: '#E31837',
    opponentTeam: 'BAL',
    opponentTeamName: 'Baltimore Ravens',
    opponentTeamColor: '#241773',
    scoringPlayer: 'Patrick Mahomes 21-yd pass to Travis Kelce',
    pointsAdded: 7,
    updatedHomeScore: 24,
    updatedAwayScore: 20,
    homeTeam: 'KC',
    awayTeam: 'BAL',
    quarter: 'Q4',
    timeRemaining: '02:15',
    drivePlays: 8,
    driveYards: 75,
    driveTimeOfPossession: '3:45',
    playDescription: 'P. Mahomes pass deep middle to T. Kelce for 21 yards, TOUCHDOWN. H. Butker extra point is GOOD.',
    epaGain: 4.82,
    winProbShift: 18.5,
    isRedZoneStrike: true,
    read: false
  },
  {
    id: 'score-init-2',
    gameKey: '202610102',
    timestamp: Date.now() - 1000 * 60 * 12, // 12 mins ago
    scoreType: 'TOUCHDOWN',
    scoringTeam: 'PHI',
    scoringTeamName: 'Philadelphia Eagles',
    scoringTeamColor: '#004C54',
    opponentTeam: 'GB',
    opponentTeamName: 'Green Bay Packers',
    opponentTeamColor: '#203731',
    scoringPlayer: 'Saquon Barkley 11-yd rush up the middle',
    pointsAdded: 7,
    updatedHomeScore: 34,
    updatedAwayScore: 29,
    homeTeam: 'PHI',
    awayTeam: 'GB',
    quarter: 'Q4',
    timeRemaining: '01:05',
    drivePlays: 6,
    driveYards: 68,
    driveTimeOfPossession: '2:40',
    playDescription: 'S. Barkley rush up middle for 11 yards, TOUCHDOWN. J. Elliott extra point is GOOD.',
    epaGain: 3.95,
    winProbShift: 24.1,
    isRedZoneStrike: true,
    read: true
  },
  {
    id: 'score-init-3',
    gameKey: '202610103',
    timestamp: Date.now() - 1000 * 60 * 25, // 25 mins ago
    scoreType: 'FIELD_GOAL',
    scoringTeam: 'DET',
    scoringTeamName: 'Detroit Lions',
    scoringTeamColor: '#0076B6',
    opponentTeam: 'LAR',
    opponentTeamName: 'Los Angeles Rams',
    opponentTeamColor: '#003594',
    scoringPlayer: 'Jake Bates 52-yd Field Goal',
    pointsAdded: 3,
    updatedHomeScore: 26,
    updatedAwayScore: 20,
    homeTeam: 'DET',
    awayTeam: 'LAR',
    quarter: 'OT',
    timeRemaining: '04:18',
    drivePlays: 11,
    driveYards: 54,
    driveTimeOfPossession: '5:12',
    playDescription: 'J. Bates 52-yard field goal is GOOD, Center-S. Daly, Holder-J. Fox.',
    epaGain: 2.14,
    winProbShift: 12.8,
    isRedZoneStrike: false,
    read: true
  }
];

const SAMPLE_SCORING_SCENARIOS = [
  {
    team: 'KC',
    opponent: 'BAL',
    gameKey: '202610101',
    scoreType: 'TOUCHDOWN' as ScoreType,
    player: 'Xavier Worthy 35-yd deep strike from Patrick Mahomes',
    points: 7,
    plays: 5,
    yards: 78,
    top: '2:15',
    desc: 'P. Mahomes pass deep right to X. Worthy for 35 yards, TOUCHDOWN. H. Butker extra point is GOOD.',
    epa: 5.2,
    winShift: 22.4,
    isRedZone: false
  },
  {
    team: 'BAL',
    opponent: 'KC',
    gameKey: '202610101',
    scoreType: 'TOUCHDOWN' as ScoreType,
    player: 'Lamar Jackson 14-yd scramble rush TD',
    points: 7,
    plays: 9,
    yards: 80,
    top: '4:30',
    desc: 'L. Jackson scrambles left end for 14 yards, TOUCHDOWN. J. Tucker extra point is GOOD.',
    epa: 4.6,
    winShift: 19.8,
    isRedZone: true
  },
  {
    team: 'GB',
    opponent: 'PHI',
    gameKey: '202610102',
    scoreType: 'FIELD_GOAL' as ScoreType,
    player: 'Brandon McManus 48-yd Field Goal',
    points: 3,
    plays: 8,
    yards: 49,
    top: '3:10',
    desc: 'B. McManus 48-yard field goal is GOOD. Center-M. Orzech, Holder-D. Whelan.',
    epa: 1.85,
    winShift: 8.5,
    isRedZone: false
  },
  {
    team: 'SF',
    opponent: 'NYJ',
    gameKey: '202610104',
    scoreType: 'TOUCHDOWN' as ScoreType,
    player: 'Christian McCaffrey 4-yd red zone rush TD',
    points: 7,
    plays: 12,
    yards: 85,
    top: '6:15',
    desc: 'C. McCaffrey rush up middle for 4 yards, TOUCHDOWN. J. Moody extra point is GOOD.',
    epa: 4.1,
    winShift: 16.2,
    isRedZone: true
  },
  {
    team: 'HOU',
    opponent: 'IND',
    gameKey: '202610107',
    scoreType: 'TOUCHDOWN' as ScoreType,
    player: 'C.J. Stroud 28-yd touchdown pass to Nico Collins',
    points: 7,
    plays: 7,
    yards: 72,
    top: '3:05',
    desc: 'C. Stroud pass deep middle to N. Collins for 28 yards, TOUCHDOWN. K. Fairbairn extra point is GOOD.',
    epa: 4.75,
    winShift: 21.0,
    isRedZone: false
  },
  {
    team: 'DAL',
    opponent: 'CLE',
    gameKey: '202610106',
    scoreType: 'PICK_SIX' as ScoreType,
    player: 'Trevon Diggs 42-yd Interception Return TD',
    points: 6,
    plays: 1,
    yards: 42,
    top: '0:14',
    desc: 'D. Watson pass intercepted by T. Diggs at the CLE 42, returned 42 yards for a TOUCHDOWN.',
    epa: 6.8,
    winShift: 28.5,
    isRedZone: false
  }
];

export const ScoringNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<ScoringDriveAlert[]>(INITIAL_ALERTS);
  const [activeToasts, setActiveToasts] = useState<ScoringDriveAlert[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(true);
  const [isAutoSimulationActive, setIsAutoSimulationActive] = useState<boolean>(true);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);

  // Helper to resolve team colors
  const getTeamColor = (teamKey: string): string => {
    const team = NFL_TEAMS.find((t) => t.Key === teamKey);
    return team ? `#${team.PrimaryColor.replace('#', '')}` : '#3b82f6';
  };

  const getTeamName = (teamKey: string): string => {
    const team = NFL_TEAMS.find((t) => t.Key === teamKey);
    return team ? team.FullName : teamKey;
  };

  // Dismiss a toast alert from active view
  const dismissToast = useCallback((alertId: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== alertId));
  }, []);

  // Mark all alerts as read
  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  // Clear alert history
  const clearAlertHistory = useCallback(() => {
    setAlerts([]);
    setActiveToasts([]);
  }, []);

  // Dispatch a new alert
  const dispatchAlert = useCallback(
    (newAlert: ScoringDriveAlert) => {
      if (!isNotificationsEnabled) return;

      // Add to alert log
      setAlerts((prev) => [newAlert, ...prev]);

      // Push to active toast stack (keep max 3 toasts visible simultaneously)
      setActiveToasts((prev) => [newAlert, ...prev.slice(0, 2)]);

      // Play audio chime if enabled
      if (isSoundEnabled) {
        if (newAlert.scoreType === 'TOUCHDOWN' || newAlert.scoreType === 'PICK_SIX' || newAlert.scoreType === 'FUMBLE_RETURN_TD') {
          playScoringChime('touchdown');
        } else if (newAlert.scoreType === 'FIELD_GOAL') {
          playScoringChime('field_goal');
        } else if (newAlert.scoreType === 'SAFETY') {
          playScoringChime('safety');
        } else {
          playScoringChime('alert');
        }
      }
    },
    [isNotificationsEnabled, isSoundEnabled]
  );

  // Trigger a sample scoring drive (can be called manually from UI or auto-simulated)
  const triggerSampleScoringDrive = useCallback(
    (customType?: ScoreType, specificGameKey?: string): ScoringDriveAlert => {
      const scenario =
        SAMPLE_SCORING_SCENARIOS[Math.floor(Math.random() * SAMPLE_SCORING_SCENARIOS.length)];

      const scoreType = customType || scenario.scoreType;
      const gameKey = specificGameKey || scenario.gameKey;
      const matchingGame = SCHEDULES_DATA.find((g) => g.GameKey === gameKey);

      const homeTeam = matchingGame ? matchingGame.HomeTeam : scenario.team;
      const awayTeam = matchingGame ? matchingGame.AwayTeam : scenario.opponent;
      const isHomeScoring = scenario.team === homeTeam;

      const baseHomeScore = matchingGame?.HomeScore ?? 24;
      const baseAwayScore = matchingGame?.AwayScore ?? 20;

      const points = scoreType === 'TOUCHDOWN' || scoreType === 'PICK_SIX' ? 7 : scoreType === 'FIELD_GOAL' ? 3 : 2;
      const updatedHomeScore = isHomeScoring ? baseHomeScore + points : baseHomeScore;
      const updatedAwayScore = !isHomeScoring ? baseAwayScore + points : baseAwayScore;

      const newAlert: ScoringDriveAlert = {
        id: `score-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        gameKey,
        timestamp: Date.now(),
        scoreType,
        scoringTeam: scenario.team,
        scoringTeamName: getTeamName(scenario.team),
        scoringTeamColor: getTeamColor(scenario.team),
        opponentTeam: scenario.opponent,
        opponentTeamName: getTeamName(scenario.opponent),
        opponentTeamColor: getTeamColor(scenario.opponent),
        scoringPlayer: scenario.player,
        pointsAdded: points,
        updatedHomeScore,
        updatedAwayScore,
        homeTeam,
        awayTeam,
        quarter: 'Q4',
        timeRemaining: `${Math.floor(Math.random() * 9 + 1).toString().padStart(2, '0')}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
        drivePlays: scenario.plays,
        driveYards: scenario.yards,
        driveTimeOfPossession: scenario.top,
        playDescription: scenario.desc,
        epaGain: scenario.epa,
        winProbShift: scenario.winShift,
        isRedZoneStrike: scenario.isRedZone,
        read: false
      };

      dispatchAlert(newAlert);
      return newAlert;
    },
    [dispatchAlert]
  );

  // Background simulation ticker for live scoring drive alerts across the NFL slate
  useEffect(() => {
    if (!isAutoSimulationActive || !isNotificationsEnabled) return;

    // Trigger an initial alert on first visit after 4 seconds to give immediate live feedback
    const initialTimer = setTimeout(() => {
      triggerSampleScoringDrive('TOUCHDOWN', '202610101');
    }, 4000);

    // Periodic simulation every 45-60 seconds
    const interval = setInterval(() => {
      triggerSampleScoringDrive();
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isAutoSimulationActive, isNotificationsEnabled, triggerSampleScoringDrive]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <ScoringNotificationContext.Provider
      value={{
        alerts,
        activeToasts,
        unreadCount,
        isSoundEnabled,
        isNotificationsEnabled,
        isAutoSimulationActive,
        setIsSoundEnabled,
        setIsNotificationsEnabled,
        setIsAutoSimulationActive,
        dismissToast,
        markAllAsRead,
        clearAlertHistory,
        triggerSampleScoringDrive,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen
      }}
    >
      {children}
    </ScoringNotificationContext.Provider>
  );
};

export const useScoringNotifications = () => {
  const context = useContext(ScoringNotificationContext);
  if (!context) {
    throw new Error('useScoringNotifications must be used within a ScoringNotificationProvider');
  }
  return context;
};
