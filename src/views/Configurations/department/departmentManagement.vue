<template>
  <div>
    <breadcrumb :title="'部门管理'" />
    <div class="area">
      <div class="treeArea">
        <a-directory-tree
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            :tree-data="treeData"
            :field-names="fieldNames"
            default-expand-all
        >

        </a-directory-tree>
      </div>
      <div class="tableArea">
        <div class="functionArea">
          <a-button block type="info" class="generalBtn" @click="e => addDepartment(null)">
            新增 </a-button>
        </div>
        <div class="tableBox">
          <a-table :data-source="departmentList" :columns="columns" :row-key="record => record.id"
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
    <EditModal ref="editModal"  @selectDepartment="selectDepartment" />
    <ConfirmModal ref="confirmModal" @selectDepartment="selectDepartment"></ConfirmModal>
  </div>
</template>

<script setup>
import { createFromIconfontCN, DeleteOutlined } from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";
import {ref, watch, reactive, nextTick, onMounted} from 'vue';
import {getAPIResponse} from "@/utils/apiTools/useAxiosApi";
import {findCurrentDepartment, getDeptTree} from "@/api";
import EditModal from "./departmentEditModal";
import ConfirmModal from "../confirmModal";
import breadcrumb from "../breadcrumb.vue";

let departmentList = ref([])
let editModal = ref(null);
let confirmModal = ref(null);
let selectedDepartment = ref(null);

let expandedKeys = ref([]);
let selectedKeys = ref([]);

const fieldNames = {
  title: 'deptName',
  key: 'id'
};

const treeData = ref([])

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
    title: '部门编号',
    dataIndex: 'deptCode',
    key: 'deptCode',
    align: 'center',
  },
  {
    title: '部门名称',
    dataIndex: 'deptName',
    key: 'deptName',
    align: 'center',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
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
  initList(true)
})

watch(selectedKeys, (newKey, oldKey) => {
  const oldValue = Array.isArray(oldKey) ? oldKey[0] : oldKey
  const newValue = Array.isArray(newKey) ? newKey[0] : newKey
  // console.log('old: ', oldValue, ', new: ', newValue,', selectedKeys: ', selectedKeys.value)
  if (!newValue) {
    selectedKeys.value = [oldValue]
  }
  findCurrentDepartment({parentId: selectedKeys.value[0]}).then(res => {
    const result = getAPIResponse(res)
    departmentList.value = result
    // console.log(result)
  })
  // console.log('selectedKeys', selectedKeys.value);
});

const selectDepartment = (key, isFreshTree) => {
  // console.log(key)
  selectedKeys.value = Array.isArray(key) ? key : [key]
  if (isFreshTree) {
    initList()
  }
}

const initList = (isInitialDepartmentList) => {
  // console.log('key: ', key)

  getDeptTree(null).then(res => {
    const result = getAPIResponse(res)
    expandedKeys.value.push(result[0].id)
    selectedKeys.value.push(result[0].id)
    treeData.value = result
    // console.log(result)
    nextTick(() => {
      if (isInitialDepartmentList) {
        departmentList.value = result[0].children
      }
      handleChangePage(1)

    })
  })
}

const addDepartment = (record) => {
  selectedDepartment = findItemById(treeData.value, selectedKeys.value[0])
  editModal.value.openModal(true, selectedDepartment, record)
}

const findItemById = (arr, id) => {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item.id === id) {
      return item;
    } else if (item.children) {
      const childItem = findItemById(item.children, id);
      if (childItem) {
        return childItem;
      }
    }
  }
  return null;
}

const editItem = (record) => {
  // console.log(record)
  addDepartment(record)
};
const deleteItem = (record) => {
  // console.log(record)
  confirmModal.value.openModal(true, record, 'department')
};

const handleChangePage = (page) => {
  // console.log(page)
  pagination.current = page
}

const pagination = reactive( {
  current: 1,
  showSizeChanger: true,
  onChange: handleChangePage
})

</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
  .area {
    justify-content: start;
    .generalBtn {
      width: 100px !important;
      height: 32px !important;
      font-size: 14px;
      line-height: initial;
    }
    .treeArea {
      width: 323px;
      background-color: #434548;
      padding:5px 0;
      :deep(.ant-tree) {
        color: white;
        background: #444648;
        .ant-tree-treenode {
          font-size: 14px;
          line-height: 30px;
          height: 30px;
          padding: 0 10px;
          .ant-tree-title {
            padding: 2px 4px;
            border-radius: 4px;
          }
          &:hover {
            &:before {
              background-color: transparent;
            }
            .ant-tree-title {
              background-color: #8a9393;
            }
          }
          .ant-tree-switcher {
            display: flex;
            width: 10px;
            .anticon {
              align-self: center;
            }
          }
          &.ant-tree-treenode-selected {
            &:before {
              background-color: transparent;
            }
            background-color: #7d858a;
          }
        }
        .ant-tree-node-content-wrapper {
          align-self: center;
        }
      }
    }
    .tableArea {
      width: 64vw;
      padding: 0 24px;
      background-color: rgb(44, 46, 49);

      .functionArea {
        width: 100%;
        margin-bottom: 24px;
        .btn {
          width: 120px;
        }
      }
      .tableBox{
        :deep(.ant-table) {

            .ant-table-cell {
              color: white;
              background-color: #434548;
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
