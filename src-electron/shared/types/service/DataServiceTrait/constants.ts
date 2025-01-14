import {
  AppData,
  ModelConfig,
} from 'shared/types/service/DataServiceTrait/types';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export const DEFAULT_APP_DATA: AppData = {
  backup: {},
  compatibility: {
    transparentFallback: false,
    zoomFix: false,
  },
  notice: {
    dismissed: [],
  },
  project: {},
  window: {
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
      x: 300,
      y: 50,
      height: 1000,
      width: 620,
      show: true,
    },
    [WindowType.Quake]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.Welcome]: {
      height: 600,
      width: 800,
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
    [WindowType.SelectionTips]: {
      height: 34,
      width: 455,
      show: false,
    },
    [WindowType.Status]: {
      height: 32,
      width: 200,
      show: false,
      x: 200,
      y: 0,
    },
  },
};

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  template: {
    CodeAddComment:
      '请为以下 %{language}% 代码添加注释，请用中文回答，代码段用 markdown 格式返回\n%{code}%',
    CodeOptimization:
      '请优化以下 %{language}% 代码，请用中文回答，代码段用 markdown 格式返回\n%{code}%',
    CodeExplanation:
      '请分析以下 %{language}% 代码的功能，请用中文回答,代码如下\n%{code}%',
    GenerateUnitTest:
      '请为以下 %{language}% 代码生成单元测试用例，请用中文回答，代码段用 markdown 格式返回\n%{code}%',
    ExceptionAnalysis: '分析异常',
    CodeReview:
      '请评审以下 %{language}% 代码，请用中文回答，代码如下\n%{code}%',
    CodeGenerate:
      '你是一个%{language}%开发工程师，请进行代码续写。请只返回生成的代码，不要做多余的文字描述，请用中文回答。需要续写的代码如下：\n%{code}%',
    SecurityIssues:
      '请分析以下%{language}%代码可能出现的安全性问题并重写代码，请用中文回答，重写的代码请用 markdown 格式返回。代码如下：\n%{code}%',
    StyleIssues:
      '请分析以下%{language}%代码存在的代码风格问题并重写代码，请用中文回答，重写的代码请用 markdown 格式返回。代码如下：\n%{code}%',
    Readable:
      '请提高以下%{language}%代码的可读性并重写代码，请用中文回答， 重写的代码请用 markdown 格式返回。代码如下：\n%{code}%',
    FileAddComment:
      '请为以下 %{language}% 代码逐行添加中文注释。不要更改原代码，只返回添加注释后的原代码，不要做多余的文字描述。代码如下：\n%{code}%',
    ShortLineCode: '%{code}%',
    GenerateCommitMessage:
      '我想让你充当一个提交信息生成器。我将为你提供此次变更的详情内容，我希望你能用常规的提交格式生成一条合适的提交信息，提交信息尽量不要超过100字符。不要写任何解释或其他文字，只需回复提交信息。如下是变更详情：\n%{diffText}%',
    PasteFix:
      '%{RagCode}%\n%{NeighborSnippet}%\n' +
      '<fim_prefix>基于参考待补全代码片段（可以选择修正或保留该段代码）完成函数的补全\n' +
      '参考待补全代码:\n' +
      '%{PasteContent}%\n' +
      '\n' +
      '%{CurrentFilePrefix}%<fim_suffix>%{SuffixCode}%<fim_middle>',
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
            '<｜fim▁begin｜>Language:%{Language}%\n\n%{ImportList}%\n%{RelativeDefinition}%\n%{NearCode}%<｜fim▁hole｜>%{SuffixCode}%<｜fim▁end｜>',
          commonMulti:
            '你是一个 %{Language}% 开发工程师，请进行代码续写。请只返回生成的代码，不要做多余的文字描述。需要续写的代码如下：\n%{NearCode}%',
          commonInline:
            '<｜fim▁begin｜>Language:%{Language}%\n\n%{ImportList}%\n%{RelativeDefinition}%\n%{NearCode}%<｜fim▁hole｜>%{SuffixCode}%<｜fim▁end｜>',
          embedding:
            '你是一个 %{Language}% 开发工程师, 请根据以下规则步骤生成代码:\n  1. 根据如下示例代码仿写出符合要求的代码\n  2. 请只返回仿写的代码，不要做多余的文字描述\n====示例代码开始====\n%{Corpus}%\n====示例代码结束====\r\n我的要求如下：\n%{Comment}%',
        },
        code: {
          common:
            '<｜fim▁begin｜>Language:%{Language}%\n\n%{ImportList}%\n%{RelativeDefinition}%\n%{NearCode}%<｜fim▁hole｜>%{SuffixCode}%<｜fim▁end｜>',
          commonMulti:
            '你是一个 %{Language}% 开发工程师，请进行代码续写。请只返回生成的代码，不要做多余的文字描述。需要续写的代码如下：\n%{NearCode}%',
          commonInline:
            '<｜fim▁begin｜>Language:%{Language}%\n\n%{ImportList}%\n%{RelativeDefinition}%\n%{NearCode}%<｜fim▁hole｜>%{SuffixCode}%<｜fim▁end｜>',
          embedding:
            '你是一个 %{Language}% 开发工程师, 请根据以下规则步骤生成代码:\n  1. 根据如下示例代码仿写出符合要求的代码\n  2. 请只返回仿写的代码，不要做多余的文字描述\n====示例代码开始====\n%{Corpus}%\n====示例代码结束====\r\n我的要求如下：\n%{Comment}%',
        },
      },
    },
  },
};
