import { makeAutoObservable, runInAction } from 'mobx';

import SpaceXService, { Launch } from '@/service/SpaceXService';

export type Tab = 'launched' | 'upcoming';

const service = new SpaceXService();

class LaunchesModel {
  launched: Launch[] = [];
  upcoming: Launch[] = [];
  selectedTab: Tab = 'launched';
  loading = true;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get data(): Launch[] {
    return this.selectedTab === 'launched' ? this.launched : this.upcoming;
  }

  selectTab(tab: Tab) {
    this.selectedTab = tab;
  }

  async fetchAll() {
    const [launchedResult, upcomingResult] = await Promise.all([
      service.fetchLaunches(),
      service.fetchUpcomingLaunches(),
    ]);

    runInAction(() => {
      if (launchedResult.success) this.launched = launchedResult.data;
      if (upcomingResult.success) this.upcoming = upcomingResult.data;
      if (!launchedResult.success) this.error = launchedResult.error.message;
      this.loading = false;
    });
  }
}

export default LaunchesModel;
