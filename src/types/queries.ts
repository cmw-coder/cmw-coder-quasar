import { LocationQuery } from 'vue-router';

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

export class UpdateQuery {
  currentVersion = '';
  newVersion = '';
  releaseDate = '';

  constructor(query: LocationQuery) {
    if (typeof query.currentVersion === 'string') {
      this.currentVersion = query.currentVersion;
    }
    if (typeof query.newVersion === 'string') {
      this.newVersion = query.newVersion;
    }
    if (typeof query.releaseDate === 'string') {
      this.releaseDate = query.releaseDate;
    }
  }
}
