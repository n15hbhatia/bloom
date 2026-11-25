import type { Plant, PlantKind } from '../types';

export interface PlantInfo {
  kind: PlantKind;
  label: string; // "a tree"
  title: string; // "Journal Tree"
  createdThrough: string;
  associatedWith: string;
  swatch: string;
}

export const PLANTS: Record<PlantKind, PlantInfo> = {
  tree: {
    kind: 'tree',
    label: 'a tree',
    title: 'Journal Tree',
    createdThrough: 'Journaling',
    associatedWith: 'Your personal reflection.',
    swatch: '#83B85D',
  },
  floweringPlant: {
    kind: 'floweringPlant',
    label: 'a flowering plant',
    title: 'Stillness Bloom',
    createdThrough: 'Meditation',
    associatedWith: 'The quiet moments you gave yourself.',
    swatch: '#A9A4E0',
  },
  smallFlower: {
    kind: 'smallFlower',
    label: 'a small flower',
    title: 'Breath Daisy',
    createdThrough: 'Breathing',
    associatedWith: 'Slowing down, one breath at a time.',
    swatch: '#F7F6F0',
  },
  floweringBush: {
    kind: 'floweringBush',
    label: 'a flowering bush',
    title: 'Gratitude Bush',
    createdThrough: 'Gratitude reflection',
    associatedWith: 'The good things you noticed.',
    swatch: '#EBA77F',
  },
  grassPatch: {
    kind: 'grassPatch',
    label: 'a patch of greenery',
    title: 'Wanderer’s Meadow',
    createdThrough: 'Walking',
    associatedWith: 'Moving through the world at your own pace.',
    swatch: '#83B85D',
  },
  leafyPlant: {
    kind: 'leafyPlant',
    label: 'a leafy plant',
    title: 'Vital Leaf',
    createdThrough: 'Movement',
    associatedWith: 'Caring for your body.',
    swatch: '#527D56',
  },
  twinTrees: {
    kind: 'twinTrees',
    label: 'two interconnected trees',
    title: 'Kindred Trees',
    createdThrough: 'Connection',
    associatedWith: 'The people who matter to you.',
    swatch: '#F0B9C4',
  },
  sapling: {
    kind: 'sapling',
    label: 'a small sapling',
    title: 'Reader’s Sapling',
    createdThrough: 'Reading',
    associatedWith: 'Feeding your curiosity.',
    swatch: '#B8D1B9',
  },
  pond: {
    kind: 'pond',
    label: 'a small pond',
    title: 'Resting Pond',
    createdThrough: 'Intentional rest',
    associatedWith: 'Letting yourself pause.',
    swatch: '#B8DDE5',
  },
  uniqueFlower: {
    kind: 'uniqueFlower',
    label: 'a one-of-a-kind flower',
    title: 'Maker’s Bloom',
    createdThrough: 'Creativity',
    associatedWith: 'Something only you could make.',
    swatch: '#E59AB8',
  },
  fern: {
    kind: 'fern',
    label: 'a fern',
    title: 'Check-in Fern',
    createdThrough: 'Emotional check-in',
    associatedWith: 'Noticing how you feel.',
    swatch: '#527D56',
  },
  tulip: {
    kind: 'tulip',
    label: 'a tulip',
    title: 'Intention Tulip',
    createdThrough: 'Setting intentions',
    associatedWith: 'What you hope to carry into your day.',
    swatch: '#EBA77F',
  },
  moss: {
    kind: 'moss',
    label: 'a mossy stone',
    title: 'Pause Moss',
    createdThrough: 'A mindful pause',
    associatedWith: 'Coming back to the present.',
    swatch: '#B8D1B9',
  },
  wildflowers: {
    kind: 'wildflowers',
    label: 'a cluster of wildflowers',
    title: 'Open-air Wildflowers',
    createdThrough: 'Time outdoors',
    associatedWith: 'Fresh air and open sky.',
    swatch: '#F2D27A',
  },
};

export const TREE_VARIANTS = ['Round leafy tree', 'Cherry blossom', 'Pine', 'Tall slender tree'];

export function plantTitle(p: Plant): string {
  return PLANTS[p.kind].title;
}

/** Botanical species shown under the title, e.g. "Cherry blossom". */
export function plantSpecies(p: Plant): string {
  switch (p.kind) {
    case 'tree':
      return TREE_VARIANTS[p.variant % TREE_VARIANTS.length];
    case 'floweringPlant':
      return 'Bellflower';
    case 'smallFlower':
      return 'Daisy';
    case 'floweringBush':
      return 'Flowering bush';
    case 'grassPatch':
      return 'Meadow grass';
    case 'leafyPlant':
      return 'Broad-leaf plant';
    case 'twinTrees':
      return 'Entwined trees';
    case 'sapling':
      return 'Sapling';
    case 'pond':
      return 'Lily pond';
    case 'uniqueFlower':
      return 'Unique bloom';
    case 'fern':
      return 'Fern';
    case 'tulip':
      return 'Tulip';
    case 'moss':
      return 'Moss & stone';
    case 'wildflowers':
      return 'Wildflowers';
  }
}

export const STAGE_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Sprout',
  2: 'Young',
  3: 'Mature',
};

/** Repeated engagement with the same activity nurtures a plant toward maturity. */
export const NURTURES_FOR_STAGE: Record<2 | 3, number> = { 2: 1, 3: 2 };

export function stageFromNurtures(n: number): 1 | 2 | 3 {
  if (n >= NURTURES_FOR_STAGE[3]) return 3;
  if (n >= NURTURES_FOR_STAGE[2]) return 2;
  return 1;
}
