export type PlantKind =
  | 'tree' // journal — variant picks cherry / round / pine / slender
  | 'floweringPlant' // meditation
  | 'smallFlower' // breathing (daisy)
  | 'floweringBush' // gratitude
  | 'grassPatch' // walking
  | 'leafyPlant' // exercise / stretching
  | 'twinTrees' // social connection
  | 'sapling' // reading
  | 'pond' // rest
  | 'uniqueFlower' // creative
  | 'fern' // emotional check-in
  | 'tulip' // intentions
  | 'moss' // mindful pause
  | 'wildflowers'; // time outdoors

export type CategoryId = 'reflection' | 'mindfulness' | 'movement' | 'connection' | 'recovery' | 'creativity';

export type InteractionType =
  | 'journal'
  | 'gratitude'
  | 'checkin'
  | 'intentions'
  | 'breathing'
  | 'timer'
  | 'grounding'
  | 'steps'
  | 'log'
  | 'creative';

export interface Plant {
  id: string;
  kind: PlantKind;
  variant: number;
  x: number;
  z: number;
  stage: 1 | 2 | 3;
  nurtures: number;
  plantedAt: string; // ISO
  activityId: string;
  logId: string;
  journalEntryId?: string;
  hue?: number; // for unique flowers
  name?: string;
}

export interface ActivityLog {
  id: string;
  activityId: string;
  category: CategoryId;
  completedAt: string;
  plantId?: string;
  minutes?: number;
  note?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  date: string; // yyyy-mm-dd chosen by user
  prompt?: string;
  createdAt: string;
  updatedAt: string;
  plantId?: string;
}

export type Emotion =
  | 'happy'
  | 'calm'
  | 'anxious'
  | 'overwhelmed'
  | 'sad'
  | 'tired'
  | 'motivated'
  | 'uncertain'
  | 'grateful'
  | 'neutral';

export interface CheckIn {
  id: string;
  emotion: Emotion;
  intensity: number; // 1–5
  note?: string;
  createdAt: string;
}

export interface Preferences {
  motion: 'system' | 'reduced' | 'full';
  encouragement: boolean;
  reminders: boolean;
  reminderTime: string; // HH:MM
}

export interface Profile {
  name: string;
  avatar: string; // id of avatar option
  createdAt: string;
  onboarded: boolean;
}

export interface AppState {
  version: number;
  profile: Profile;
  preferences: Preferences;
  garden: { size: number; plants: Plant[] };
  logs: ActivityLog[];
  journal: JournalEntry[];
  checkIns: CheckIn[];
  lastPlantedId?: string;
}
