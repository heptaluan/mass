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
            123
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportList
