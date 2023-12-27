import { LocationQuery } from 'vue-router';

export interface LoginQuery {
  userId: string;
  showMain: boolean;
}

export class LoginQuery {
  userId = '';
  showMain = false;

  constructor(query: LocationQuery) {
    if (typeof query.userId === 'string') {
      this.userId = query.userId;
    }
    if (query.showMain) {
      this.showMain = query.showMain === 'true';
    }
  }
}
