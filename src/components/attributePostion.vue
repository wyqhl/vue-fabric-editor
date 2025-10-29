<!--
 * @Author: 秦少卫
 * @Date: 2024-05-21 09:23:36
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-10-07 17:33:41
 * @Description: file content
-->
<template>
  <div class="box attr-item-box" v-if="isOne">
    <!-- <h3>位置信息</h3> -->
    <Divider plain orientation="left"><h4>位置信息</h4></Divider>
    <!-- 通用属性 -->
    <div v-show="isMatchType">
      <Row :gutter="10">
        <Col flex="1">
          <InputNumber
            v-model="baseAttr.left"
            @on-change="(value) => changeCommon('left', value)"
            :append="$t('attributes.left')"
          ></InputNumber>
        </Col>
        <Col flex="1">
          <InputNumber
            v-model="baseAttr.top"
            @on-change="(value) => changeCommon('top', value)"
            :append="$t('attributes.top')"
          ></InputNumber>
        </Col>
      </Row>
      <Form :label-width="40" class="form-wrap">
        <FormItem :label="$t('attributes.angle')">
          <Slider
            v-model="baseAttr.angle"
            :max="360"
            @on-input="(value) => changeCommon('angle', value)"
          ></Slider>
        </FormItem>
        <FormItem :label="$t('attributes.opacity')">
          <Slider
            v-model="baseAttr.opacity"
            @on-input="(value) => changeCommon('opacity', value)"
          ></Slider>
        </FormItem>
      </Form>
    </div>

    <div v-if="isCanSetSizeTypeMatchType && baseAttr.id !== 'workspace'">
      <!-- <h3>位置信息</h3> -->
      <Divider plain orientation="left"><h4>宽高</h4></Divider>
      <!-- 通用属性 -->
      <div v-show="isMatchType">
        <Row :gutter="10">
          <Col flex="1">
            <InputNumber
              :precision="0"
              v-model="baseAttr.tWidth"
              @on-change="(value) => changeCommonWH('width', value)"
              :append="'宽度'"
            ></InputNumber>
          </Col>
          <Col flex="1">
            <InputNumber
              :precision="0"
              v-model="baseAttr.tHeight"
              @on-change="(value) => changeCommonWH('height', value)"
              :append="'高度'"
            ></InputNumber>
          </Col>
        </Row>
      </div>
    </div>

    <!-- <Divider plain></Divider> -->
  </div>
</template>

<script setup name="AttrBute">
import useSelect from '@/hooks/select';
import InputNumber from '@/components/inputNumber';

const update = getCurrentInstance();

// 可修改的元素
const baseType = [
  'text',
  'i-text',
  'textbox',
  'rect',
  'circle',
  'triangle',
  'polygon',
  'image',
  'group',
  'line',
  'arrow',
  'thinTailArrow',
];
const { isMatchType, canvasEditor, isOne } = useSelect(baseType);

const canSetSizeType = ['rect', 'image'];
const { isMatchType: isCanSetSizeTypeMatchType, state } = useSelect(canSetSizeType);

// 属性值
const baseAttr = reactive({
  opacity: 0,
  angle: 0,
  left: 0,
  top: 0,
  rx: 0,
  ry: 0,
  width: 0,
  height: 0,
  scaleX: 0,
  scaleY: 0,
  tWidth: 0,
  tHeight: 0,
  id: '',
});

// 通用属性改变
const changeCommonWH = (key, value) => {
  const activeObject = canvasEditor.canvas.getActiveObjects()[0];
  if (activeObject) {
    // 宽高设置
    if (key === 'width' || key === 'height') {
      if (activeObject) {
        if (key === 'width') {
          const v = value / activeObject.width;
          activeObject.set('scaleX', v);
        }
        if (key === 'height') {
          const v = value / activeObject.height;
          activeObject.set('scaleY', v);
        }
      }
      canvasEditor.canvas.renderAll();
      return;
    }
    activeObject && activeObject.set(key, value);
    canvasEditor.canvas.renderAll();
  }
};

// 属性获取
const getObjectAttr = (e) => {
  const activeObject = canvasEditor.canvas.getActiveObject();
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject && isMatchType) {
    baseAttr.opacity = activeObject.get('opacity') * 100;
    baseAttr.left = activeObject.get('left');
    baseAttr.top = activeObject.get('top');
    baseAttr.angle = activeObject.get('angle') || 0;
    baseAttr.width = activeObject.get('width') || 0;
    baseAttr.height = activeObject.get('height') || 0;
    baseAttr.scaleX = activeObject.get('scaleX') || 0;
    baseAttr.scaleY = activeObject.get('scaleY') || 0;
    baseAttr.tWidth = parseInt(baseAttr.width * baseAttr.scaleX);
    baseAttr.tHeight = parseInt(baseAttr.height * baseAttr.scaleY);
    baseAttr.id = activeObject.get('id');
  }
};

// 通用属性改变
const changeCommon = (key, value) => {
  const activeObject = canvasEditor.canvas.getActiveObjects()[0];
  if (activeObject) {
    // 透明度特殊转换
    if (key === 'opacity') {
      activeObject && activeObject.set(key, value / 100);
      canvasEditor.canvas.renderAll();
      return;
    }
    // 旋转角度适配
    if (key === 'angle') {
      activeObject.rotate(value);
      canvasEditor.canvas.renderAll();
      return;
    }
    activeObject && activeObject.set(key, value);
    canvasEditor.canvas.renderAll();
  }
};

const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};

onMounted(() => {
  // 获取字体数据
  getObjectAttr();
  canvasEditor.on('selectCancel', selectCancel);
  canvasEditor.on('selectOne', getObjectAttr);
  canvasEditor.canvas.on('object:modified', getObjectAttr);
});

onBeforeUnmount(() => {
  canvasEditor.off('selectCancel', selectCancel);
  canvasEditor.off('selectOne', getObjectAttr);
  canvasEditor.canvas.off('object:modified', getObjectAttr);
});
</script>

<style scoped lang="less">
:deep(.ivu-input-number) {
  display: block;
  width: 100%;
}

.ivu-form-item {
  background: #f6f7f9;
  border-radius: 5px;
  padding: 0 5px;
  margin-bottom: 10px;
}

.ivu-row {
  margin-bottom: 10px;
}
</style>
