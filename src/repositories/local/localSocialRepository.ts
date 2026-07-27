import type { SocialRepository } from "../interfaces";

/**
 * 公開プロフィールの端末ローカル実装。
 * ローカル（未ログイン）モードは単一端末＝他ユーザーが存在しないため、
 * 検索・取得は常に空を返す。フレンド機能はログイン中のみ意味を持つ。
 */
export const localSocialRepository: SocialRepository = {
  async getPublicProfile() {
    return null;
  },
  async searchProfilesByName() {
    return [];
  },
};
