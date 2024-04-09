import { ChangedFile } from 'app/src-electron/shared/types/SvnType';

export const generateCommitPrompt = (changedFile: ChangedFile[]) => {
  const requirement = `
  请为如下的代码变动生成提交信息, 分点编写提交信息, 给出简略的变动代码逻辑, 用中文生成:

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
