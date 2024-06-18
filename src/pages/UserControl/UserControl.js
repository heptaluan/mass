import React, { useState, useEffect } from 'react'
import './UserControl.scss'
import { useHistory } from 'react-router-dom'
import { Table, Select, Button, Space, message, Input, DatePicker, InputNumber } from 'antd'
import { getMissionList } from '../../api/api'
import MenuList from '../../components/MenuList/MenuList'
import HeaderList from '../../components/HeaderList/HeaderList'
import BreadcrumbList from '../../components/BreadcrumbList/BreadcrumbList'
import locale from 'antd/es/date-picker/locale/zh_CN'

const UserControl = () => {
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      loginName: 'test01',
      role: '管理员',
      state: '管理员',
      createTime: '2023-10-11',
    },
    {
      key: '1',
      loginName: 'test02',
      role: '普通用户',
      state: '普通用户',
      createTime: '2023-10-11',
    },
  ])

  const doctorColumns = [
    {
      title: '序号',
      dataIndex: 'key',
    },
    {
      title: '登录账号',
      dataIndex: 'loginName',
    },
    {
      title: '角色',
      dataIndex: 'role',
    },
    {
      title: '状态',
      dataIndex: 'state',
    },
    {
      title: '登录账号',
      dataIndex: '状态',
    },
    {
      title: '创建日期',
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
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleShowUserInfo(record)}>查看</a>
          <a onClick={() => handleChangeUserInfo(record)}>修改</a>
          <a onClick={() => handleResetPassWord(record)}>重置密码</a>
          <a onClick={() => handleStopUser(record)}>停用</a>
        </Space>
      ),
    },
  ]

  // 新增用户
  const hancleAddNewUser = () => {}

  // 表格按钮
  const handleShowUserInfo = () => {}

  const handleChangeUserInfo = () => {}

  const handleResetPassWord = () => {}

  const handleStopUser = () => {}

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

  const onDatePickerChange = (date, dateString) => {
    console.log(date, dateString)
  }

  return (
    <div className="user-list-box">
      <MenuList defaultSelectedKeys={'3'} userInfo={userInfo} />
      <div className="user-list-container-wrap">
        <div className="user-list-container">
          <HeaderList />
          <BreadcrumbList val={['首页', '系统管理', '用户管理']} />
          <div className="table-contetn">
            {/* 查询 */}
            <div className="search-box-wrap">
              <div className="search-box">
                <div className="srarch-label">
                  <div>登录账号：</div>
                  <Input
                    value={searchId}
                    onChange={e => handleDoctorIdSearch(e.target.value)}
                    style={{ width: 200, marginLeft: 15 }}
                    placeholder="请输入账号"
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

            <Button style={{ marginBottom: 20 }} onClick={hancleAddNewUser} type="primary">
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

export default UserControl
