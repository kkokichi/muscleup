import {
  Crown,
  Dumbbell,
  Flame,
  Layers,
  MapPin,
  Mountain,
  Scale,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { AchievementTier } from "@/types";

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  Dumbbell,
  Flame,
  Trophy,
  Zap,
  Crown,
  Mountain,
  Layers,
  Scale,
  MapPin,
};

export const TIER_COLOR: Record<AchievementTier, string> = {
  bronze: "#c58a5a",
  silver: "#c4c8cc",
  gold: "#ffd23f",
};

export const TIER_LABEL: Record<AchievementTier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};
