import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { EMOTIONS, INTENSITY_LABELS, emotionInfo } from '../../data/content';
import { saveCheckIn } from '../../state/store';
import { celebrate } from '../../state/ui';
import { getActivity } from '../../data/activities';
import type { Emotion } from '../../types';

function Face({ color, mood }: { color: string; mood: Emotion }) {
  // tiny friendly faces — expressions are suggestions, not judgements
  const mouth: Record<Emotion, string> = {
    happy: 'M12 21 Q18 27 24 21',
    calm: 'M13 22 Q18 25 23 22',
    anxious: 'M12 23 Q15 21 18 23 Q21 25 24 23',
    overwhelmed: 'M14 24 Q18 20 22 24',
    sad: 'M13 24 Q18 20 23 24',
    tired: 'M14 23 L22 23',
    motivated: 'M12 20 Q18 28 24 20',
    uncertain: 'M13 23 Q17 21 23 24',
    grateful: 'M12 21 Q18 26 24 21',
    neutral: 'M13 23 L23 23',
  };
  const closedEyes = mood === 'calm' || mood === 'grateful' || mood === 'tired';
  return (
    <svg viewBox="0 0 36 36" className="h-11 w-11" aria-hidden>
      <circle cx="18" cy="18" r="17" fill={color} />
      {closedEyes ? (
        <>
          <path d="M10 15 Q12.5 17 15 15" stroke="#35543D" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M21 15 Q23.5 17 26 15" stroke="#35543D" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="12.5" cy="15" r="1.8" fill="#35543D" />
          <circle cx="23.5" cy="15" r="1.8" fill="#35543D" />
        </>
      )}
      <path d={mouth[mood]} stroke="#35543D" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CheckInFlow() {
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState('');

  const save = () => {
    if (!emotion) return;
    const { result } = saveCheckIn(emotion, intensity, note);
    const info = emotionInfo(emotion);
    const sug = getActivity(info.suggestion);
    celebrate({
      result,
      activityId: 'checkin',
      headline: info.reply,
      suggestion: sug ? { activityId: sug.id, text: `If it feels right, you could try: ${sug.title.toLowerCase()}.` } : undefined,
      returnTo: { path: '/insights', label: 'See my check-in history' },
    });
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-medium text-deep">How are you feeling today?</h2>
      <p className="mt-1 text-sm text-muted">There are no right or wrong answers. Every feeling is welcome here.</p>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Emotion">
        {EMOTIONS.map((e) => (
          <motion.button
            key={e.id}
            whileTap={{ scale: 0.95 }}
            role="radio"
            aria-checked={emotion === e.id}
            onClick={() => setEmotion(e.id)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-sm font-semibold transition ${emotion === e.id ? 'border-forest bg-mint text-deep' : 'border-line bg-white text-ink hover:border-sage'}`}
          >
            <Face color={e.color} mood={e.id} />
            {e.label}
          </motion.button>
        ))}
      </div>

      <motion.div initial={false} animate={{ opacity: emotion ? 1 : 0.4 }} className="mt-6">
        <label htmlFor="intensity" className="label">
          How strongly?
        </label>
        <div className="mt-3 flex items-center gap-4">
          <input
            id="intensity"
            type="range"
            min={1}
            max={5}
            step={1}
            value={intensity}
            disabled={!emotion}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="flex-1"
            aria-valuetext={INTENSITY_LABELS[intensity - 1]}
          />
          <span className="w-28 text-right text-sm font-semibold text-deep">{INTENSITY_LABELS[intensity - 1]}</span>
        </div>

        <label htmlFor="checkin-note" className="label mb-2 mt-6 block">
          Want to say more? (optional)
        </label>
        <textarea
          id="checkin-note"
          className="field min-h-[96px] resize-y"
          placeholder="What might be behind this feeling?"
          value={note}
          disabled={!emotion}
          onChange={(e) => setNote(e.target.value)}
        />
      </motion.div>

      <button className="btn-primary mt-6 w-full sm:w-auto" disabled={!emotion} onClick={save}>
        <Check size={16} /> Save check-in
      </button>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        BLOOM isn’t a diagnostic tool. If you’re struggling or feel unsafe, please reach out to someone you trust or a local support service.
      </p>
    </div>
  );
}
