<!--
 * @Author: 秦少卫
 * @Date: 2023-04-18 08:06:56
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-04-24 12:07:49
 * @Description: 拖拽模式
-->

<template>
  <div class="box">
    <a-space>
      <div
        style="
          width: max-content;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fff;
          border-radius: 4px;
          padding: 4px 8px;
          user-select: none;
        "
      >
        <a-space>
          <div style="cursor: pointer">
            <a-tooltip :content="'撤销(' + canUndo + ')'">
              <Icon type="ios-undo" size="20" @click="undo" />
            </a-tooltip>
          </div>
          <div style="cursor: pointer">
            <a-tooltip :content="'重做(' + canRedo + ')'">
              <Icon type="ios-redo" size="20" @click="redo" />
            </a-tooltip>
          </div>
        </a-space>
      </div>
      <div
        style="
          width: max-content;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fff;
          border-radius: 4px;
          padding: 3px 6px;
          user-select: none;
        "
      >
        <a-space>
          <div style="font-size: 12px">拖拽模式</div>
          <div>
            <a-switch v-model="status" @change="switchMode"></a-switch>
          </div>
        </a-space>
      </div>
    </a-space>
  </div>
</template>

<script setup name="Drag">
import useSelect from '@/hooks/select';
import { Icon } from 'view-ui-plus';
const status = ref(false);
const { canvasEditor } = useSelect();

const switchMode = (val) => {
  if (val) {
    canvasEditor.startDring();
  } else {
    canvasEditor.endDring();
  }
};

const canUndo = ref(0);
const canRedo = ref(0);
// 后退
const undo = () => {
  canvasEditor.undo();
};
// 重做
const redo = () => {
  canvasEditor.redo();
};

onMounted(() => {
  canvasEditor.on('startDring', () => (status.value = true));
  canvasEditor.on('endDring', () => (status.value = false));
  canvasEditor.on('historyUpdate', (canUndoParam, canRedoParam) => {
    canUndo.value = canUndoParam;
    canRedo.value = canRedoParam;
  });
});

onBeforeUnmount(() => {
  canvasEditor.off('startDring');
  canvasEditor.off('endDring');
  canvasEditor.off('historyUpdate');
});
</script>
<style scoped lang="less">
.box {
  position: absolute;
  right: 14px;
  bottom: 14px;
}
</style>
