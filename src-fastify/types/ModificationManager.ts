class ModificationManager {
  private subscriptions = new Map<
    string,
    (path: string, content: string) => void
  >();

  subscribe(name: string, callback: (path: string, content: string) => void) {
    this.subscriptions.set(name, callback);
  }

  updateModification(path: string, content: string) {
    for (const callback of this.subscriptions.values()) {
      callback(path, content);
    }
  }
}

export const modificationManager = new ModificationManager();
