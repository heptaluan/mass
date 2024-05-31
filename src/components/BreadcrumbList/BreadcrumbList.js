import React from 'react'
import './BreadcrumbList.scss'
import { Breadcrumb } from 'antd'

const BreadcrumbList = props => {
  return (
    <div className="breadcrumb-box">
      <div className="box-wrap">
        <Breadcrumb>
          <Breadcrumb.Item>{props.val[0]}</Breadcrumb.Item>
          <Breadcrumb.Item>{props.val[1]}</Breadcrumb.Item>
          <Breadcrumb.Item>{props.val[2]}</Breadcrumb.Item>
        </Breadcrumb>
        <div className="current-title">{props.val.length === 3 ? props.val[2] : props.val[1]}</div>
      </div>
    </div>
  )
}

export default BreadcrumbList
