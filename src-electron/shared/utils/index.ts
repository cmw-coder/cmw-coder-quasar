// 前后端通用的操作方法
export const deepClone = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};
