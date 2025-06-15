import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { defaultHomepage } from "discourse/lib/utilities";

const CLOSED_KEY = "leaderboardClosedUntil";

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

    const data = await ajax("/directory_items.json?order=likes_received&period=weekly");
    this.topUsers = data.directory_items
      .filter(item => !item.user.staged && !item.user.anonymized)
      .slice(0, 20)
      .map(item => item.user);
  }

  @action
  closeLeaderboard() {
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    localStorage.setItem(CLOSED_KEY, (Date.now() + TWO_DAYS_MS).toString());
    this.closed = true;
  }
}
