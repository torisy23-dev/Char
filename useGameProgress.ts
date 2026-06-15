import type { ScreenKey } from '../App';

interface NavItem {
  key: ScreenKey;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'ホーム', icon: '🏠' },
  { key: 'games', label: 'ゲーム', icon: '🎮' },
  { key: 'replay', label: 'リプレイ', icon: '⏯️' },
  { key: 'stats', label: '記録', icon: '📊' },
];

interface BottomNavProps {
  current: ScreenKey;
  onChange: (key: ScreenKey) => void;
}

export default function BottomNav({ current, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur safe-bottom">
      <div className="mx-auto flex max-w-md">
        {NAV_ITEMS.map((item) => {
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors ${
                active ? 'text-[var(--color-accent)]' : 'text-gray-500'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
