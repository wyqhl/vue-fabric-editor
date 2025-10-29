import { request } from '../http/httpClient';
import {
  ImageEditorMaterialType,
  ImageEditorIndexData,
  ImageEditorMaterialPO,
  FontVO,
} from '../model/imageEditor.model';
import { ReturnData } from '../model/ReturnData.model';

/**
 * 查询素材列表
 */
export function getFontList(): Promise<ReturnData<Array<FontVO>>> {
  return new Promise((resolve, reject) => {
    request<Array<FontVO>>('/image/editor/font/list', {})
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * 查询素材列表
 */
export function getMaterial(
  param: ImageEditorMaterialPO
): Promise<ReturnData<ImageEditorMaterialPO>> {
  return new Promise((resolve, reject) => {
    request<ImageEditorMaterialPO>('/image/editor/material/get', param)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * 查询素材列表
 */
export function queryMaterialIndexData(
  type: ImageEditorMaterialType
): Promise<ReturnData<Array<ImageEditorIndexData>>> {
  return new Promise((resolve, reject) => {
    request<Array<ImageEditorIndexData>>('/image/editor/material/index', {
      type: type,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
