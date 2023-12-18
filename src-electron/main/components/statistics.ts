import axios from 'axios';

import { HuggingFaceModelType, LinseerModelType } from 'main/types/model';
import { Range } from 'main/types/vscode/range';

import { databaseManager } from 'components/DatabaseManager';

let currentCursor: Range = new Range(0, 0, 0, 0);
let lastCursor: Range = new Range(0, 0, 0, 0);

const secondClassMap = new Map<HuggingFaceModelType | LinseerModelType, string>(
  [
    [HuggingFaceModelType.ComwareV1, 'CMW'],
    [HuggingFaceModelType.ComwareV2, 'CODELLAMA'],
    [LinseerModelType.Linseer, 'LS13B'],
    [LinseerModelType.Linseer_SR88Driver, 'LS13B'],
    [LinseerModelType.Linseer_CClsw, 'LS13B'],
  ]
);
const productLineMap = new Map<LinseerModelType, string>([
  [LinseerModelType.Linseer, 'H3C 通用'],
  [LinseerModelType.Linseer_CClsw, '交换机产品线'],
  [LinseerModelType.Linseer_SR88Driver, ''], //高端路由模型还未推出，产品线字段暂时返回空，后续更新删除该注释
]);

const constructData = (
  completion: string,
  startTime: number,
  endTime: number,
  projectId: string,
  version: string,
  username: string,
  modelType: HuggingFaceModelType | LinseerModelType,
  isAccept: boolean
) => {
  const isSnippet = completion[0] === '1';
  const lines = isSnippet ? completion.substring(1).split('\\r\\n').length : 1;
  const basicData = {
    begin: Math.floor(startTime / 1000),
    end: Math.floor(endTime / 1000),
    extra: version,
    product: 'SI',
    secondClass: secondClassMap.get(modelType),
    subType: projectId,
    type: 'AIGC',
    user: username,
    userType: 'USER',
    productLine:
      modelType in LinseerModelType
        ? productLineMap.get(modelType as LinseerModelType)
        : '',
  };

  return [
    {
      ...basicData,
      count: lines,
      firstClass: 'CODE',
      skuName: isSnippet
        ? isAccept
          ? 'KEEP_MULTI'
          : 'GENE_MULTI'
        : isAccept
        ? 'KEEP'
        : 'GENE',
    },
  ];
};

export const acceptCompletion = async (
  completion: string,
  startTime: number,
  endTime: number,
  projectId: string,
  version: string,
  username: string
) => {
  if (currentCursor.end.line == lastCursor.end.line) {
    return;
  }
  try {
    await axios
      .create({
        baseURL: fastify.config.statistics,
      })
      .post(
        '/report/summary',
        constructData(
          completion,
          startTime,
          endTime,
          projectId,
          version,
          username,
          databaseManager.getModelType() ??
          fastify.config.modelConfigs[0].modelType,
          true
        )
      );
  } catch (e) {
    console.error('fastify.statistics.accept', e);
  }
};

export default fastifyPlugin(async (fastify) => {
  fastify.statistics = {} as any;
  fastify.statistics.accept =
  fastify.statistics.generate = async (
    completion: string,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string,
    username: string
  ) => {
    if (currentCursor.end.line == lastCursor.end.line) {
      return;
    }
    try {
      await axios
        .create({
          baseURL: fastify.config.statistics,
        })
        .post(
          '/report/summary',
          constructData(
            completion,
            startTime,
            endTime,
            projectId,
            version,
            username,
            databaseManager.getModelType() ??
              fastify.config.modelConfigs[0].modelType,
            false
          )
        );
    } catch (e) {
      console.error('fastify.statistics.generate', e);
    }
  };

  fastify.statistics.updateCursor = (cursor: Range) => {
    lastCursor = currentCursor;
    currentCursor = cursor;
  };
});

declare module 'fastify' {
  // noinspection JSUnusedGlobalSymbols
  interface FastifyInstance {
    statistics: {
      accept: (
        completion: string,
        startTime: number,
        endTime: number,
        projectId: string,
        version: string,
        username: string
      ) => void;
      generate: (
        completion: string,
        startTime: number,
        endTime: number,
        projectId: string,
        version: string,
        username: string
      ) => Promise<void>;
      updateCursor: (cursor: Range) => void;
    };
  }
}
