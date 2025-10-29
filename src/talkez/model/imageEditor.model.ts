import { PagerParam } from './ReturnData.model';

/**
 * 素材分页查询参数
 */
export class QueryImageEditorParam extends PagerParam {
  typeId: string;
  constructor() {
    super();
    this.typeId = '';
  }
}

/**
 * 素材首页数据(所有分类及分类中的前8条数据)
 */
export class ImageEditorIndexData {
  id: string;
  name: string;
  children: Array<ImageEditorMaterialPO>;

  constructor() {
    this.id = '';
    this.name = '';
    this.children = [];
  }
}

export type ImageEditorMaterialType = 'MATERIAL' | 'TEXT' | 'TEMPLATE';

/**
 * 图片编辑器素材分类PO
 */
export class ImageEditorTypePO {
  id: string;
  name: string;
  type: ImageEditorMaterialType;
  pos: number;

  constructor() {
    this.id = '';
    this.name = '';
    this.type = 'MATERIAL';
    this.pos = 0;
  }
}

/**
 * 图片编辑器数据PO
 */
export class ImageEditorMaterialPO {
  id: number;
  name: string;
  image: string;
  subTypeId: string;
  subTypeName: string;
  type: ImageEditorMaterialType;
  pos: number;
  createDate?: string;
  json?: string;

  constructor() {
    this.id = 0;
    this.name = '';
    this.image = '';
    this.subTypeId = '';
    this.subTypeName = '';
    this.type = 'MATERIAL';
    this.pos = 0;
  }
}

/**
 * 字体VO
 */
export class FontVO {
  id: number;
  name: string;
  fontName: string;
  svgName: string;

  constructor() {
    this.id = 0;
    this.name = '';
    this.fontName = '';
    this.svgName = '';
  }
}
