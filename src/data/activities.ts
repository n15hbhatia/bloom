import type { CategoryId, InteractionType, PlantKind } from '../types';

export interface Category {
  id: CategoryId;
  title: string;
  blurb: string;
  tint: string; // background tint
  ink: string; // accent
}

export const CATEGORIES: Category[] = [
  { id: 'reflection', title: 'Reflection', blurb: 'Make sense of your days', tint: '#E7EFE3', ink: '#527D56' },
  { id: 'mindfulness', title: 'Mindfulness', blurb: 'Return to the present', tint: '#E4EEF2', ink: '#4E7F8C' },
  { id: 'movement', title: 'Movement', blurb: 'Gentle ways to move', tint: '#EEF2DC', ink: '#5E8A3A' },
  { id: 'connection', title: 'Connection', blurb: 'Lean on your people', tint: '#F6E6E6', ink: '#A0646E' },
  { id: 'recovery', title: 'Recovery', blurb: 'Rest is productive too', tint: '#F4ECE2', ink: '#94775C' },
  { id: 'creativity', title: 'Creativity', blurb: 'Make something, just because', tint: '#F6E9F0', ink: '#A65C82' },
];

export interface TimerConfig {
  options: number[]; // minutes
  guidance: string[]; // rotating lines
  visual: 'orb' | 'ripple' | 'leaf';
  allowSkip?: boolean;
}

export interface StepsConfig {
  steps: { title: string; detail: string; seconds: number }[];
}

export interface LogConfig {
  question: string;
  chips: string[];
  minutes?: number[];
  notePlaceholder: string;
  tips?: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  minutes?: number;
  reward: PlantKind;
  interaction: InteractionType;
  completionLine: string;
  timer?: TimerConfig;
  steps?: StepsConfig;
  log?: LogConfig;
}

export const ACTIVITIES: Activity[] = [
  // ——— Reflection
  {
    id: 'journal',
    title: 'Daily journaling',
    description: 'Write freely about whatever is on your mind.',
    category: 'reflection',
    minutes: 10,
    reward: 'tree',
    interaction: 'journal',
    completionLine: 'Beautiful. You made some time for yourself today.',
  },
  {
    id: 'gratitude',
    title: 'Gratitude reflection',
    description: 'Notice up to three good things, big or small.',
    category: 'reflection',
    minutes: 3,
    reward: 'floweringBush',
    interaction: 'gratitude',
    completionLine: 'Noticing the good is a quiet kind of strength.',
  },
  {
    id: 'checkin',
    title: 'Emotional check-in',
    description: 'Name how you’re feeling, without judging it.',
    category: 'reflection',
    minutes: 1,
    reward: 'fern',
    interaction: 'checkin',
    completionLine: 'Thank you for checking in with yourself.',
  },
  {
    id: 'intentions',
    title: 'Personal intentions',
    description: 'Choose one or two things you’d like to carry today.',
    category: 'reflection',
    minutes: 2,
    reward: 'tulip',
    interaction: 'intentions',
    completionLine: 'A gentle direction for your day. Hold it lightly.',
  },
  // ——— Mindfulness
  {
    id: 'breathing',
    title: 'Guided breathing',
    description: 'A slow, steady rhythm to settle your body.',
    category: 'mindfulness',
    minutes: 2,
    reward: 'smallFlower',
    interaction: 'breathing',
    completionLine: 'Every breath you took was just for you.',
  },
  {
    id: 'meditation',
    title: 'Short meditation',
    description: 'Sit with a few minutes of quiet guidance.',
    category: 'mindfulness',
    minutes: 5,
    reward: 'floweringPlant',
    interaction: 'timer',
    completionLine: 'You gave yourself a few minutes of stillness.',
    timer: {
      options: [1, 3, 5, 10],
      visual: 'orb',
      guidance: [
        'Find a comfortable position. Let your shoulders soften.',
        'Notice the weight of your body being supported.',
        'Bring your attention to the breath, wherever you feel it most.',
        'If your mind wanders, that’s okay. Gently come back.',
        'Notice the sounds around you, without needing to name them.',
        'Let each out-breath be a little longer than the last.',
        'There’s nothing you need to do right now.',
        'Rest here, just as you are.',
      ],
    },
  },
  {
    id: 'pause',
    title: 'Mindful pause',
    description: 'A one-minute grounding using your five senses.',
    category: 'mindfulness',
    minutes: 1,
    reward: 'moss',
    interaction: 'grounding',
    completionLine: 'You came back to the here and now.',
  },
  // ——— Movement
  {
    id: 'walk',
    title: 'Go for a walk',
    description: 'Step outside, or just around the block.',
    category: 'movement',
    minutes: 15,
    reward: 'grassPatch',
    interaction: 'log',
    completionLine: 'Every step counts — and so do you.',
    log: {
      question: 'How was your walk?',
      chips: ['Around the block', 'In a park', 'With someone', 'Listening to music', 'In silence'],
      minutes: [5, 10, 20, 30, 45],
      notePlaceholder: 'Anything you noticed along the way? (optional)',
      tips: ['Notice three colours around you.', 'Let your pace be whatever it is today.', 'Look up at the sky once.'],
    },
  },
  {
    id: 'stretch',
    title: 'Stretching',
    description: 'A short guided sequence to release tension.',
    category: 'movement',
    minutes: 4,
    reward: 'leafyPlant',
    interaction: 'steps',
    completionLine: 'Your body thanks you for the attention.',
    steps: {
      steps: [
        { title: 'Neck rolls', detail: 'Slowly drop your chin and roll your head side to side.', seconds: 30 },
        { title: 'Shoulder release', detail: 'Lift your shoulders to your ears, hold, and let them fall.', seconds: 30 },
        { title: 'Side reach', detail: 'Reach one arm overhead and lean gently. Switch sides.', seconds: 40 },
        { title: 'Forward fold', detail: 'Bend softly at the hips. Let your arms hang heavy.', seconds: 40 },
        { title: 'Open chest', detail: 'Clasp your hands behind you and lift your chest.', seconds: 30 },
        { title: 'Shake it out', detail: 'Gently shake out your hands, arms and legs.', seconds: 20 },
      ],
    },
  },
  {
    id: 'exercise',
    title: 'Light exercise',
    description: 'Any movement that feels good — dance, cycle, yoga.',
    category: 'movement',
    minutes: 20,
    reward: 'leafyPlant',
    interaction: 'log',
    completionLine: 'You moved in a way that felt right for you.',
    log: {
      question: 'What kind of movement did you do?',
      chips: ['Yoga', 'Dancing', 'Cycling', 'Swimming', 'Home workout', 'Sport', 'Something else'],
      minutes: [10, 20, 30, 45, 60],
      notePlaceholder: 'How does your body feel now? (optional)',
    },
  },
  // ——— Connection
  {
    id: 'friend',
    title: 'Speak to a friend',
    description: 'A call, a voice note or a coffee together.',
    category: 'connection',
    minutes: 15,
    reward: 'twinTrees',
    interaction: 'log',
    completionLine: 'Connection is one of the best things we can grow.',
    log: {
      question: 'How did you connect?',
      chips: ['Phone call', 'Video call', 'In person', 'Messages', 'Voice note'],
      notePlaceholder: 'Anything from the conversation you want to remember? (optional)',
    },
  },
  {
    id: 'family',
    title: 'Spend time with family',
    description: 'Share a meal, a walk or simply some time.',
    category: 'connection',
    minutes: 30,
    reward: 'twinTrees',
    interaction: 'log',
    completionLine: 'Time together has its own quiet way of healing.',
    log: {
      question: 'What did you do together?',
      chips: ['Shared a meal', 'Talked', 'Went outside', 'Watched something', 'Played a game', 'Just sat together'],
      notePlaceholder: 'A moment you’d like to keep? (optional)',
    },
  },
  {
    id: 'reachout',
    title: 'Reach out to someone',
    description: 'Send a kind message to someone on your mind.',
    category: 'connection',
    minutes: 3,
    reward: 'twinTrees',
    interaction: 'log',
    completionLine: 'A small message can mean a lot — to both of you.',
    log: {
      question: 'Who did you reach out to?',
      chips: ['An old friend', 'A family member', 'A colleague', 'A neighbour', 'Someone new'],
      notePlaceholder: 'What did you say? (optional)',
      tips: ['“Thinking of you today.”', '“I saw this and it reminded me of you.”', '“How have you been, really?”'],
    },
  },
  // ——— Recovery
  {
    id: 'break',
    title: 'Take an intentional break',
    description: 'Step away from what you’re doing, on purpose.',
    category: 'recovery',
    minutes: 5,
    reward: 'pond',
    interaction: 'timer',
    completionLine: 'Rest isn’t a reward. It’s something you deserve.',
    timer: {
      options: [2, 5, 10, 15],
      visual: 'ripple',
      allowSkip: true,
      guidance: [
        'Put down what you were doing. It will still be there.',
        'Let your eyes rest on something far away.',
        'Unclench your jaw. Drop your shoulders.',
        'Have a sip of water if you can.',
        'Nothing to fix, nothing to finish. Just a pause.',
      ],
    },
  },
  {
    id: 'reading',
    title: 'Read something',
    description: 'A few pages of something you enjoy.',
    category: 'recovery',
    minutes: 15,
    reward: 'sapling',
    interaction: 'log',
    completionLine: 'A few pages, a little more room in your mind.',
    log: {
      question: 'What did you read?',
      chips: ['A novel', 'Non-fiction', 'Poetry', 'An article', 'A comic', 'Something else'],
      minutes: [5, 10, 20, 30, 60],
      notePlaceholder: 'Title, or a line that stayed with you (optional)',
    },
  },
  {
    id: 'outdoors',
    title: 'Spend time outdoors',
    description: 'Sit in the sun, tend a plant, feel the air.',
    category: 'recovery',
    minutes: 15,
    reward: 'wildflowers',
    interaction: 'log',
    completionLine: 'A little open sky goes a long way.',
    log: {
      question: 'Where did you spend time?',
      chips: ['Garden or balcony', 'Park', 'By water', 'In the woods', 'On a bench', 'Somewhere new'],
      minutes: [5, 15, 30, 60],
      notePlaceholder: 'What was the weather like? (optional)',
    },
  },
  {
    id: 'rest',
    title: 'Rest without distractions',
    description: 'No phone, no screens. Just you, resting.',
    category: 'recovery',
    minutes: 10,
    reward: 'pond',
    interaction: 'timer',
    completionLine: 'You let yourself simply be. That matters.',
    timer: {
      options: [5, 10, 15, 20],
      visual: 'ripple',
      allowSkip: true,
      guidance: [
        'Put your phone face down, or in another room.',
        'Lie down or lean back somewhere comfortable.',
        'You don’t have to think about anything in particular.',
        'If thoughts come, let them drift by like clouds.',
        'We’ll let you know gently when time is up.',
      ],
    },
  },
  // ——— Creativity
  {
    id: 'create',
    title: 'Make something',
    description: 'Doodle freely on a little canvas. No skill needed.',
    category: 'creativity',
    minutes: 5,
    reward: 'uniqueFlower',
    interaction: 'creative',
    completionLine: 'You made something that didn’t exist before.',
  },
  {
    id: 'creative-log',
    title: 'Creative time',
    description: 'Log time spent painting, music, crafts, cooking…',
    category: 'creativity',
    minutes: 20,
    reward: 'uniqueFlower',
    interaction: 'log',
    completionLine: 'Creating for its own sake is a gift to yourself.',
    log: {
      question: 'What did you create?',
      chips: ['Drawing', 'Painting', 'Music', 'Writing', 'Cooking', 'Crafts', 'Photography'],
      minutes: [10, 20, 30, 60, 90],
      notePlaceholder: 'Tell your future self about it (optional)',
    },
  },
];

export const WELCOME_ACTIVITY_ID = 'welcome';

export function getActivity(id: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

export function activityTitle(id: string): string {
  if (id === WELCOME_ACTIVITY_ID) return 'Starting BLOOM';
  return getActivity(id)?.title ?? 'Activity';
}

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id)!;
}
