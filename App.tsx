import { useState } from 'react';
import BottomNav from './components/BottomNav';
import { useGameProgress } from './hooks/useGameProgress';
import HomeScreen, { type GameKey } from './screens/HomeScreen';
import GamesScreen from './screens/GamesScreen';
import StatsScreen from './screens/StatsScreen';
import PredictMode from './games/PredictMode';
import EntryGame from './games/EntryGame';
import SupResGame from './games/SupResGame';
import TrendGame from './games/TrendGame';
import PatternQuiz from './games/PatternQuiz';
import ReplayMode from './games/ReplayMode';

export type ScreenKey =
  | 'home'
  | 'games'
  | 'replay'
  | 'stats'
  | 'predict'
  | 'entry'
  | 'supres'
  | 'trend'
  | 'pattern';

const TAB_KEYS: ScreenKey[] = ['home', 'games', 'replay', 'stats'];

export default function App() {
  const progress = useGameProgress();
  const [screen, setScreen] = useState<ScreenKey>('home');

  const handleStartGame = (game: GameKey) => setScreen(game);
  const backToGames = () => setScreen('games');

  let content: React.ReactNode;

  switch (screen) {
    case 'home':
      content = (
        <HomeScreen progress={progress} onNavigate={setScreen} onStartGame={handleStartGame} />
      );
      break;
    case 'games':
      content = <GamesScreen onBack={() => setScreen('home')} onStartGame={handleStartGame} />;
      break;
    case 'stats':
      content = <StatsScreen progress={progress} />;
      break;
    case 'replay':
      content = <ReplayMode onBack={() => setScreen('home')} />;
      break;
    case 'predict':
      content = <PredictMode progress={progress} onBack={backToGames} />;
      break;
    case 'entry':
      content = <EntryGame progress={progress} onBack={backToGames} />;
      break;
    case 'supres':
      content = <SupResGame progress={progress} onBack={backToGames} />;
      break;
    case 'trend':
      content = <TrendGame progress={progress} onBack={backToGames} />;
      break;
    case 'pattern':
      content = <PatternQuiz progress={progress} onBack={backToGames} />;
      break;
    default:
      content = null;
  }

  const showNav = TAB_KEYS.includes(screen);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[var(--color-bg)]">
      {content}
      {showNav && <BottomNav current={screen} onChange={(key) => setScreen(key)} />}
    </div>
  );
}
