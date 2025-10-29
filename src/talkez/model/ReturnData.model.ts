/**
 * 接口返回值对象
 */
export interface ReturnData<T> {
  //编码
  code: number;
  //数据
  data?: T | null;
  //提示信息
  msg: string;
  //是否成功
  success: boolean;
}

/**
 * 分页参数
 */
export class PagerParam {
  //当前页
  current: number;
  //每页数量
  limit: number;
  //总条数
  total: number;
  //搜索内容
  search?: string;
  //可选页码
  pageSizeOptions?: number[];

  constructor() {
    this.current = 1;
    this.limit = 10;
    this.total = 0;
    this.pageSizeOptions = [10, 20, 30, 40, 50];
  }
}

/**
 * 分页返回值
 */
export class PagerResult<T> {
  //页码
  pageNum: number;
  //每页条数
  pageSize: number;
  //总页数
  pages: number;
  //总条数
  total: number;
  //返回数据
  list: Array<T>;
  //是否已没有数据了
  isLastPage?: boolean;

  constructor() {
    this.pageNum = 1;
    this.pageSize = 10;
    this.pages = 1;
    this.total = 0;
    this.list = new Array<T>();
    this.isLastPage = false;
  }
}
