import { app, shell } from 'electron';
import path from 'path';
import * as fs from 'fs';
import { ChatFileContent, ChatItem } from 'shared/types/ChatMessage';
import log from 'electron-log/main';

const defaultChatFileContent: ChatFileContent = {
  createTime: new Date().valueOf(),
  messageList: [],
};

export class LocalChatManager {
  private readonly localChatDir: string;

  constructor() {
    this.localChatDir = path.join(app.getPath('userData'), 'chatList');
    this.checkChatListDir();
  }

  checkChatListDir() {
    if (!fs.existsSync(this.localChatDir)) {
      fs.mkdirSync(this.localChatDir);
    }
    const defaultChatFile = path.join(this.localChatDir, 'default_chat.json');
    if (!fs.existsSync(defaultChatFile)) {
      defaultChatFileContent.createTime = new Date().valueOf();
      fs.writeFileSync(defaultChatFile, JSON.stringify(defaultChatFileContent));
    }
  }

  getChatList() {
    const res: ChatItem[] = [];
    const allFiles = fs.readdirSync(this.localChatDir);
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      if (file.endsWith('_chat.json')) {
        const name = file.replaceAll('_chat.json', '');
        res.push({
          name,
          filepath: path.join(this.localChatDir, file),
        });
      }
    }
    return res;
  }

  getChat(name: string) {
    const filename = `${name}_chat.json`;
    const filepath = path.join(this.localChatDir, filename);
    if (!fs.existsSync(filepath)) {
      defaultChatFileContent.createTime = new Date().valueOf();
      fs.writeFileSync(filepath, JSON.stringify(defaultChatFileContent));
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content) as ChatFileContent;
  }

  newChat(name: string) {
    const filename = `${name}_chat.json`;
    const filepath = path.join(this.localChatDir, filename);
    if (!fs.existsSync(filepath)) {
      defaultChatFileContent.createTime = new Date().valueOf();
      fs.writeFileSync(filepath, JSON.stringify(defaultChatFileContent));
    }
    return filepath;
  }

  saveChat(name: string, content: ChatFileContent) {
    const filename = `${name}_chat.json`;
    const filepath = path.join(this.localChatDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(content));
    return filepath;
  }

  deleteChat(name: string) {
    const filename = `${name}_chat.json`;
    const filepath = path.join(this.localChatDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  openChatListDir() {
    shell
      .openPath(this.localChatDir)
      .catch((e) => log.warn('openChatListDir', e));
  }
}
