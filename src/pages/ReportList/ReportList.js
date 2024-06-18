import React, { useState, useEffect } from 'react'
import './ReportList.scss'
import { useHistory } from 'react-router-dom'
import { Table, Select, Button, Space, message, Input, DatePicker, InputNumber } from 'antd'
import { getMissionList } from '../../api/api'
import MenuList from '../../components/MenuList/MenuList'
import HeaderList from '../../components/HeaderList/HeaderList'
import BreadcrumbList from '../../components/BreadcrumbList/BreadcrumbList'
import locale from 'antd/es/date-picker/locale/zh_CN'

const ReportList = () => {
  const history = useHistory()
  const [userInfo, setUserInfo] = useState('')

  const [isFinish, setIsFinish] = useState(0)
  const [searchId, setSearchId] = useState('')

  const [testingData, setTestingData] = useState([
    {
      name: '尿酸',
      measuredValue: '256μmol/L',
      range: '150-416μmol/L',
    },
    {
      name: '尿酸',
      measuredValue: '256μmol/L',
      range: '150-416μmol/L',
    },
    {
      name: '尿酸',
      measuredValue: '256μmol/L',
      range: '150-416μmol/L',
    },
    {
      name: '尿酸',
      measuredValue: '256μmol/L',
      range: '150-416μmol/L',
    },
    {
      name: '尿酸',
      measuredValue: '256μmol/L',
      range: '150-416μmol/L',
    },
    {
      name: '尿酸',
      measuredValue: '256μmol/L',
      range: '150-416μmol/L',
    },
  ])

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

  // 按钮组
  const handleBackUp = () => {
    history.push('/patientList')
  }

  return (
    <div className="report-list-box">
      <MenuList defaultSelectedKeys={'1'} userInfo={userInfo} />
      <div className="report-list-container-wrap">
        <div className="report-list-container">
          <HeaderList />
          <BreadcrumbList val={['首页', '患者检测与报告', '患者检测报告']} />
          <div className="report-contetn">
            <div className="report-box">
              <div className="report-title">检 测 报 告</div>

              <div className="report-code">
                <div>报告编号：</div>
                <div>A2023004328</div>
              </div>

              <div className="user-info">
                <div className="list">
                  <div>患者姓名</div>
                  <div>王建强</div>
                </div>
                <div className="list">
                  <div>性别</div>
                  <div>男</div>
                </div>
                <div className="list">
                  <div>年龄</div>
                  <div>51</div>
                </div>
              </div>

              <div className="patient-code">
                <div className="list">
                  <div>患者编号</div>
                  <div>王建强</div>
                </div>
                <div className="list">
                  <div>检测日期</div>
                  <div>2023-10-11</div>
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

                  {testingData?.map((item, index) => (
                    <div key={index} className="table-list">
                      <div>{item.name}</div>
                      <div>{item.measuredValue}</div>
                      <div>{item.range}</div>
                      <div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="backup">
                <div className="list">
                  <div>备注</div>
                  <div>123</div>
                </div>
              </div>

              <div className="score">
                <div className="list">
                  <div>评分</div>
                  <div>87.45</div>
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

              <div className="btn-download">下载电子版本</div>
              <div className="btn-backup" onClick={() => history.push('/patientDetail')}>
                返回
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportList
