import { ChangedFile } from 'app/src-electron/shared/types/SvnType';

export const generateCommitPrompt = (changedFile: ChangedFile[]) => {
  const requirement = `请为如下的代码变动生成简略的提交信息:

  `;
  const changedText = changedFile
    .map((file) => {
      return `
************************************************************
文件路径: ${file.path}
变动类型: ${file.type}
变动详情:
${file.diff}
************************************************************
    `;
    })
    .join('\r\n');
  return requirement + changedText;
};
