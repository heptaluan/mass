<template>
  <div>
    <breadcrumb :title="'参数管理'" />
    <div class="area">
      <div class="tableArea">
        <div class="title">窗宽窗位设置</div>
        <div class="functionArea">
          <div class="btnArea">
            <a-button block type="info" class="generalBtn" @click="e => addDepartment(null)">
              新增 </a-button>
            <a-button block type="info" class="generalBtn" @click="setDefault">
              设定默认 </a-button>
          </div>
        </div>
        <div class="tableBox">
          <a-table :data-source="parameterList" :rowSelection="rowSelection"
                   :columns="columns" :row-key="record => record.id"
                   :pagination="false" :childrenColumnName="'kids'" bordered>
            <template #bodyCell="{column, record, index}">
              <template v-if="column.key === 'orderNum'">
                {{index + 1}}
              </template>
              <template v-if="column.key === 'operation'">
                <span class="icon" @click="editItem(record)"><icon-font type="icon-bianji" /></span>
                <span class="icon" @click="deleteItem(record)"><icon-font type="icon-shanchu1" /></span>
              </template>
            </template>
          </a-table>

        </div>
      </div>
    </div>
    <EditModal ref="editModal"  @initList="initList" />
    <ConfirmModal ref="confirmModal" @initList="initList"></ConfirmModal>
  </div>

</template>

<script setup>
import { createFromIconfontCN, DeleteOutlined } from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";
import {ref, reactive, onMounted} from 'vue';
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import {getAllCtParam, setParametersDefault} from "@/api";
import EditModal from "./parameterModal";
import ConfirmModal from "../confirmModal";
import router from "@/router";
import breadcrumb from "../breadcrumb.vue";

let parameterList = ref([])
let editModal = ref(null);
let confirmModal = ref(null);
let selectedParameter = ref(null);


const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const columns = [
  {
    title: '序号',
    dataIndex: 'orderNum',
    key: 'orderNum',
    align: 'center',
    // width: 300
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
  },
  {
    title: '窗宽',
    dataIndex: 'width',
    key: 'width',
    align: 'center',
  },
  {
    title: '窗位',
    dataIndex: 'height',
    key: 'height',
    align: 'center',
  },
  {
    title: '默认值',
    dataIndex: 'isDefaultCn',
    key: 'isDefaultCn',
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    align: 'center',
  }
]

onMounted(() => {
  initList()
})

const initList = () => {

  getAllCtParam(null).then(res => {
    const result = getAPIResponse(res)
    parameterList.value = result
    // console.log(result)
    handleChangePage(1)
  })
}

const addDepartment = (record) => {
  editModal.value.openModal(true, record)
}

const editItem = (record) => {
  console.log(record)
  addDepartment(record)
};
const deleteItem = (record) => {
  console.log(record)
  confirmModal.value.openModal(true, record, 'parameters')
};

const setDefault = () => {
  console.log(selectedParameter.value)
  if (selectedParameter.value) {
    confirmModal.value.openModal(true, selectedParameter.value, 'setParametersDefault')
  }
}

const rowSelection = {
  type: 'radio',
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    selectedParameter.value = selectedRows
  },
};

const handleChangePage = (page) => {
  pagination.current = page
}

const pagination = reactive( {
  current: 1,
  showSizeChanger: true,
  showQuickJumper: true,
  onChange: handleChangePage
})

</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.viewer-box {
  width: 60vw;
  .title {
    padding: 30px 2px;
    color: white;
  }
}
.area {
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding: 12px 0 24px;
  .generalBtn {
    width: 100px !important;
    height: 32px !important;
    font-size: 14px;
    line-height: initial;
  }
  .functionArea {
    padding-left: 24px;
    padding-right: 24px;

    .btnArea {
      display: flex;
      flex-grow: 1;
      .generalBtn {
        align-self: center;
      }
    }
  }
  .tableArea {
    width: 100vw;
    //padding: 24px;
    background-color: transparent;
    .title {
      padding: 10px 24px 20px;
      border-bottom: 1px solid #636363;
      color: white;
      margin-bottom: 24px;
    }
    .functionArea {
      width: 100%;
      margin-bottom: 24px;
      .btn {
        width: 120px;
      }
    }
    .tableBox{
      width: 100%;
      padding: 0 24px;
      :deep(.ant-table) {
        .ant-table-row {
          border: 1px solid #f0f0f0;
        }
        .ant-table-row-selected {
          border: 1px solid #f0f0f0;
          td {
            border-color: #f0f0f0;
          }
        }
        .ant-table-cell {
          color: white;
          background-color: #444648;
          .icon {
            &:hover {
              color: #b1e5f8;
              cursor: pointer;
            }
            &:first-child {
              margin-right: 20px;
            }
            .anticon {
              font-size: 20px;
              svg {
                color: white;
              }
            }
          }
        }

      }
    }
  }
}
</style>
