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
        <!--        <div style="width: 100%; height: 20px; display: flex; align-items: center;">-->
        <!--          <a-input-search style="width: 100%;" placeholder="根据关键词搜索素材"/>-->
        <!--        </div>-->
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
                  <a-row style="width: 100%; line-height: 20px">
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
                  <a-row style="width: 100%" :gutter="12">
                    <template v-if="row.children.length === 0">
                      <a-empty>
                        <template #image></template>
                      </a-empty>
                    </template>
                    <template v-else>
                      <template v-for="(item, index) in row.children" :key="index">
                        <a-col :span="8" @click="onClickItem(item)">
                          <div class="item">
                            <img
                              :src="COS_URL + 'images/' + item.image"
                              :alt="item.name"
                              style="
                                width: 100%;
                                height: 60px;
                                object-fit: contain;
                                vertical-align: top;
                              "
                            />
                          </div>
                        </a-col>
                      </template>
                    </template>
                  </a-row>
                </a-row>
              </template>
              <template v-else>
                <a-row style="width: 100%" v-for="row in dataList" :key="row.id" class="row">
                  <a-row style="width: 100%; line-height: 20px">
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
                  <a-row style="width: 100%" :gutter="12">
                    <template v-if="row.children.length === 0">
                      <a-empty>
                        <template #image></template>
                      </a-empty>
                    </template>
                    <template v-else>
                      <template v-for="(item, index) in row.children" :key="index">
                        <a-col :span="6" @click="onClickItem(item)" v-if="index < 8">
                          <div class="item">
                            <img
                              :src="COS_URL + 'images/' + item.image"
                              :alt="item.name"
                              style="
                                width: 100%;
                                height: 60px;
                                object-fit: contain;
                                vertical-align: top;
                              "
                            />
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
  </div>
</template>

<script setup name="material">
import { reactive, ref } from 'vue';
import { queryMaterialIndexData } from '@/talkez/api/imageEditor.api';
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
  queryMaterialIndexData('MATERIAL').then((res) => {
    indexDataList.push(...res.data);
    dataList.push(...res.data);
    loading.value = false;
  });
};

/**
 * 点击素材添加
 */
const onClickItem = async (item) => {
  const data = {
    target: {
      src: COS_URL + 'images/' + item.image,
    },
  };
  const imgItem = await canvasEditor.createImgByElement(data.target);
  canvasEditor.addBaseType(imgItem, {
    scale: true,
  });
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
  padding: 12px;
  background-color: var(--color-fill-2);
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 12px;
}

.item {
  padding: 6px;
  width: 100%;
  height: 80px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.item:hover {
  background-color: var(--color-fill-4);
}

/* 隐藏滚动条 */
.scroll-hidden::-webkit-scrollbar {
  display: none;
}
</style>
