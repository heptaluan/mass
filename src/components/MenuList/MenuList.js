import React from 'react'
import './MenuList.scss'
import { useHistory } from 'react-router-dom'
import { Menu } from 'antd'

const { SubMenu } = Menu

const MenuList = props => {
  const history = useHistory()

  // 菜单切换
  const handleChangeMenu = e => {
    if (e.key === '1') {
      history.push('/patientList')
    } else if (e.key === '2') {
      // history.push('/allotList')
    } else if (e.key === '3') {
      // history.push('/patientList')
    }
  }

  return (
    <div className="meau-box">
      <div className='meau-title'>质谱数据分析软件</div>
      <Menu defaultSelectedKeys={[props.defaultSelectedKeys]} onClick={e => handleChangeMenu(e)}>
        <Menu.Item key="1">患者检测与报告</Menu.Item>
        <Menu.Item key="2">质控管理</Menu.Item>
        <Menu.ItemGroup title="系统设置">
          <Menu.Item key="3">用户管理</Menu.Item>
        </Menu.ItemGroup>
      </Menu>
    </div>
  )
}

export default MenuList
