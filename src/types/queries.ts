import { LocationQuery } from 'vue-router';

export class CommitQuery {
  currentFile = '';

  constructor(query: LocationQuery) {
    if (typeof query.currentFile === 'string') {
      this.currentFile = query.currentFile;
    }
  }
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

export class ProjectIdQuery {
  project = '';

  constructor(query: LocationQuery) {
    if (typeof query.project === 'string') {
      this.project = query.project;
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
