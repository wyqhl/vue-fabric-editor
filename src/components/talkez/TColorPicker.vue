<template>
  <div class="bg-item">
    <a-row style="width: 100%">
      <div style="display: flex; width: 100%; align-items: center">
        <div style="flex: auto">
          <a-trigger trigger="hover" position="left" :popup-translate="[-20, 0]" show-arrow>
            <div class="color-bar">
              <div
                :style="{
                  backgroundColor: color,
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }"
              ></div>
            </div>
            <template #content>
              <div style="padding: 10px 0">
                <a-color-picker
                  :model-value="color"
                  hideTrigger
                  showPreset
                  size="mini"
                  :format="myFormat"
                  @change="changeColor"
                />
              </div>
            </template>
          </a-trigger>
        </div>
        <div style="flex: 0 0 40px; width: 40px; padding-left: 8px">
          <a-tooltip content="从屏幕上吸取颜色" position="br">
            <a-button @click="pickColor" size="mini" type="dashed">
              <template #icon>
                <icon-palette />
              </template>
            </a-button>
          </a-tooltip>
        </div>
      </div>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
const emit = defineEmits(['update:value', 'change']);
const props = defineProps({
  value: {
    type: String,
    default: '#ffffffff',
  },
});

const color = ref('');

let myFormat = ref('hex');

/**
 * 颜色修改时
 * @param currentColor 最新颜色
 */
function changeColor(currentColor: string) {
  color.value = currentColor;
  onChange();
}

/**
 * 触发上级改变
 */
function onChange() {
  emit('update:value', color.value);
  emit('change', color.value);
}

/**
 * 颜色变化时
 */
watch(
  () => props.value,
  () => {
    refreshColor();
  }
);

/**
 * 取色
 */
const pickColor = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-undef
    const dropper = new EyeDropper();
    let res = await dropper.open();
    color.value = res.sRGBHex;
    onChange();
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (e.name && e.name === 'AbortError') {
      return;
    }
    Message.error('当前浏览器不支持此功能');
  }
};

const refreshColor = () => {
  color.value = props.value;
  myFormat.value = props.value && props.value.indexOf('#') > -1 ? 'hex' : 'rgb';
};

onMounted(() => {
  refreshColor();
});
</script>

<style scoped lang="less">
.color-bar {
  width: 100%;
  height: 24px;
  cursor: pointer;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
  position: relative;
}
</style>
