import { app, shell } from 'electron';
import log from 'electron-log/main';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';

import { ChatFileContent, ChatItem } from 'shared/types/ChatMessage';

const defaultChatFileContent: ChatFileContent = {
  createTime: new Date().valueOf(),
  messageList: [],
};

export class LocalChatManager {
  private readonly localChatDir: string;

  constructor() {
    this.localChatDir = join(app.getPath('userData'), 'chatList');
    this.checkChatListDir();
  }

  checkChatListDir() {
    if (!existsSync(this.localChatDir)) {
      mkdirSync(this.localChatDir);
    }
    const defaultChatFile = join(this.localChatDir, 'default_chat.json');
    if (!existsSync(defaultChatFile)) {
      defaultChatFileContent.createTime = new Date().valueOf();
      writeFileSync(defaultChatFile, JSON.stringify(defaultChatFileContent));
    }
  }

  getChatList() {
    const res: ChatItem[] = [];
    const allFiles = readdirSync(this.localChatDir);
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      if (file.endsWith('_chat.json')) {
        const name = file.replaceAll('_chat.json', '');
        res.push({
          name,
          filepath: join(this.localChatDir, file),
        });
      }
    }
    return res;
  }

  getChat(name: string) {
    const filename = `${name}_chat.json`;
    const filepath = join(this.localChatDir, filename);
    if (!existsSync(filepath)) {
      defaultChatFileContent.createTime = new Date().valueOf();
      writeFileSync(filepath, JSON.stringify(defaultChatFileContent));
    }
    const content = readFileSync(filepath, 'utf-8');
    return JSON.parse(content) as ChatFileContent;
  }

  newChat(name: string) {
    const filename = `${name}_chat.json`;
    const filepath = join(this.localChatDir, filename);
    if (!existsSync(filepath)) {
      defaultChatFileContent.createTime = new Date().valueOf();
      writeFileSync(filepath, JSON.stringify(defaultChatFileContent));
    }
    return filepath;
  }

  saveChat(name: string, content: ChatFileContent) {
    const filename = `${name}_chat.json`;
    const filepath = join(this.localChatDir, filename);
    writeFileSync(filepath, JSON.stringify(content));
    return filepath;
  }

  deleteChat(name: string) {
    const filename = `${name}_chat.json`;
    const filepath = join(this.localChatDir, filename);
    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }
  }

  openChatListDir() {
    shell
      .openPath(this.localChatDir)
      .catch((e) => log.warn('openChatListDir', e));
  }
}
