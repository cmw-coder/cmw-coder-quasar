import { LocationQuery } from 'vue-router';

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
