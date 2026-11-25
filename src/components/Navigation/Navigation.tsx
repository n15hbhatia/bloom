import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Flower2, NotebookPen, BarChart3, CircleUser, Plus, Lock } from 'lucide-react';
import { Logo } from '../ui';

export const NAV = [
  { to: '/', label: 'Garden', icon: Sprout, end: true },
  { to: '/focus', label: 'Focus', icon: Flower2, end: false },
  { to: '/journal', label: 'Journal', icon: NotebookPen, end: false },
  { to: '/insights', label: 'Insights', icon: BarChart3, end: false },
  { to: '/profile', label: 'Profile', icon: CircleUser, end: false },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-cream/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${isActive ? 'text-deep' : 'text-muted/80 hover:text-deep'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span layoutId="bnav" className="absolute top-1.5 h-8 w-12 rounded-full bg-mint" transition={{ type: 'spring', damping: 30, stiffness: 400 }} />
                  )}
                  <Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} className="relative" />
                  <span className="relative">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Sidebar() {
  const nav = useNavigate();
  return (
    <aside className="sticky top-0 hidden h-dvh w-[244px] shrink-0 flex-col border-r border-line/70 bg-cream/60 px-5 py-7 lg:flex">
      <div className="px-2">
        <Logo />
        <p className="mt-1.5 pl-[38px] text-xs font-medium text-muted">Grow at your own pace.</p>
      </div>
      <nav aria-label="Main" className="mt-10">
        <ul className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold transition-colors ${isActive ? 'text-deep' : 'text-muted hover:bg-black/[0.03] hover:text-deep'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="snav" className="absolute inset-0 rounded-2xl bg-mint" transition={{ type: 'spring', damping: 30, stiffness: 400 }} />}
                    <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} className="relative" />
                    <span className="relative">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <button className="btn-primary mt-8 w-full" onClick={() => nav('/focus')}>
        <Plus size={18} /> Take a moment
      </button>
      <div className="mt-auto rounded-2xl bg-white/70 p-4 text-xs leading-relaxed text-muted">
        <p className="mb-1 flex items-center gap-1.5 font-bold text-deep">
          <Lock size={13} /> Private by design
        </p>
        Everything stays in this browser. Nothing is uploaded.
      </div>
    </aside>
  );
}
