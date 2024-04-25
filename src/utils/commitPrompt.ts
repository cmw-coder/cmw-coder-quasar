import { chatWithDeepSeek, chatWithLinseer } from 'boot/axios';
import { NetworkZone, runtimeConfig } from 'shared/config';
import { FileChanges } from 'shared/types/svn';
import { ApiStyle } from 'shared/types/model';

export const generateCommitPrompt = (changedFile: FileChanges[]) => {
  const requirement = `请为如下的代码变动生成简略的提交信息:

  `;
  const changedText = changedFile
    .map(
      (file) =>
        '************************************************************\r\n' +
        `文件路径: ${file.path}\r\n` +
        `变动类型: ${file.status}\r\n` +
        '变动详情: \r\n' +
        `${file.diff}\r\n` +
        '************************************************************\r\n',
    )
    .join('\r\n');
  return requirement + changedText;
};

export const generateCommitMessage = async (
  endPoint: string,
  prompt: string,
  messageUpdateCallback: (message: string) => void,
  accessToken?: string,
) => {
  if (runtimeConfig.apiStyle === ApiStyle.Linseer) {
    if (accessToken) {
      await chatWithLinseer(endPoint, prompt, [], accessToken, (content) =>
        messageUpdateCallback(
          content
            .split('data:')
            .filter((item) => item.trim() !== '')
            .map((item) => JSON.parse(item.trim()).message)
            .join(''),
        ),
      );
    } else {
      throw new Error('Invalid access token');
    }
  } else {
    await chatWithDeepSeek(
      runtimeConfig.networkZone === NetworkZone.Secure
        ? 'http://10.113.12.206:9192'
        : 'http://10.113.36.127:9204',
      prompt,
      [],
      (content) =>
        messageUpdateCallback(
          content
            .split('data:')
            .filter((item) => item.trim() !== '')
            .map((item) => JSON.parse(item.trim()).choices[0].delta.content)
            .join(''),
        ),
    );
  }
};
