export interface UserProfile {
  displayName: string;
  /** 累計経験値。レベルは levelService で導出する */
  xp: number;
  /** ISO 8601 */
  createdAt: string;
}
