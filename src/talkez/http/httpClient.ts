import HttpClient, { ContentType, Method, RequestParams } from 'axios-mapper';
import { ReturnData } from '../model/ReturnData.model';
import { Message, MessageReturn, Notification } from '@arco-design/web-vue';

const config = {
  baseURL:
    import.meta.env.MODE === 'production'
      ? 'https://capi.talkez.net/c-api/'
      : 'http://127.0.0.1:8202/c-api/',
  headers: {},
  timeout: 30 * 1000,
  log: false,
  checkQuickClick: true,
  clickInterval: 1000,
};
const https = new HttpClient(config);
export default https;

// 正在请求的数量，用来控制加载框
let requestCount = 0;
// 加载框对象
let loading: MessageReturn;

/**
 * 发送请求
 * @param path              接口地址
 * @param params            参数
 * @param checkQuickClick   是否控制请求频率
 * @param method            请求类型
 * @param contentType       结果类型
 * @returns                 请求结果
 */
export function request<T>(
  path: string,
  params?: RequestParams,
  checkQuickClick = false,
  method: Method = Method.POST,
  contentType?: ContentType
): Promise<ReturnData<T>> {
  if (requestCount === 0) {
    loading = Message.loading({
      content: '正在加载..',
      duration: 999999999,
      showIcon: true,
      position: 'top',
    });
  }
  requestCount++;
  if (!contentType) {
    contentType = ContentType.json;
  }
  const requestConfig = config;
  requestConfig.checkQuickClick = checkQuickClick;
  return new Promise((resolve, reject) => {
    https
      .request<ReturnData<T>>(path, method, params, contentType, requestConfig)
      .then((res) => {
        canCloseLoadingMessage();
        if (!res) {
          Notification.error('请稍后重试');
          reject();
        } else if (!res.success) {
          Message.warning(res.msg);
          reject();
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        if (err.message.indexOf('code 404') > -1) {
          Message.error('该资源不存在');
        }
        if (err.message === 'Network Error') {
          Message.error('网络连接异常');
        }
        canCloseLoadingMessage();
        resolve(err);
      });
  });
}

/**
 * 关闭顶部居中加载提示框
 */
function canCloseLoadingMessage(): void {
  setTimeout(() => {
    requestCount--;
    if (requestCount <= 0) {
      loading.close();
    }
  }, 300);
}
