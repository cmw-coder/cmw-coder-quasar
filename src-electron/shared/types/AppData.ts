import { WindowType } from 'shared/types/WindowType';
import { QuestionTemplateModelContent } from './QuestionTemplate';

export interface DataCompatibilityType {
  transparentFallback: boolean;
  zoomFix: boolean;
}

export interface DataProjectType {
  id: string;
  lastAddedLines: number;
  svn: {
    directory: string;
    revision: number;
  }[];
}

export interface WindowData {
  x?: number;
  y?: number;
  height?: number;
  width?: number;
  show: boolean;
}

export type DataWindowType = Record<WindowType, WindowData>;

export interface AppData {
  compatibility: DataCompatibilityType;
  project: Record<string, DataProjectType>;
  window: DataWindowType;
}

export const defaultAppData: AppData = {
  compatibility: {
    transparentFallback: false,
    zoomFix: false,
  },
  project: {},
  window: {
    [WindowType.Chat]: {
      height: 1300,
      width: 780,
      show: false,
    },
    [WindowType.Commit]: {
      height: 1300,
      width: 780,
      show: false,
    },
    [WindowType.Completions]: {
      height: 0,
      width: 0,
      show: false,
    },
    [WindowType.Login]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.Main]: {
      height: 1300,
      width: 780,
      show: false,
    },
    [WindowType.Quake]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.Setting]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.StartSetting]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.WorkFlow]: {
      height: 1300,
      width: 780,
      show: false,
    },
    [WindowType.ProjectId]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.Feedback]: {
      height: 800,
      width: 800,
      show: false,
    },
    [WindowType.Update]: {
      height: 800,
      width: 800,
      show: false,
    },
  },
};

export const defaultQuestionTemplateModelContent: QuestionTemplateModelContent =
  {
    template: {
      CodeAddComment:
        '请为以下 %{language}% 代码添加注释，请用中文回答，代码段用 markdown 格式返回\r\n%{code}%',
      CodeOptimization:
        '请优化以下 %{language}% 代码，请用中文回答，代码段用 markdown 格式返回\r\n%{code}%',
      CodeExplanation:
        '请分析以下 %{language}% 代码的功能，请用中文回答,代码如下\r\n%{code}%',
      GenerateUnitTest:
        '请为以下 %{language}% 代码生成单元测试用例，请用中文回答，代码段用 markdown 格式返回\r\n%{code}%',
      ExceptionAnalysis: '分析异常',
      CodeReview:
        '请评审以下 %{language}% 代码，请用中文回答，代码如下\r\n%{code}%',
      CodeGenerate:
        '你是一个%{language}%开发工程师，请进行代码续写。请只返回生成的代码，不要做多余的文字描述，请用中文回答。需要续写的代码如下：\n%{code}%',
      SecurityIssues:
        '请分析以下%{language}%代码可能出现的安全性问题并重写代码，请用中文回答，重写的代码请用 markdown 格式返回。代码如下：\r\n%{code}%',
      StyleIssues:
        '请分析以下%{language}%代码存在的代码风格问题并重写代码，请用中文回答，重写的代码请用 markdown 格式返回。代码如下：\r\n%{code}%',
      Readable:
        '请提高以下%{language}%代码的可读性并重写代码，请用中文回答， 重写的代码请用 markdown 格式返回。代码如下：\n%{code}%',
      FileAddComment:
        '请为以下 %{language}% 代码逐行添加中文注释。不要更改原代码，只返回添加注释后的原代码，不要做多余的文字描述。代码如下：\r\n%{code}%',
      ShortLineCode: '%{code}%',
      GenerateCommitMessage:
        '我想让你充当一个提交信息生成器。我将为你提供此次变更的详情内容，我希望你能用常规的提交格式生成一条合适的提交信息，提交信息尽量不要超过100字符。不要写任何解释或其他文字，只需回复提交信息。如下是变更详情：\r\n%{diffText}%',
    },
    config: {
      modelKey: 'LS13B',
      displayName: '百业灵犀',
    },
    prompt: {
      c: {
        other: {
          comment: {
            common:
              '<｜fim▁begin｜>Language:%{Language}%\r\n\r\n%{ImportList}%\r\n%{RelativeDefinition}%\r\n%{NearCode}%<｜fim▁hole｜>%{SuffixCode}%<｜fim▁end｜>',
            commonMulti:
              '你是一个 %{Language}% 开发工程师，请进行代码续写。请只返回生成的代码，不要做多余的文字描述。需要续写的代码如下：\r\n%{NearCode}%',
            commonInline:
              '<｜fim▁begin｜>Language:%{Language}%\r\n\r\n%{ImportList}%\r\n%{RelativeDefinition}%\r\n%{NearCode}%<｜fim▁hole｜>%{SuffixCode}%<｜fim▁end｜>',
            embedding:
              '你是一个 %{Language}% 开发工程师, 请根据以下规则步骤生成代码:\r\n  1. 根据如下示例代码仿写出符合要求的代码\r\n  2. 请只返回仿写的代码，不要做多余的文字描述\r\n====示例代码开始====\r\n%{Corpus}%\r\n====示例代码结束====\r\n我的要求如下：\r\n%{Comment}%',
          },
          code: {
            common:
              '<｜fim▁begin｜>Language:%{Language}%\r\n\r\n%{ImportList}%\r\n%{RelativeDefinition}%\r\n%{NearCode}%<｜fim▁hole｜>%{SuffixCode}%<｜fim▁end｜>',
            commonMulti:
              '你是一个 %{Language}% 开发工程师，请进行代码续写。请只返回生成的代码，不要做多余的文字描述。需要续写的代码如下：\r\n%{NearCode}%',
            commonInline:
              '<｜fim▁begin｜>Language:%{Language}%\r\n\r\n%{ImportList}%\r\n%{RelativeDefinition}%\r\n%{NearCode}%<｜fim▁hole｜>%{SuffixCode}%<｜fim▁end｜>',
            embedding:
              '你是一个 %{Language}% 开发工程师, 请根据以下规则步骤生成代码:\r\n  1. 根据如下示例代码仿写出符合要求的代码\r\n  2. 请只返回仿写的代码，不要做多余的文字描述\r\n====示例代码开始====\r\n%{Corpus}%\r\n====示例代码结束====\r\n我的要求如下：\r\n%{Comment}%',
          },
        },
      },
    },
  };
