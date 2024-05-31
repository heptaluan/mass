import React, { useState, useEffect } from 'react'
import './PatientDetail.scss'
import { useHistory } from 'react-router-dom'
import { Table, Select, Button, Space, message, Input, DatePicker, InputNumber } from 'antd'
import { getMissionList } from '../../api/api'
import MenuList from '../../components/MenuList/MenuList'
import HeaderList from '../../components/HeaderList/HeaderList'
import BreadcrumbList from '../../components/BreadcrumbList/BreadcrumbList'
import locale from 'antd/es/date-picker/locale/zh_CN'

const PatientDetail = () => {
  const history = useHistory()
  const [userInfo, setUserInfo] = useState('')

  const [isFinish, setIsFinish] = useState(0)
  const [searchId, setSearchId] = useState('')

  const [tableData, setTableData] = useState(['尿酸', '肌酐', '苯丙氨酸', '组氨酸', '精氨酸', '缬氨酸', '亮氨酸', '葡萄糖', '尿素'])

  // 获取列表数据
  const fetchMissionList = async () => {
    const result = await getMissionList(isFinish, searchId)
    if (result.data.code === 200) {
      // setDataSource(result.data.rows)
    } else if (result.data.code === 401) {
      message.warning(`登录已失效，请重新登录`)
      history.push('/login')
    }
  }

  // 初始用户数据
  useEffect(() => {
    const info = localStorage.getItem('info')
    setUserInfo(info)

    // fetchMissionList()
  }, [])

  const onDatePickerChange = (date, dateString) => {
    console.log(date, dateString)
  }

  // 按钮组-返回
  const handleBackUp = () => {
    history.push('/patientList')
  }

  // 按钮组-查看报告
  const handleShowReport = () => {
    history.push('/reportList')
  }

  return (
    <div className="patient-detail-box">
      <MenuList defaultSelectedKeys={'1'} userInfo={userInfo} />
      <div className="patient-detail-container-wrap">
        <div className="patient-detail-container">
          <HeaderList />
          <BreadcrumbList val={['首页', '患者检测与报告', '患者检测详情']} />
          <div className="table-contetn">
            {/* 患者信息 */}
            <div className="sub-title">患者信息</div>

            <div className="search-box-wrap">
              <div className="search-box">
                <div className="srarch-label">
                  <div>姓名：</div>
                  <Input value={searchId} style={{ width: 200, marginLeft: 15 }} placeholder="请输入姓名" />
                </div>

                <div className="srarch-label">
                  <div>患者编号：</div>
                  <Input value={searchId} style={{ width: 200, marginLeft: 15 }} placeholder="请输入患者编号" />
                </div>

                <div className="srarch-label">
                  <div>检测日期：</div>
                  <DatePicker
                    locale={locale}
                    onChange={onDatePickerChange}
                    style={{ width: 200, marginLeft: 15 }}
                    placeholder="请输入检测日期"
                  />
                </div>

                <div className="srarch-label">
                  <div>年龄：</div>
                  <InputNumber value={searchId} style={{ width: 200, marginLeft: 15 }} placeholder="请输入年龄" />
                </div>

                <div className="srarch-label">
                  <div>性别：</div>
                  <Select
                    value={isFinish}
                    style={{ width: 200 }}
                    placeholder="请选择性别"
                    options={[
                      {
                        value: 0,
                        label: '男',
                      },
                      {
                        value: 1,
                        label: '女',
                      },
                    ]}
                  />
                </div>

                <div className="srarch-label">
                  <div>样品状态：</div>
                  <Select
                    value={isFinish}
                    style={{ width: 200 }}
                    placeholder="请选择性别"
                    options={[
                      {
                        value: 0,
                        label: '待检测',
                      },
                      {
                        value: 1,
                        label: '已检测',
                      },
                    ]}
                  />
                </div>

                <div className="srarch-label">
                  <div>备注：</div>
                  <Input value={searchId} style={{ width: 200, marginLeft: 15 }} placeholder="请输入" />
                </div>
              </div>
            </div>

            {/* 检测信息 */}
            <div className="sub-title">检测信息</div>

            <div className="table-content">
              <div className="tible-title">
                <div>检测项目</div>
                <div>待测物质荷比</div>
                <div>内标质荷比</div>
                <div>质量精度(ppm)</div>
                <div>浓度</div>
                <em style={{ width: '30%' }}></em>
              </div>
              <div>
                {tableData?.map((item, index) => (
                  <div key={index} className="table-list">
                    <div>{item}</div>
                    <div>
                      <InputNumber value={searchId} style={{ width: 140 }} placeholder="待测物质荷比" />
                    </div>
                    <div>
                      <InputNumber value={searchId} style={{ width: 140 }} placeholder="内标质荷比" />
                    </div>
                    <div>
                      <InputNumber value={2000} style={{ width: 140 }} placeholder="待测物质荷比" />
                    </div>
                    <div>
                      <InputNumber value={searchId} style={{ width: 90 }} placeholder="浓度" />
                      μmol/L
                    </div>
                    <em style={{ width: '30%' }}></em>
                  </div>
                ))}
              </div>
            </div>

            {/* 结果按钮组 */}
            <div className="table-result">
              <div className="score-box">
                <span>评分</span>
                <span>87.42</span>
              </div>

              <div className="btn-group">
                <div className="btn-upload">文件上传</div>
                <div className="btn-computed">计算</div>
                <div className="btn-report" onClick={handleShowReport}>查看报告</div>
              </div>

              <div className="btn-backup" onClick={handleBackUp}>
                返 回
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDetail
