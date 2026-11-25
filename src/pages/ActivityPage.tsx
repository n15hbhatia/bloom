import { Navigate, useParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { getActivity, getCategory } from '../data/activities';
import { PLANTS } from '../data/plants';
import { PageHeader } from '../components/ui';
import { activityIcon } from '../components/Activity/icons';
import {
  BreathingExercise,
  CreativeActivity,
  GratitudeActivity,
  GroundingActivity,
  IntentionsActivity,
  LogActivity,
  StepsActivity,
  TimerActivity,
} from '../components/Activity/Interactions';
import { CheckInFlow } from '../components/CheckIn/CheckInFlow';

export default function ActivityPage() {
  const { id = '' } = useParams();
  const activity = getActivity(id);
  if (!activity) return <Navigate to="/focus" replace />;
  if (activity.interaction === 'journal') return <Navigate to="/journal/new" replace />;
  const cat = getCategory(activity.category);
  const Icon = activityIcon(activity.id);

  const body = (() => {
    switch (activity.interaction) {
      case 'breathing':
        return <BreathingExercise activity={activity} />;
      case 'timer':
        return <TimerActivity activity={activity} />;
      case 'grounding':
        return <GroundingActivity activity={activity} />;
      case 'steps':
        return <StepsActivity activity={activity} />;
      case 'gratitude':
        return <GratitudeActivity activity={activity} />;
      case 'intentions':
        return <IntentionsActivity activity={activity} />;
      case 'creative':
        return <CreativeActivity activity={activity} />;
      case 'checkin':
        return <CheckInFlow />;
      default:
        return <LogActivity activity={activity} />;
    }
  })();

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
      <PageHeader back="/focus" eyebrow={cat.title} title={activity.title} subtitle={activity.description} />
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: cat.tint, color: cat.ink }}>
          <Icon size={14} /> {cat.title}
        </span>
        {activity.minutes && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-muted">
            <Clock size={13} /> About {activity.minutes} min
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-muted">
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ background: PLANTS[activity.reward].swatch }} />
          Grows {PLANTS[activity.reward].label}
        </span>
      </div>
      <div key={activity.id}>{body}</div>
    </div>
  );
}
