<template>
  <div>
    <breadcrumb :title="'患者检测详情'" />
    <div class="area">
      <div class="tableArea">
        <div className="report-contetn">
          <div className="report-box" id="pdfBox">
            <div className="report-title">检 测 报 告</div>

            <div className="report-code">
              <div>报告编号：</div>
              <div>{{userInfo.sampleCode}}</div>
            </div>

            <div className="user-info">
              <div className="list">
                <div>患者姓名</div>
                <div>{{userInfo.name}}</div>
              </div>
              <div className="list">
                <div>性别</div>
                <div>{{userInfo.sex === 0 ? '男' : '女'}}</div>
              </div>
              <div className="list">
                <div>年龄</div>
                <div>{{userInfo.age}}</div>
              </div>
            </div>

            <div className="patient-code">
              <div className="list">
                <div>患者编号</div>
                <div>{{userInfo.sampleCode}}</div>
              </div>
              <div className="list">
                <div>检测日期</div>
                <div style="width:250px">{{userInfo.checkDate}}</div>
              </div>
            </div>

            <div className="testing-content">
              <div className="testing-title">检测项目</div>
              <div className="testing-table">
                <div className="table-title">
                  <div>名称</div>
                  <div>测定值</div>
                  <div>参考范围</div>
                  <div>提示</div>
                </div>

                <div v-for="item in testingData" :key="item.id">
                  <div className="table-list">
                    <div>{{ item.itemName }}</div>
                    <div>{{ item.actualValue }}</div>
                    <div>{{ item.range }}</div>
                    <div>{{  }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="backup">
              <div className="list">
                <div>备注</div>
                <div>{{userInfo.remark}}</div>
              </div>
            </div>

            <div className="score">
              <div className="list">
                <div>评分</div>
                <div>{{userInfo.scores}}</div>
              </div>
            </div>

            <div className="assessing">
              <div className="list">
                <div>审批人员：</div>
                <div>李梅</div>
              </div>
              <div className="list">
                <div>报告时间：</div>
                <div>2023-10-13</div>
              </div>
            </div>

            <div className="btn-download" @click="handleDownloadPDF()">
              下载电子版本
            </div>
            <div className="btn-backup" @click="jumpTo()">返回</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import { message } from "ant-design-vue";
import { createFromIconfontCN } from "@ant-design/icons-vue";
import IconFontUrl from "../../../assets/iconFont";
import {
  defineExpose,
  ref,
  h,
  defineEmits,
  onMounted,
  reactive,
  nextTick,
} from "vue";
import { getAPIResponse } from "@/utils/apiTools/useAxiosApi";
import ConfirmModal from "../confirmModal";
import breadcrumb from "../breadcrumb.vue";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { getPatientDetail } from "@/api";

const IconFont = createFromIconfontCN({
  scriptUrl: IconFontUrl,
});

const testingData = ref([]);
const userInfo = ref({})

onMounted(() => {
  initList();
});

const initList = (status, page) => {
  getPatientDetail({ id: router.currentRoute.value.params.id }).then((res) => {
    const result = getAPIResponse(res);
    if (result) {
      formatTable(result.patientQualityVOList);
      userInfo.value = result
    }
  });
};

const formatTable = (data) => {
  for (let i = 0; i < data.length; i++) {
    testingData.value.push({
      id: i,
      itemName: data[i].itemName,
      actualValue: `${data[i].actualValue}${data[i].unit}`,
      range: `${data[i].targetValueL}-${data[i].targetValueH}${data[i].unit}`
    });
  }
};

// 下载PDF
const handleDownloadPDF = () => {
  exportPDF("123", document.getElementById("pdfBox"));
};

const exportPDF = async (title, ele) => {
  // 根据dpi放大，防止图片模糊
  const scale = window.devicePixelRatio > 1 ? window.devicePixelRatio : 2;
  // 下载尺寸 a4 纸 比例
  let pdf = new jsPDF("p", "pt", "a4");
  let width = ele.offsetWidth;
  let height = ele.offsetHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  var contentWidth = canvas.width;
  var contentHeight = canvas.height;

  //一页pdf显示html页面生成的canvas高度;
  var pageHeight = (contentWidth / 592.28) * 841.89;
  //未生成pdf的html页面高度
  var leftHeight = contentHeight;
  //页面偏移
  var position = 0;
  //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
  var imgWidth = 595.28;
  var imgHeight = (592.28 / contentWidth) * contentHeight;
  const pdfCanvas = await html2canvas(ele, {
    useCORS: true,
    canvas,
    scale,
    width,
    height,
    x: 0,
    y: 0,
  });
  const imgDataUrl = pdfCanvas.toDataURL();

  if (height > 14400) {
    // 超出jspdf高度限制时
    const ratio = 14400 / height;
    // height = 14400;
    width = width * ratio;
  }

  // 缩放为 a4 大小  pdfpdf.internal.pageSize 获取当前pdf设定的宽高
  height = (height * pdf.internal.pageSize.getWidth()) / width;
  width = pdf.internal.pageSize.getWidth();
  if (leftHeight < pageHeight) {
    pdf.addImage(imgDataUrl, "png", 0, 0, imgWidth, imgHeight);
  } else {
    // 分页
    while (leftHeight > 0) {
      pdf.addImage(imgDataUrl, "png", 0, position, imgWidth, imgHeight);
      leftHeight -= pageHeight;
      position -= 841.89;
      //避免添加空白页
      if (leftHeight > 0) {
        pdf.addPage();
      }
    }
  }
  // 导出下载
  await pdf.save(`${title}.pdf`);
};

// 跳转
const jumpTo = () => {
  router.push({ name: "patientList" });
};
</script>

<style scoped>
@import "@/assets/main.css";
</style>
<style scoped lang="scss">
.area {
  .tableArea {
    width: 100%;

    .report-contetn {
      margin: 15px;
      padding: 25px;
      background: #fff;
      display: flex;
      justify-content: center;

      &::-webkit-scrollbar {
        width: 6px;
        height: 1px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        box-shadow: inset 0 0 5px rgb(231, 232, 233);
        background: rgb(231, 232, 233);
      }

      &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px rgb(231, 232, 233);
        border-radius: 10px;
        background: #ededed;
      }

      .report-box {
        width: 850px;
        height: 100%;
        border: 1px solid rgba(51, 51, 51, 0.3);
        position: relative;
        padding: 50px 30px 20px;

        // 标题
        .report-title {
          font-size: 24px;
          height: 100px;
          line-height: 100px;
          text-align: center;
          font-weight: bold;
        }

        // 报告编号
        .report-code {
          display: flex;
          align-items: center;

          div:first-child {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            width: 120px;
            height: 50px;
            line-height: 50px;
          }

          div:last-child {
            font-size: 14px;
            text-align: center;
            width: 140px;
            height: 50px;
            line-height: 50px;
            position: relative;

            &::after {
              position: absolute;
              bottom: 10px;
              left: 0;
              content: "";
              width: 100%;
              height: 1px;
              background-color: rgba(0, 0, 0, 0.15);
            }
          }
        }

        // 患者信息
        .user-info {
          display: flex;
          align-items: center;
          border: 1px solid rgb(235, 238, 245);

          .list {
            display: flex;
            align-items: center;

            &:first-child div:first-child {
              border-left: none;
            }

            div {
              border-left: 1px solid rgb(235, 238, 245);
              font-size: 14px;
              text-align: center;
              height: 50px;
              line-height: 50px;
            }

            div:first-child {
              font-weight: bold;
              width: 120px;
            }

            div:last-child {
              width: 140px;
            }
          }
        }

        // 患者编号
        .patient-code {
          display: flex;
          align-items: center;
          border: solid rgb(235, 238, 245);
          border-width: 0 1px 1px 1px;

          .list {
            display: flex;
            align-items: center;

            &:first-child div:first-child {
              border-left: none;
            }

            div {
              border-left: 1px solid rgb(235, 238, 245);
              font-size: 14px;
              text-align: center;
              height: 50px;
              line-height: 50px;
            }

            div:first-child {
              font-weight: bold;
              width: 120px;
            }

            div:last-child {
              width: 140px;
            }
          }
        }

        // 检测项目
        .testing-content {
          display: flex;
          align-items: center;
          width: 100%;
          border: solid rgb(235, 238, 245);
          border-width: 0 1px;

          .testing-title {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            width: 120px;
          }

          .testing-table {
            width: 660px;
            border-left: 1px solid rgb(235, 238, 245);
          }

          .table-title {
            display: flex;
            align-items: center;

            div {
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              width: 120px;
              height: 40px;
              line-height: 40px;
            }
          }

          .table-list {
            display: flex;
            align-items: center;

            div {
              font-size: 14px;
              text-align: center;
              width: 120px;
              height: 40px;
              line-height: 40px;
            }
          }
        }

        // 备注
        .backup {
          display: flex;
          align-items: center;
          border: 1px solid rgb(235, 238, 245);

          .list {
            display: flex;
            align-items: center;
            position: relative;

            &::after {
              position: absolute;
              content: "";
              left: 120px;
              top: 0;
              width: 1px;
              height: 100%;
              background-color: rgb(235, 238, 245);
            }

            &:first-child div:first-child {
              border-left: none;
            }

            div:first-child {
              font-size: 14px;
              text-align: center;
              font-weight: bold;
              width: 120px;
              height: 125px;
              line-height: 125px;
            }

            div:last-child {
              font-size: 14px;
              padding: 15px;
              width: 664px;
              text-align: left;
              line-height: 20px;
            }
          }
        }

        // 评分
        .score {
          display: flex;
          align-items: center;
          border: 1px solid rgb(235, 238, 245);

          .list {
            display: flex;
            align-items: center;
            position: relative;

            &::after {
              position: absolute;
              content: "";
              left: 120px;
              top: 0;
              width: 1px;
              height: 100%;
              background-color: rgb(235, 238, 245);
            }

            &:first-child div:first-child {
              border-left: none;
            }

            div:first-child {
              font-size: 14px;
              text-align: center;
              font-weight: bold;
              width: 120px;
              height: 125px;
              line-height: 125px;
            }

            div:last-child {
              color: red;
              font-size: 20px;
              font-weight: bold;
              padding: 15px;
              width: 664px;
              text-align: left;
              line-height: 20px;
            }
          }
        }

        // 审批人员
        .assessing {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: 80px;
          margin-bottom: 40px;

          .list {
            display: flex;
            align-items: center;

            div:first-child {
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              width: 120px;
              height: 50px;
              line-height: 50px;
            }

            div:last-child {
              font-size: 14px;
              text-align: left;
              width: 140px;
              height: 50px;
              line-height: 50px;
              position: relative;
              padding-left: 5px;

              &::after {
                position: absolute;
                bottom: 10px;
                left: 0;
                content: "";
                width: 100%;
                height: 1px;
                background-color: rgba(0, 0, 0, 0.15);
              }
            }
          }
        }
      }

      .btn-download {
        width: 120px;
        height: 32px;
        line-height: 32px;
        border-radius: 2.5px;
        text-align: center;
        font-size: 14px;
        background-color: rgb(24, 144, 255);
        color: #fff;
        cursor: pointer;
        margin: 0 25px;
        position: absolute;
        right: -160px;
        top: 0;

        &:hover {
          transition: all 0.3s;
          background-color: rgb(67, 168, 243);
        }
      }

      .btn-backup {
        width: 80px;
        height: 32px;
        line-height: 32px;
        border-radius: 2.5px;
        text-align: center;
        font-size: 14px;
        background-color: rgb(255, 240, 243);
        color: rgba(0, 0, 0, 0.85);
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.15);
        user-select: none;
        position: absolute;
        right: -230px;
        top: 0;

        &:hover {
          transition: all 0.3s;
          color: rgb(24, 144, 255);
          border: 1px solid rgb(24, 144, 255);
        }
      }
    }
  }
}
</style>
