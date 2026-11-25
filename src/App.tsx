import { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { BottomNav, Sidebar } from './components/Navigation/Navigation';
import { PlantingCelebration } from './components/Activity/PlantingCelebration';
import { useBloom } from './state/store';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useReminder } from './hooks/useReminder';
import Home from './pages/Home';
import Focus from './pages/Focus';
import ActivityPage from './pages/ActivityPage';
import Journal from './pages/Journal';
import JournalEntryPage from './pages/JournalEntryPage';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Charts are only needed on one page.
const Insights = lazy(() => import('./pages/Insights'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const reduced = useReducedMotion();
  // Animate between top-level sections; sub-pages share their section's key.
  const section = location.pathname.split('/')[1] || 'home';
  const key = section === 'journal' || section === 'focus' ? location.pathname : section;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={key}
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : -6 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="min-w-0 flex-1"
      >
        <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<div className="p-10 text-sm text-muted">Loading…</div>}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/focus/:id" element={<ActivityPage />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/new" element={<JournalEntryPage />} />
            <Route path="/journal/:id" element={<JournalEntryPage />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </motion.main>
    </AnimatePresence>
  );
}

function Shell() {
  const onboarded = useBloom((s) => s.profile.onboarded);
  const reduced = useReducedMotion();
  useReminder();
  if (!onboarded) return <Onboarding />;
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <div className="flex min-h-dvh">
        <Sidebar />
        <AnimatedRoutes />
      </div>
      <BottomNav />
      <PlantingCelebration />
      <ScrollToTop />
    </MotionConfig>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
