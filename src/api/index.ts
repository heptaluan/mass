import useAxiosApi from "@/utils/apiTools/useAxiosApi";
import qs from "qs";

/**
 * 账号密码登录
 * @returns UseAxiosReturn
 */
export function loginPassword(params: any) {
  return normalAPIFormat(`/sys-user/login`, params, "POST");
}
export function logout() {
  return normalAPIFormat(
    `/sys-user/logout`,
    null,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

// ========================================

// ========================================

// 病患信息按条件查询列表
export function getPatientList(params: any) {
  return normalAPIFormat(`/ms-patient/findBySearchDTO`, params, "POST");
}

// 新增患者信息详情
export function addPatientList(params: any) {
  return normalAPIFormat(`/ms-patient/createPatient`, params, "POST");
}

// 查询检测信息详情
export function getPatientDetail(params: any) {
  return normalAPIFormat(
    `/ms-patient/getDetailById`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

// 查询附件列表
export function queryAppendixList(params: any) {
  return normalAPIFormat(`/sys-appendix/queryAppendixList`, params, "POST");
}

// 清空附件列表
export function removeAppendixList(params: any) {
  return normalAPIFormat(`/sys-appendix/removeAppendixByRefId`, params, "POST");
}

// 文件上传
export function uploadAppendixList(params: any) {
  return normalAPIFormat(
    `/sys-appendix/uploadFile`,
    params,
    "POST",
    "multipart/form-data"
  );
}

// 质控列表
export function getQCList(params: any) {
  return normalAPIFormat(`/ms-quality-control/list`, params, "POST");
}

// 字典查询
export function getItemMap(params: any) {
  return normalAPIFormat(
    `/sys-dict-item/getItemMapByType/noLogin`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

// ========================================

// ========================================

export function addNodule(params: any) {
  return normalAPIFormat(`/aivd-nodule/insert`, params, "POST");
}
export function patientCheckList(params: any) {
  return normalAPIFormat(`/aivd-dicom-study/patientCheckList`, params, "POST");
}
export function getUploadFileList(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-archive-task/uploadFileList`,
    params,
    "POST"
  );
}
export function findFromPACS(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-study/findFromPACSByKeyword`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function syncFromPACS(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-study/syncFromPACS`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function keepUpToDate(params: any) {
  return normalAPIFormat(`/aivd-dicom-study/keepUpToDate`, params, "POST");
}
export function getAnalysisResult(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-archive-task/getAnalysisResult`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function restoreDicomByStudyUid(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-study/restoreDicomByStudyUid`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function queryAllByStudyUid(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-series/queryAllByStudyUid`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function getSelectionsByType() {
  return normalAPIFormat(
    `/sys-dict-item/getAllItemsList`,
    null,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function getBySeriesUid(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-series/getBySeriesUid`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function findNoduleBySeriesUId(params: any) {
  return normalAPIFormat(
    `/aivd-nodule/findBySeriesUId`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function deleteNodule(params: any) {
  return normalAPIFormat(
    `/aivd-nodule/delete`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function updateNodule(params: any) {
  return normalAPIFormat(`/aivd-nodule/update`, params, "POST");
}

// upload ZIP file
export function uploadFile(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-archive-task/uploadFile`,
    params,
    "POST",
    "multipart/form-data"
  );
}
export function checkMd5(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-archive-task/checkMd5`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function getTaskInfo(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-archive-task/getTaskInfo`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function initTask(params: any) {
  return normalAPIFormat(`/aivd-dicom-archive-task/initTask`, params, "POST");
}
export function preSignUploadUrl(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-archive-task/preSignUploadUrl`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function mergeFile(params: any) {
  return normalAPIFormat(
    `/aivd-dicom-archive-task/merge`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

// --- Configuration APIs ---
// Department
export function getDeptTree(params: any) {
  return normalAPIFormat(
    `/sys-dept/getDeptTree`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function findCurrentDepartment(params: any) {
  return normalAPIFormat(
    `/sys-dept/findByParentId`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function saveDept(params: any) {
  return normalAPIFormat(`/sys-dept/saveDept`, params, "POST");
}
export function deleteDept(params: any) {
  return normalAPIFormat(
    `/sys-dept/delete`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function getParentIds(params: any) {
  return normalAPIFormat(
    `/sys-dept/getParentIds`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

// User

export function getUserList(params: any) {
  return normalAPIFormat(`/sys-user/list`, params, "POST");
}
export function saveUser(params: any) {
  return normalAPIFormat(`/sys-user/saveUser`, params, "POST");
}
export function getRoleList() {
  return normalAPIFormat(
    `/sys-role/queryAllRoles`,
    null,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

export function switchStatus(params: any) {
  return normalAPIFormat(
    `/sys-user/switchStatus`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

export function resetPassword(params: any) {
  return normalAPIFormat(
    `/sys-user/resetPassword`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

export function importUsers(params: any) {
  return normalAPIFormat(
    `/sys-user/importUsers`,
    params,
    "POST",
    "multipart/form-data"
  );
}

// 按id查询用户信息
export function findUserById(params: any) {
  return normalAPIFormat(
    `/sys-user/findUserById`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

// 修改密码
export function changePassword(params: any) {
  return normalAPIFormat(`/sys-user/changePassword`, params, "POST");
}

// parameters

export function getAllCtParam() {
  return normalAPIFormat(
    `/sys-param-ct/getAllCtParam`,
    null,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

export function parametersSave(params: any) {
  return normalAPIFormat(`/sys-param-ct/save`, params, "POST");
}

export function parametersDelete(params: any) {
  return normalAPIFormat(
    `/sys-param-ct/delete`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function setParametersDefault(params: any) {
  return normalAPIFormat(
    `/sys-param-ct/setDefault`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}

// deepLearning

export function getAiServer() {
  return normalAPIFormat(
    `/sys-config/getAiServer`,
    null,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function setAiServer(params: any) {
  return normalAPIFormat(`/sys-config/setAiServer`, params, "POST");
}
// pacs

export function getPACSServer() {
  return normalAPIFormat(
    `/sys-config/getPACSServer`,
    null,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function setPACSServer(params: any) {
  return normalAPIFormat(`/sys-config/setPACSServer`, params, "POST");
}

// file store

export function getFileStorage() {
  return normalAPIFormat(
    `/sys-config/getFileStorage`,
    null,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function setFileStorage(params: any) {
  return normalAPIFormat(`/sys-config/setFileStorage`, params, "POST");
}

// safe

export function getNetworkSecurity(params: any) {
  return normalAPIFormat(
    `/sys-config/getNetworkSecurity`,
    null,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
export function setNetworkSecurity(params: any) {
  return normalAPIFormat(`/sys-config/setNetworkSecurity`, params, "POST");
}
export function saveWhiteList(params: any) {
  return normalAPIFormat(`/sys-config/saveWhiteList`, params, "POST");
}
export function deleteWhiteList(params: any) {
  return normalAPIFormat(
    `/sys-config/deleteWhiteList`,
    params,
    "POST",
    "application/x-www-form-urlencoded"
  );
}
// log
export function logSearch(params: any) {
  return normalAPIFormat(`/sys-log/findByCondition`, params, "POST");
}

// 融合计算
export function calculate(params: any) {
  return normalAPIFormat(`/aivd-fusion-task/calculate`, params, "POST");
}

export function getCheckPointsTest() {
  return useAxiosApi(`/checkpoint`, { method: "GET" });
}

export function getVaildateImage(params: any) {
  return useAxiosApi(`/sys-user/randomImage/` + params, {
    method: "GET",
  });
}

// 授权
export function getLicense() {
  return normalAPIFormat(`/sys-config/getLicenseApplication`, null, "POST");
}
export function getCertificationStatus() {
  return normalAPIFormat(`//sys-config/getCertificationStatusCn`, null, "POST");
}
export function uploadAuthorization(params: any) {
  return normalAPIFormat(
    `/sys-config/uploadLicenseCertification`,
    params,
    "POST",
    "multipart/form-data"
  );
}

// 获取软件版本号
export function getVersion(params: any) {
  return normalAPIFormat(`/sys-config/getVersion`, params, "POST");
}

export function sendSMSVerificationCode(params: any) {
  const smsParams = {
    mobile: params.mobile,
  };
  return normalAPIFormat(
    `/tailai-cloud-system/sys-user/sendSMSVerificationCode`,
    smsParams,
    "POST",
    "application/json"
  );
}

function normalAPIFormat(url: any, params: any, method: any, type?: any) {
  if (url === "/aivd-fusion-task/calculate") {
    return useAxiosApi(url, {
      method: method,
      data:
        type && type !== "multipart/form-data" ? qs.stringify(params) : params,
      headers: {
        "Content-Type": type ? type : "application/json",
      },
      timeout: 300000,
    });
  } else {
    return useAxiosApi(url, {
      method: method,
      data:
        type && type !== "multipart/form-data" ? qs.stringify(params) : params,
      headers: {
        "Content-Type": type ? type : "application/json",
      },
      timeout:
        type === "multipart/form-data" ||
        url === "/aivd-dicom-study/findFromPACSByKeyword"
          ? 100000
          : 5000,
    });
  }
}
