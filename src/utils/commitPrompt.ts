import { FileChanges } from 'shared/types/svn';
import { ApiStyle } from 'shared/types/model';
import { runtimeConfig } from 'shared/config';
import { chatWithDeepSeek, chatWithLinseer } from 'boot/axios';

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
  accessToken?: string,
) => {
  if (runtimeConfig.apiStyle === ApiStyle.Linseer) {
    if (accessToken) {
      const { data } = await chatWithLinseer(endPoint, prompt, [], accessToken);
      return data[0]?.code as string;
    } else {
      throw new Error('Invalid access token');
    }
  } else {
    const { data } = await chatWithDeepSeek(
      'http://10.113.36.127:9204',
      prompt,
      [],
    );
    return data.choices[0]?.message?.content || '';
  }
};
