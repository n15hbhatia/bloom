import type { Emotion } from '../types';

export const JOURNAL_PROMPTS = [
  'What has been on your mind today?',
  'What made you feel good today?',
  'What has been difficult recently?',
  'What are you grateful for?',
  'What do you want to let go of?',
];

export interface EmotionInfo {
  id: Emotion;
  label: string;
  color: string;
  suggestion: string; // activity id
  reply: string;
}

export const EMOTIONS: EmotionInfo[] = [
  { id: 'happy', label: 'Happy', color: '#F2C66D', suggestion: 'gratitude', reply: 'It’s lovely to hear that. Savour it for a moment.' },
  { id: 'calm', label: 'Calm', color: '#9CCBD6', suggestion: 'meditation', reply: 'A calm moment is worth noticing.' },
  { id: 'anxious', label: 'Anxious', color: '#C7B4E2', suggestion: 'breathing', reply: 'Thank you for naming it. That can take courage.' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: '#E9A8A0', suggestion: 'pause', reply: 'That sounds like a lot to hold. Go gently.' },
  { id: 'sad', label: 'Sad', color: '#9DB2D9', suggestion: 'friend', reply: 'It’s okay to feel this way. You don’t have to fix it right now.' },
  { id: 'tired', label: 'Tired', color: '#C9B9A6', suggestion: 'rest', reply: 'Your body might be asking for some rest.' },
  { id: 'motivated', label: 'Motivated', color: '#9BCB76', suggestion: 'intentions', reply: 'Nice — let’s give that energy somewhere to go.' },
  { id: 'uncertain', label: 'Uncertain', color: '#D8CFA8', suggestion: 'journal', reply: 'Not knowing is a very human place to be.' },
  { id: 'grateful', label: 'Grateful', color: '#EBA77F', suggestion: 'reachout', reply: 'Gratitude has a way of spreading.' },
  { id: 'neutral', label: 'Neutral', color: '#C9D3C9', suggestion: 'walk', reply: 'Neutral is a perfectly fine way to be.' },
];

export const INTENSITY_LABELS = ['A little', 'Somewhat', 'Moderately', 'Quite a lot', 'Very much'];

export function emotionInfo(id: Emotion): EmotionInfo {
  return EMOTIONS.find((e) => e.id === id)!;
}

export const ENCOURAGEMENTS = [
  'Every little thing you do for yourself matters.',
  'Your garden grows at your pace — there’s no falling behind.',
  'Small moments of care add up to something beautiful.',
  'Be as gentle with yourself as you would be with a seedling.',
  'Whatever today looks like, you’re welcome here.',
  'Rest counts. Reflection counts. You count.',
];

export const GROWTH_LINES = [
  'Your garden is growing beautifully.',
  'Something new is taking root.',
  'Look how far your garden has come.',
];

export const INTENTION_IDEAS = [
  'Be patient with myself',
  'Take breaks without guilt',
  'Notice one good thing',
  'Drink enough water',
  'Say no when I need to',
  'Move my body gently',
  'Ask for help if I need it',
  'Stay present in conversations',
];

export const AVATARS = [
  { id: 'leaf', bg: '#D9E9D8', fg: '#527D56' },
  { id: 'blossom', bg: '#F6E0E4', fg: '#C46B83' },
  { id: 'sun', bg: '#F8EBCB', fg: '#C48A2A' },
  { id: 'water', bg: '#DCEEF2', fg: '#4E7F8C' },
  { id: 'clay', bg: '#F3E1D3', fg: '#B26B43' },
  { id: 'moss', bg: '#E3EAD2', fg: '#5E7A35' },
];
