import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { defaultHomepage } from "discourse/lib/utilities";

export default class CustomHomepageContent extends Component {
  @service router;
  @tracked topUsers = [];

  constructor() {
    super(...arguments);
    this.loadLeaderboard();
  }

  get isHomepage() {
    const { currentRouteName } = this.router;
    return currentRouteName === `discovery.${defaultHomepage()}`;
  }

  @action
  async loadLeaderboard() {
    // Adjust order/period as needed
    const data = await ajax("/directory_items.json?order=likes_received&period=weekly");
    // Only take top 5 users and filter out staged or anonymized
    this.topUsers = data.directory_items
      .filter(item => !item.user.staged && !item.user.anonymized)
      .slice(0, 5)
      .map(item => item.user);
  }
}
