<!--
 * @Author: 秦少卫
 * @Date: 2023-04-18 08:06:56
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-04-24 12:07:49
 * @Description: 拖拽模式
-->

<template>
  <div class="box">
    <div
      style="
        width: max-content;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #fff;
        border-radius: 4px;
        padding: 4px 8px;
      "
    >
      <a-space>
        <div style="font-size: 12px">拖拽模式</div>
        <div>
          <a-switch v-model="status" @change="switchMode">
            <template #checked>开启</template>
            <template #unchecked>关闭</template>
          </a-switch>
        </div>
      </a-space>
    </div>
    <!--    <Switch size="large" v-model="status" @on-change="switchMode">-->
    <!--      <template #open>-->
    <!--        <span>Drag</span>-->
    <!--      </template>-->
    <!--    </Switch>-->
  </div>
</template>

<script setup name="Drag">
import useSelect from '@/hooks/select';
const status = ref(false);
const { canvasEditor } = useSelect();

const switchMode = (val) => {
  if (val) {
    canvasEditor.startDring();
  } else {
    canvasEditor.endDring();
  }
};

onMounted(() => {
  canvasEditor.on('startDring', () => (status.value = true));
  canvasEditor.on('endDring', () => (status.value = false));
});

onBeforeUnmount(() => {
  canvasEditor.off('startDring');
  canvasEditor.off('endDring');
});
</script>
<style scoped lang="less">
.box {
  position: absolute;
  right: 14px;
  bottom: 14px;
}
</style>
