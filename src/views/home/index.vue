<!--
 * @Author: 秦少卫
 * @Date: 2024-05-17 15:30:21
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-11-18 10:30:30
 * @Description: file content
-->
<template>
  <div class="home">
    <Layout>
      <!-- 头部区域 -->
      <!--      <Top v-if="state.show" :ruler="state.ruler" @update:ruler="rulerSwitch"></Top>-->
      <Content style="display: flex; height: calc(100vh - 64px); position: relative">
        <!-- 左侧区域 -->
        <Left v-if="state.show"></Left>
        <!-- 画布区域 -->
        <div id="workspace">
          <div class="canvas-box">
            <div class="inside-shadow"></div>
            <canvas id="canvas" :class="state.ruler ? 'design-stage-grid' : ''"></canvas>
            <dragMode v-if="state.show"></dragMode>
            <!--            <zoom></zoom>-->
          </div>
        </div>
        <Right v-if="state.show"></Right>
      </Content>
    </Layout>
  </div>
</template>

<script name="Home" setup lang="ts">
import Top from './components/top/index.vue';
import Left from './components/left/index.vue';
import Right from './components/right/index.vue';

import zoom from '@/components/zoom.vue';
import dragMode from '@/components/dragMode.vue';
// 功能组件
import { fabric } from 'fabric';

import Editor, {
  IEditor,
  DringPlugin,
  AlignGuidLinePlugin,
  ControlsPlugin,
  // ControlsRotatePlugin,
  CenterAlignPlugin,
  LayerPlugin,
  CopyPlugin,
  MoveHotKeyPlugin,
  DeleteHotKeyPlugin,
  GroupPlugin,
  DrawLinePlugin,
  GroupTextEditorPlugin,
  GroupAlignPlugin,
  WorkspacePlugin,
  HistoryPlugin,
  FlipPlugin,
  RulerPlugin,
  MaterialPlugin,
  WaterMarkPlugin,
  FontPlugin,
  PolygonModifyPlugin,
  DrawPolygonPlugin,
  FreeDrawPlugin,
  PathTextPlugin,
  PsdPlugin,
  SimpleClipImagePlugin,
  BarCodePlugin,
  QrCodePlugin,
  ImageStroke,
  ResizePlugin,
  LockPlugin,
  AddBaseTypePlugin,
  MaskPlugin,
} from '@kuaitu/core';

const APIHOST = import.meta.env.APP_APIHOST;

// 创建编辑器
const canvasEditor = new Editor() as IEditor;

const state = reactive({
  show: false,
  select: null,
  ruler: true,
});

import { v4 as uuid } from 'uuid';
import { Message } from '@arco-design/web-vue';

/**
 * 接收消息
 * @param e
 */
function receiveMessage(e: MessageEvent) {
  if (e && e.data) {
    if (e.data.type === 'getData') {
      //获取模板数据（整个画布）
      (async () => {
        const dataUrl = await canvasEditor.preview();
        const json = canvasEditor.getJson();
        window.parent.postMessage(
          { event: 'saveData', data: { json: json, dataUrl: dataUrl } },
          '*'
        );
      })();
    }
    if (e.data.type === 'getTextData') {
      //获取文字数据
      (async () => {
        const data = await canvasEditor.getFontData();
        if (data) {
          //需判断json类型是textbox或者group，否则保存后打开有异常
          if (data.json.type !== 'textbox' && data.json.type !== 'group') {
            Message.warning('只允许选中文本元素或组合，如有多个元素需要保存请将其组合');
            return;
          }
          window.parent.postMessage({ event: 'saveTextData', data: data }, '*');
        }
      })();
    } else if (e.data.type === 'setTextJson') {
      (async () => {
        const jsonStr = e.data.data.json;
        if (jsonStr) {
          await canvasEditor.downFontByJSON(jsonStr);
          const el = JSON.parse(jsonStr);
          el.id = uuid();
          const elType = capitalizeFirstLetter(el.type);
          new fabric[elType].fromObject(el, (fabricEl) => {
            canvasEditor.addBaseType(fabricEl);
            discardActiveObject();
            window.parent.postMessage({ event: 'setJsonComplete' }, '*');
          });
        }
      })();
    } else if (e.data.type === 'setJson') {
      const json = e.data.data.json;
      if (json) {
        canvasEditor.loadJSON(JSON.stringify(JSON.parse(json)), () => {
          discardActiveObject();
          window.parent.postMessage({ event: 'setJsonComplete' }, '*');
        });
      }
    }
  }
}

function discardActiveObject() {
  if (canvasEditor && canvasEditor.canvas) {
    canvasEditor?.canvas?.discardActiveObject();
    canvasEditor?.canvas?.renderAll();
  }
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

onMounted(() => {
  // 初始化fabric
  const canvas = new fabric.Canvas('canvas', {
    fireRightClick: true, // 启用右键，button的数字为3
    stopContextMenu: true, // 禁止默认右键菜单
    controlsAboveOverlay: true, // 超出clipPath后仍然展示控制条
    // imageSmoothingEnabled: false, // 解决文字导出后不清晰问题
    preserveObjectStacking: true, // 当选择画布中的对象时，让对象不在顶层。
  });

  // 初始化编辑器
  canvasEditor.init(canvas);
  canvasEditor
    .use(DringPlugin)
    .use(PolygonModifyPlugin)
    .use(AlignGuidLinePlugin)
    .use(ControlsPlugin)
    // .use(ControlsRotatePlugin)
    .use(CenterAlignPlugin)
    .use(LayerPlugin)
    .use(CopyPlugin)
    .use(MoveHotKeyPlugin)
    .use(DeleteHotKeyPlugin)
    .use(GroupPlugin)
    .use(DrawLinePlugin)
    .use(GroupTextEditorPlugin)
    .use(GroupAlignPlugin)
    .use(WorkspacePlugin)
    .use(HistoryPlugin)
    .use(FlipPlugin)
    .use(RulerPlugin)
    .use(DrawPolygonPlugin)
    .use(FreeDrawPlugin)
    .use(PathTextPlugin)
    .use(SimpleClipImagePlugin)
    .use(BarCodePlugin)
    .use(QrCodePlugin)
    .use(FontPlugin, {
      repoSrc: APIHOST,
    })
    .use(MaterialPlugin, {
      repoSrc: APIHOST,
    })
    .use(WaterMarkPlugin)
    .use(PsdPlugin)
    .use(ImageStroke)
    .use(ResizePlugin)
    .use(LockPlugin)
    .use(AddBaseTypePlugin)
    .use(MaskPlugin);

  state.show = true;
  // 默认打开标尺
  if (state.ruler) {
    canvasEditor.rulerEnable();
  }

  //添加监听
  window.addEventListener('message', receiveMessage, false);
  window.parent.postMessage({ event: 'onLoadingComplete' }, '*');
});

onUnmounted(() => {
  canvasEditor.destory();
  //移除监听
  window.removeEventListener('message', receiveMessage);
});
const rulerSwitch = (val) => {
  if (val) {
    canvasEditor.rulerEnable();
  } else {
    canvasEditor.rulerDisable();
  }
  // 使标尺开关组件失焦，避免响应键盘的空格事件
  document.activeElement.blur();
};

provide('fabric', fabric);
provide('canvasEditor', canvasEditor);
// provide('mixinState', mixinState);
</script>

<style lang="less" scoped>
:deep(.ivu-layout-header) {
  --height: 45px;
  padding: 0 0px;
  border-bottom: 1px solid #eef2f8;
  background: #fff;
  height: var(--height);
  line-height: var(--height);
  display: flex;
  justify-content: space-between;
}

.home,
.ivu-layout {
  height: 100vh;
}

.icon {
  display: block;
}

.canvas-box {
  position: relative;
}

// 画布内阴影
.inside-shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 9px 2px #0000001f;
  z-index: 2;
  pointer-events: none;
}

#canvas {
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

#workspace {
  flex: 1;
  width: 100%;
  position: relative;
  background: #f1f1f1;
  overflow: hidden;
}

// 标尺
.switch {
  margin-right: 10px;
}

// 网格背景
.design-stage-grid {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 16px;
  --color: #dedcdc;
  background-image: linear-gradient(
      45deg,
      var(--color) 25%,
      transparent 0,
      transparent 75%,
      var(--color) 0
    ),
    linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0);
  background-position: var(--offsetX) var(--offsetY),
    calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}
</style>
