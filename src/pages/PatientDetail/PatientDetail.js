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
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      name: '胡彦斌',
      sex: '1',
      age: 32,
      code: 'B202310110435',
      createTime: '2023-10-11',
      state: '1',
      backup: '1212121'
    },
    {
      key: '2',
      name: '吴彦祖',
      sex: '1',
      age: 22,
      code: 'B2023134640435',
      createTime: '2023-09-11',
      state: '0',
      backup: '33333'
    },
  ])

  const doctorColumns = [
    {
      title: '序号',
      dataIndex: 'key',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      render: (_, record) => {
        return record.sex === '1' ? '男' : '女'
      },
    },
    {
      title: '年龄',
      dataIndex: 'age',
    },
    {
      title: '患者编号',
      dataIndex: 'code',
    },
    {
      title: '检测日期',
      dataIndex: 'createTime',
      defaultSortOrder: 'descend',
      sorter: (a, b) => {
        const t1 = new Date(a.createTime).getTime()
        const t2 = new Date(b.createTime).getTime()
        return t1 - t2
      },
      createTime: ['descend', 'ascend'],
      showSorterTooltip: false,
    },
    {
      title: '样品状态',
      dataIndex: 'state',
      render: (_, record) => {
        return record.state === '1' ? '已检测' : '未检测'
      },
    },
    {
      title: '备注',
      dataIndex: 'backup',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleShowDetectionInfo(record)}>查看检测信息</a>
          <a onClick={() => handleShowReport(record)}>查看报告</a>
        </Space>
      ),
    },
  ]

  const history = useHistory()
  const [userInfo, setUserInfo] = useState('')

  const initPagination = result => {
    let page = localStorage.getItem('MissionList') ? JSON.parse(localStorage.getItem('MissionList')) : ''
    const newPagination = Object.assign({}, pagination)
    if (page) {
      newPagination.current = page.current
      newPagination.pageSize = page.pageSize
      newPagination.total = page.total
    } else {
      newPagination.current = 1
      newPagination.pageSize = 10
      newPagination.total = result.data.rows.length
    }

    if (result.data.rows.length === 0) {
      newPagination.current = 1
      newPagination.pageSize = 10
      newPagination.total = 0
    }
    setPagination(newPagination)
  }

  // 获取列表数据
  const fetchMissionList = async () => {
    const result = await getMissionList(isFinish, searchId)
    if (result.data.code === 200) {
      setDataSource(result.data.rows)
      initPagination(result)
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

  // 分页设置
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const onPageChange = e => {
    const newPagination = Object.assign({}, pagination)
    newPagination.current = e.current
    newPagination.pageSize = e.pageSize
    newPagination.total = e.total
    localStorage.setItem('MissionList', JSON.stringify(newPagination))
    setPagination(newPagination)
  }

  // 查询
  const [isFinish, setIsFinish] = useState(0)
  const [searchId, setSearchId] = useState('')

  const handleIsFinishSearch = val => {
    setIsFinish(val)
  }

  const handleDoctorIdSearch = val => {
    setSearchId(val)
  }

  const handleSearch = () => {
    localStorage.setItem('MissionList', '')
    fetchMissionList()
  }

  const handleReset = async () => {
    const isFinish = 0
    setIsFinish(isFinish)
    setSearchId('')
    localStorage.setItem('MissionList', '')
    const result = await getMissionList(isFinish, '')
    if (result.data.code === 200) {
      setDataSource([])
      setDataSource(result.data.rows)
      initPagination(result)
    } else if (result.data.code === 401) {
      message.warning(`登录已失效，请重新登录`)
      history.push('/login')
    }
  }

  // 查看检测信息
  const handleShowDetectionInfo = record => {
    console.log(1111);
    history.push('/detectionInfo')
  }

  // 查看报告
  const handleShowReport = record => {
    console.log(1111);
    history.push('/detectionInfo')
  }

  const onDatePickerChange = (date, dateString) => {
    console.log(date, dateString)
  }

  return (
    <div className="patient-list-box">
      <MenuList defaultSelectedKeys={'1'} userInfo={userInfo} />
      <div className="patient-list-container-wrap">
        <div className="patient-list-container">
          <HeaderList />
          <BreadcrumbList val={['首页', '患者检测与报告', '患者检测详情']} />
          <div className="table-contetn">
            {/* 查询 */}
            <div className="search-box-wrap">
              <div className="search-box">
                <div className="srarch-label">
                  <div>姓名：</div>
                  <Input
                    value={searchId}
                    onChange={e => handleDoctorIdSearch(e.target.value)}
                    style={{ width: 200, marginLeft: 15 }}
                    placeholder="请输入姓名"
                  />
                </div>

                <div className="srarch-label">
                  <div>患者编号：</div>
                  <Input
                    value={searchId}
                    onChange={e => handleDoctorIdSearch(e.target.value)}
                    style={{ width: 200, marginLeft: 15 }}
                    placeholder="请输入患者编号"
                  />
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
                  <InputNumber
                    value={searchId}
                    onChange={e => handleDoctorIdSearch(e.target.value)}
                    style={{ width: 200, marginLeft: 15 }}
                    placeholder="请输入年龄"
                  />
                </div>

                <div className="srarch-label">
                  <div>性别：</div>
                  <Select
                    value={isFinish}
                    style={{ width: 200 }}
                    onChange={handleIsFinishSearch}
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
                    onChange={handleIsFinishSearch}
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

                <Button style={{ marginLeft: 20 }} onClick={handleSearch} type="primary">
                  查询
                </Button>
                <Button onClick={handleReset} style={{ marginLeft: 15 }}>
                  重置
                </Button>
              </div>
            </div>

            <Button style={{ marginBottom: 20 }} onClick={handleSearch} type="primary">
              新增检测信息
            </Button>

            <Table
              scroll={{ x: 'max-content' }}
              onChange={onPageChange}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
              }}
              dataSource={dataSource}
              columns={doctorColumns}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDetail
