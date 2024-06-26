<template>
  <div class="viewer-box">
    <a-modal
        v-model:visible="importModal"
        title="系统获取患者信息查询"
        style="top: 100px"
        :maskClosable=false
        :width="1600"
        :closable=false
        :confirm-loading="confirmLoading"
    >
      <template #footer>
        <a-button class="generalBtn" key="submit" type="primary" :disabled="confirmLoading" @click="closeModal">关闭</a-button>
      </template>
      <div class="searchBox">
        <a-textarea v-model:value="keyword" placeholder="请输入查询条件" :rows="3" />
        <a-button class="generalBtn" type="primary" :disabled="confirmLoading" @click="searchList">查询</a-button>
      </div>
      <div class="hint"><exclamation-circle-outlined style="color: #FFCCCC" /> 注意：请输入完整的患者编号、检查编号或姓名，如有多个条件，请以空格隔开</div>


      <div class="list" v-if="pageStatus === 'list'">
        <div class="tableBox">
          <a-table :data-source="patientList" :pagination="pagination" class="importedTable"
                   :columns="columns" :row-key="record => record.id" table-layout="fixed"
                   :childrenColumnName="'kids'" >
            <template #bodyCell="{column, record, index}">
              <template v-if="column.key === 'orderNum'">
                {{Number(index) + 1}}
              </template>
              <template v-if="column.key === 'createTime'">
                {{(new Date(record.createTime)).toLocaleString()}}
              </template>
              <template v-if="column.key === 'action'">
                <a-button class="generalBtn receive" v-if="record.syncStatus !== '03'" type="primary" :disabled="record.syncStatus === '03'" @click="getStatus(record)">获取</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { InboxOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import {defineExpose, ref, h, defineEmits, reactive} from 'vue';
import {
  findFromPACS, keepUpToDate, syncFromPACS,
} from "@/api";
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";


const emit = defineEmits(["initList"]);
const importModal = ref(false);
const confirmLoading = ref(false);
let pageStatus = ref('list');
let patientList = ref([])
const keyword = ref('')
let timeCounter = ref()

const columns = [
  {
    title: '序号',
    dataIndex: 'orderNum',
    key: 'orderNum',
    align: 'center',
    width: 60
  },
  {
    title: '姓名',
    dataIndex: 'patientName',
    key: 'patientName',
    align: 'center',
    width: 160
  },
  {
    title: '性别',
    dataIndex: 'patientSex',
    key: 'patientSex',
    align: 'center',
    width: 60
  },
  {
    title: '年龄',
    dataIndex: 'patientAge',
    key: 'patientAge',
    align: 'center',
    width: 60
  },
  {
    title: '患者编号',
    dataIndex: 'patientId',
    key: 'patientId',
    align: 'center',
    width: 200
  },
  {
    title: '检查编号',
    dataIndex: 'studyInstanceUid',
    key: 'studyInstanceUid',
    align: 'center',
    width: 200
  },
  {
    title: '检查日期',
    dataIndex: 'studyDateTime',
    key: 'studyDateTime',
    align: 'center',
    width: 200
  },
  {
    title: '检查描述',
    dataIndex: 'studyDescription',
    key: 'studyDescription',
    align: 'center',
    width: 300
  },
  {
    title: '资料状态',
    dataIndex: 'syncStatusCN',
    key: 'syncStatusCN',
    align: 'center',
    width: 100
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    align: 'center',
    width: 100
  },
]
let counter = ref(0)
const statusDirectory = [
  {label: '已存在', value: '01'},
  {label: '未获取', value: '02'},
  {label: '获取中', value: '03'},
  {label: '获取失败', value: '04'}
]

const openModal = () => {
  importModal.value = true
}

const timerBuilder = () => {
  timeCounter.value = setInterval(() => {
    patientList.value.forEach(async ele => {
      if (ele.syncStatus === '03') {
        const res = await keepUpToDate([ele.studyInstanceUid])
        const result = getAPIResponse(res)
        counter.value ++
        for (let key in result) {
          for (let i = 0 ; i < statusDirectory.length; i ++) {
            if (result[key] === statusDirectory[i].value) {
              ele.syncStatus = result[key]
              ele.syncStatusCN = statusDirectory[i].label
            }
          }

        }
        console.log(result, '--', counter.value)
      }
    })
  }, 3000)
}
// P00231492 202007150084 CT22030974 PCT20210922021 WU
const searchList = async () => {
  confirmLoading.value = true
  const res = await findFromPACS({keyword: keyword.value})
  const result = getAPIResponse(res)
  console.log(result)
  confirmLoading.value = false
  if (result) {
    if (!timeCounter.value) {
      console.log('interval start')
      timerBuilder()
    }
    patientList.value = result
    pagination.total = result.length
  }
}

const getStatus = (record) => {
  syncFromPACS({studyUID: record.studyInstanceUid}).then(res => {
    const result = getAPIResponse(res)
    console.log(result)
    confirmLoading.value = false
    if (result) {
      record.syncStatus = '03'
      record.syncStatusCN = '获取中'
    }
  })
}


const closeModal = (e) => {
  clearInterval(timeCounter.value)
  patientList.value = []
  keyword.value = ''
  emit('initList')
  importModal.value = false;
  confirmLoading.value = false;
}

// const handleChangePage = (page, size) => {
//   pageStatus.value = 'list'
//   pagination.current = page
//   pagination.size = size.toString()
//   searchList()
// }

const pagination = reactive( {
  current: 1,
  size: '10',
  showSizeChanger: true,
  showQuickJumper: true,
  // onChange: handleChangePage
})


defineExpose({
  openModal,
});

</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.searchBox {
  display: flex;
  width: 60%;
  textarea.ant-input {
    margin-right: 10px;
  }
  .generalBtn {
    align-self: stretch;
    height: auto !important;
  }
}
.hint {
  margin-bottom: 30px;
}

.importedTable {
  :deep(.ant-spin-nested-loading) {
    .ant-table {
      //height: 84vh !important;
      background-color: #2c2e30;
      color: white;
      padding: 4px;
      table {
        border-collapse: collapse;
      }
      .ant-table-thead > tr > th {
        color: white;
        background-color: #1d1f21;
        //border: none;
        &:not(.ant-table-selection-column) {
          padding: 16px 0;
          border-bottom: none;
        }
        .ant-checkbox {
          top: 36px;
        }
      }
      .ant-table-tbody {
        .statusBox {
          display: flex;
          .icon {
            &:hover {
              box-shadow: white;
            }
            cursor: pointer;
          }
          .txt {
            margin-right: 4px;
          }
        }
        .ant-empty-description {
          color: white;
        }
      }
      .ant-table-tbody > tr:hover > td {
        background: #515e5e;
        color: white;
      }
      .ant-table-tbody > tr {
        border: 1px solid #484848;
        td {
          background-color: #2c2e30;
          .receive {
            width: 100% !important;
          }
        }
      }
      .ant-table-row {
        td {
          border: none;
        }
        .ant-table-cell-row-hover {
          background-color: #515e5e;
        }
        &:hover {
          td {
            background-color: #515e5e;
          }
        }
      }
      .ant-table-cell.ant-table-selection-column {
        padding-left: 24px;
      }
    }
    .ant-pagination {
      .ant-pagination-item-link {
        background-color: #2c2e30;
        color: white;
        .ant-pagination-item-ellipsis {
          color: white;

        }
      }
      .ant-pagination-item {
        background-color: #2c2e30;
        color: white;
        a {
          color: white;
        }
      }
      .ant-pagination-options {
        .ant-select-selector {
          background-color: #2c2e30 !important;
          border: 1px solid #64686d !important;
          color: white;
        }
        .ant-select-arrow {
          background-color: #242c2c;
          color: white;
        }
        .ant-pagination-options-quick-jumper {
          color: white;
          input {
            background-color: #2c2e30;
            color: white;
          }
        }
      }
    }

  }
}
</style>
