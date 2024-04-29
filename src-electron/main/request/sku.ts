import dayjs from 'dayjs';
import { userInfo } from 'os';
import request from 'main/request';

export interface ReportSkuDto {
  begin?: number;
  end?: number;
  count: number;
  type: string;
  product: string;
  firstClass: string;
  secondClass: string;
  skuName: string;
  user: string;
  userType: 'USER' | 'HOST';
  extra?: string;
  subType?: string;
  hostName?: string;
}

export const api_reportSKU = async (data: ReportSkuDto[]) => {
  try {
    const handledData = data.map((item) => ({
      ...item,
      begin: item.begin ? item.begin : Math.trunc(dayjs().valueOf() / 1000),
      end: item.end ? item.end : Math.trunc(dayjs().valueOf() / 1000),
      hostName: userInfo().username,
      extra: '',
    }));
    await request({
      url: '/kong/RdTestResourceStatistic/report/summary',
      method: 'post',
      data: handledData,
    });
  } catch (e) {
    console.log('sku 上报失败', data, e);
  }
};
