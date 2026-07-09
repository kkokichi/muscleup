import type { UserProfile } from "@/types";
import type { UserProfileRepository } from "../interfaces";
import { readStorage, writeStorage } from "./storage";

const KEY = "userProfile";

const DEFAULT_PROFILE: UserProfile = {
  displayName: "トレーニー",
  xp: 0,
  createdAt: new Date(0).toISOString(),
};

export const localUserProfileRepository: UserProfileRepository = {
  async get() {
    const profile = readStorage<UserProfile | null>(KEY, null);
    if (profile) return profile;
    const fresh: UserProfile = {
      ...DEFAULT_PROFILE,
      createdAt: new Date().toISOString(),
    };
    writeStorage(KEY, fresh);
    return fresh;
  },

  async save(profile) {
    writeStorage(KEY, profile);
  },
};
