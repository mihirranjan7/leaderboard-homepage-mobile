import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { defaultHomepage } from "discourse/lib/utilities";

const CLOSED_KEY = "leaderboardClosedUntil";
const CACHE_KEY = "cachedLeaderboardData";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export default class CustomHomepageContent extends Component {
  @service router;

  @tracked topUsers = [];
  @tracked closed = false;

  constructor() {
    super(...arguments);
    this.checkIfClosed();
    this.loadLeaderboard();
  }

  get isHomepage() {
    const { currentRouteName } = this.router;
    return currentRouteName === `discovery.${defaultHomepage()}`;
  }

  checkIfClosed() {
    const saved = localStorage.getItem(CLOSED_KEY);
    if (saved && Date.now() < parseInt(saved, 10)) {
      this.closed = true;
    }
  }

  @action
  async loadLeaderboard() {
    if (this.closed) return;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          this.topUsers = data;
          return;
        }
      } catch (e) {
        console.warn("Failed to parse cached leaderboard data", e);
      }
    }

    const data = await ajax("/directory_items.json?order=likes_received&period=weekly");
    const filteredUsers = data.directory_items
      .filter(item => !item.user.staged && !item.user.anonymized)
      .slice(0, 20)
      .map(item => item.user);

    this.topUsers = filteredUsers;

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: filteredUsers
      })
    );
  }

  @action
  closeLeaderboard() {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 day
    localStorage.setItem(CLOSED_KEY, (Date.now() + ONE_DAY_MS).toString());
    this.closed = true;
  }
}
