import { SvnStatusItem } from 'shared/types/svn';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatStatusRes = (data: any) => {
  const res = [] as SvnStatusItem[];
  const entries = data?.status?.target?.entry;
  if (!entries) {
    return res;
  }
  if (Object.prototype.toString.call(entries) === '[object Object]') {
    res.push({
      path: entries?._attribute?.path,
      type: entries['wc-status']?._attribute?.item,
    });
  } else if (Object.prototype.toString.call(entries) === '[object Array]') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries.forEach((entry: any) => {
      res.push({
        path: entry?._attribute?.path,
        type: entry['wc-status']?._attribute?.item,
      });
    });
  }
  return res;
};
