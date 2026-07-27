import type { SocialRepository } from "../interfaces";

/**
 * 公開プロフィール＋フレンド関係の端末ローカル実装。
 * ローカル（未ログイン）モードは単一端末＝他ユーザーが存在しないため、
 * 取得系は空を返し、更新系は何もしない。フレンド機能はログイン中のみ意味を持つ
 * （UI 側もログイン中しか呼ばない）。
 */
export const localSocialRepository: SocialRepository = {
  async getPublicProfile() {
    return null;
  },
  async searchProfilesByName() {
    return [];
  },
  async sendFriendRequest() {
    /* no-op */
  },
  async getReceivedRequests() {
    return [];
  },
  async getSentRequests() {
    return [];
  },
  async acceptFriendRequest() {
    /* no-op */
  },
  async declineFriendRequest() {
    /* no-op */
  },
  async cancelFriendRequest() {
    /* no-op */
  },
  async getFriends() {
    return [];
  },
  async getRelationship() {
    return { state: "none" };
  },
};
