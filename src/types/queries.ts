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

export interface ProjectIdQuery {
  path: string;
  pid: number;
}

export class ProjectIdQuery {
  path = '';
  pid = 0;

  constructor(query: LocationQuery) {
    if (typeof query.path === 'string') {
      this.path = query.path;
    }
    if (typeof query.pid === 'string') {
      this.pid = parseInt(query.pid);
    }
  }
}
