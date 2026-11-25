import {
  NotebookPen,
  Heart,
  Smile,
  Compass,
  Wind,
  Flower,
  Hourglass,
  Footprints,
  PersonStanding,
  Bike,
  Phone,
  Users,
  MessageCircleHeart,
  Coffee,
  BookOpen,
  TreePine,
  BedDouble,
  Palette,
  Brush,
  Sparkles,
} from 'lucide-react';

export const ACTIVITY_ICONS: Record<string, typeof Heart> = {
  journal: NotebookPen,
  gratitude: Heart,
  checkin: Smile,
  intentions: Compass,
  breathing: Wind,
  meditation: Flower,
  pause: Hourglass,
  walk: Footprints,
  stretch: PersonStanding,
  exercise: Bike,
  friend: Phone,
  family: Users,
  reachout: MessageCircleHeart,
  break: Coffee,
  reading: BookOpen,
  outdoors: TreePine,
  rest: BedDouble,
  create: Palette,
  'creative-log': Brush,
};

export function activityIcon(id: string) {
  return ACTIVITY_ICONS[id] ?? Sparkles;
}
