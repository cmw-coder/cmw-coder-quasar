import { FileChanges } from 'shared/types/service/SvnServiceTrait/types';

export const generateCommitPrompt = (changedFile: FileChanges[]) => {
  const requirement = `请为如下的代码变动生成简略的提交信息:

  `;
  const changedText = changedFile
    .map(
      (file) =>
        '************************************************************\n' +
        `文件路径: ${file.path}\n` +
        `变动类型: ${file.status}\n` +
        '变动详情: \n' +
        `${file.diff}\n` +
        '************************************************************\n',
    )
    .join('\n');
  return requirement + changedText;
};
