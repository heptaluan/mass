import React, { useState, useEffect } from 'react'
import './QualityControl.scss'
import { useHistory } from 'react-router-dom'
import { Table, Select, Button, Space, message, Input, DatePicker, InputNumber } from 'antd'
import { getMissionList } from '../../api/api'
import MenuList from '../../components/MenuList/MenuList'
import HeaderList from '../../components/HeaderList/HeaderList'
import BreadcrumbList from '../../components/BreadcrumbList/BreadcrumbList'
import locale from 'antd/es/date-picker/locale/zh_CN'

const QualityControl = () => {
  const history = useHistory()
  const [userInfo, setUserInfo] = useState('')

  const [isFinish, setIsFinish] = useState(0)
  const [searchId, setSearchId] = useState('')

  const [tableOneData, setTableOneData] = useState([
    {
      id: 1,
      name: '尿酸',
      targetValue: 114,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
    },
    {
      id: 2,
      name: '肌酐',
      targetValue: 224,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
    },
    {
      id: 3,
      name: '苯丙氨酸',
      targetValue: 334,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
    },
    {
      id: 4,
      name: '肌酐',
      targetValue: 224,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
    },
    {
      id: 5,
      name: '苯丙氨酸',
      targetValue: 334,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
    },
  ])

  const [tableTwoData, setTableTwoData] = useState([
    {
      id: 1,
      name: '尿酸',
      targetValue: 114,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
    },
    {
      id: 2,
      name: '肌酐',
      targetValue: 224,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
    },
    {
      id: 3,
      name: '苯丙氨酸',
      targetValue: 334,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
    },
    {
      id: 4,
      name: '苯丙氨酸',
      targetValue: 334,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
    },
    {
      id: 5,
      name: '苯丙氨酸',
      targetValue: 334,
      actualValue: 5.55,
      qualityState: '是',
      time: '2024/05/16 14:45',
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
    <div className="quality-list-box">
      <MenuList defaultSelectedKeys={'2'} userInfo={userInfo} />
      <div className="quality-list-container-wrap">
        <div className="quality-list-container">
          <HeaderList />
          <BreadcrumbList val={['首页', '质控管理']} />
          <div className="quality-contetn">
            {/* 低值质控 */}
            <div className="left-box">
              <div className="sub-title">
                <span>低值质控</span>
                <em>存在失控数据，请检查后重新上传</em>
              </div>

              <div className="table-content">
                <div className="tible-title">
                  <div>检测项目</div>
                  <div>靶值</div>
                  <div>实测值</div>
                  <div>质控状态</div>
                  <div>操作时间</div>
                  <div>选择文件</div>
                </div>
                <div>
                  {tableOneData?.map((item, index) => (
                    <div key={item.id} className="table-list">
                      <div>{item.name}</div>
                      <div>
                        <InputNumber value={item.targetValue} style={{ width: 70 }} disabled /> mmol/L
                      </div>
                      <div>
                        <InputNumber value={item.actualValue} style={{ width: 70 }} disabled /> mmol/L
                      </div>
                      <div>{item.qualityState}</div>
                      <div className="time-box">{item.time}</div>
                      <div className="upload-box">
                        <Button type="primary">文件上传</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="right-box">
              <div className="sub-title">高值质控</div>

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
                  {tableTwoData?.map((item, index) => (
                    <div key={item.id} className="table-list">
                      <div>{item.name}</div>
                      <div>
                        <InputNumber value={item.targetValue} style={{ width: 70 }} disabled /> mmol/L
                      </div>
                      <div>
                        <InputNumber value={item.actualValue} style={{ width: 70 }} disabled /> mmol/L
                      </div>
                      <div>{item.qualityState}</div>
                      <div className="time-box">{item.time}</div>
                      <div className="upload-box">
                        <Button type="primary">文件上传</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QualityControl
