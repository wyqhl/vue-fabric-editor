<template>
  <div class="box-border p-10px;">
    <div>
      <a-row class="top" style="height: 30px; width: 100%; padding: 0 8px; margin: 10px 0">
        <div style="width: 100%; display: flex; align-items: center">
          <a-select
            :style="{ width: '100%' }"
            placeholder="根据分类查找"
            allow-clear
            @change="changeType"
            @clear="clearType"
            v-model="typeId"
          >
            <a-option v-for="item in dataList" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-option>
          </a-select>
        </div>
      </a-row>
      <a-row
        :style="{
          width: '100%',
          overflowY: 'auto',
          maxHeight: h + 'px',
          paddingBottom: '100px',
        }"
        class="scroll-hidden"
      >
        <a-spin :loading="loading" style="width: 100%">
          <template v-if="dataList.length === 0">
            <a-empty></a-empty>
          </template>
          <template v-else>
            <div style="padding: 0 8px">
              <template v-if="detail">
                <!--明细状态-->
                <a-row style="width: 100%" v-for="row in detailList" :key="row.id" class="row">
                  <a-row style="width: 100%; line-height: 20px; margin-bottom: 8px">
                    <a-col :span="16">
                      <span style="font-size: 16px; font-weight: bold">{{ row.name }}</span>
                    </a-col>
                    <a-col :span="8">
                      <div
                        @click="clearType"
                        style="
                          display: flex;
                          justify-content: right;
                          align-items: center;
                          color: var(--color-text-3);
                          cursor: pointer;
                          font-size: 13px;
                          font-weight: bold;
                        "
                      >
                        返回
                      </div>
                    </a-col>
                  </a-row>
                  <a-row style="width: 100%" :gutter="8">
                    <template v-if="row.children.length === 0">
                      <a-empty>
                        <template #image></template>
                      </a-empty>
                    </template>
                    <template v-else>
                      <template v-for="(item, index) in row.children" :key="index">
                        <a-col :span="12" @click="onClickItem(item)">
                          <div class="item" style="width: 100%">
                            <a-tooltip :content="item.name" position="top">
                              <a-image
                                :src="COS_URL + 'images/' + item.image"
                                width="100%"
                                height="200"
                                style="border-radius: 6px"
                                :preview="false"
                              />
                            </a-tooltip>
                          </div>
                        </a-col>
                      </template>
                    </template>
                  </a-row>
                </a-row>
              </template>
              <template v-else>
                <a-row style="width: 100%" v-for="row in dataList" :key="row.id" class="row">
                  <a-row style="width: 100%; line-height: 20px; margin-bottom: 8px">
                    <a-col :span="16">
                      <span style="font-size: 16px; font-weight: bold">{{ row.name }}</span>
                    </a-col>
                    <a-col :span="8">
                      <div
                        @click="goDetail(row)"
                        v-if="row.children && row.children.length > 8"
                        style="
                          display: flex;
                          justify-content: right;
                          align-items: center;
                          color: var(--color-text-3);
                          cursor: pointer;
                          font-size: 13px;
                          font-weight: bold;
                        "
                      >
                        查看更多
                      </div>
                    </a-col>
                  </a-row>
                  <a-row style="width: 100%" :gutter="8">
                    <template v-if="row.children.length === 0">
                      <a-empty>
                        <template #image></template>
                      </a-empty>
                    </template>
                    <template v-else>
                      <template v-for="(item, index) in row.children" :key="index">
                        <a-col :span="12" @click="onClickItem(item)" v-if="index < 6">
                          <div class="item" style="width: 100%">
                            <a-tooltip :content="item.name" position="top">
                              <a-image
                                :src="COS_URL + 'images/' + item.image"
                                width="100%"
                                height="200"
                                style="border-radius: 6px"
                                :preview="false"
                              />
                            </a-tooltip>
                          </div>
                        </a-col>
                      </template>
                    </template>
                  </a-row>
                </a-row>
              </template>
            </div>
          </template>
        </a-spin>
      </a-row>
    </div>
    <a-modal
      v-model:visible="modalShow"
      @cancel="closeModal"
      :on-before-ok="getTemplateDataAndAdd"
      unmountOnClose
      simple
      :modal-style="{ padding: '24px' }"
      hide-title
      :width="400"
      :ok-text="getTemplateDataIng ? '加载数据中...' : '确认'"
      :ok-loading="getTemplateDataIng"
      :top="100"
    >
      <div style="font-size: 14px; padding-bottom: 12px">
        <a-row style="width: 100%; display: flex; align-items: center; justify-content: center">
          <a-space>
            <icon-question-circle-fill style="color: #ff7d00; margin-right: 4px" size="30" />
            <div style="font-size: 16px; font-weight: bold">提示</div>
          </a-space>
        </a-row>
        <a-row
          style="
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-top: 20px;
          "
        >
          <div>确认使用此模板并添加到画布吗？</div>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<script setup name="MyTemplate">
import { reactive, ref } from 'vue';
import { queryMaterialIndexData, getMaterial } from '@/talkez/api/imageEditor.api';
import { Message } from '@arco-design/web-vue';
import useSelect from '@/hooks/select';

const h = ref(500);

const { canvasEditor } = useSelect();
//素材数据
let dataList = reactive([]);
//原始数据
let indexDataList = reactive([]);
//加载状态
let loading = ref(true);
//是否进入明细状态
let detail = ref(false);
//当前选中的分类
let typeId = ref('');
//OOS地址
const COS_URL = 'https://static.talkez.net/';
//明细状态显示的数据
let detailList = reactive([]);
//确认弹框显示
let modalShow = ref(false);
//确认弹框后加载状态
let getTemplateDataIng = ref(false);
//待添加的模板ID
let template = ref(null);

const getTemplateDataAndAdd = async (done) => {
  getTemplateDataIng.value = true;
  getMaterial(template.value)
    .then((res) => {
      if (res.success && res.data && res.data.json) {
        canvasEditor.loadJSON(JSON.stringify(JSON.parse(res.data.json)));
        setTimeout(() => {
          getTemplateDataIng.value = false;
          modalShow.value = false;
          done(true);
        }, 500);
      } else {
        Message.error('加载模板数据失败');
        modalShow.value = false;
        getTemplateDataIng.value = false;
        done(false);
      }
    })
    .catch((e) => {
      Message.error('加载模板数据失败');
      modalShow.value = false;
      getTemplateDataIng.value = false;
      done(false);
    });
  return done(false);
};

const closeModal = () => {
  modalShow.value = false;
};

/**
 * 清除分类
 */
const clearType = () => {
  detailList.splice(0, detailList.length);
  detail.value = false;
  dataList = indexDataList;
  typeId.value = '';
};

/**
 * 选择分类
 */
const changeType = (id) => {
  if (indexDataList.length > 0) {
    const find = indexDataList.find((item) => item.id === id);
    if (find) {
      detailList.splice(0, detailList.length);
      detailList.push(find);
      detail.value = true;
    }
  }
};

//进入明细状态
const goDetail = (item) => {
  detailList.splice(0, detailList.length);
  detailList.push(item);
  typeId.value = item.id;
  detail.value = true;
};

//查询素材数据
const getList = () => {
  queryMaterialIndexData('TEMPLATE').then((res) => {
    indexDataList.push(...res.data);
    dataList.push(...res.data);
    loading.value = false;
  });
};

/**
 * 点击素材添加
 */
const onClickItem = async (item) => {
  template.value = item;
  modalShow.value = true;
};

const setHeight = () => {
  h.value = window.innerHeight - 55;
};

onUnmounted(async () => {
  window.removeEventListener('resize', setHeight);
});

onMounted(async () => {
  setHeight();
  getList();
  window.addEventListener('resize', () => {
    setHeight();
  });
});
</script>
<style scoped>
.row {
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 18px;
}

.item {
  width: 100%;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-bottom: 8px;
}

.item:hover {
}

/* 文本超出省略 */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

/* 隐藏滚动条 */
.scroll-hidden::-webkit-scrollbar {
  display: none;
}
</style>
