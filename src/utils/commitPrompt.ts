import { FileChanges } from 'shared/types/service/SvnServiceTrait/types';

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
