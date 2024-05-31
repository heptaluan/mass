import React, { useState, useEffect, useRef } from 'react'
import './Login.scss'
import { useHistory } from 'react-router-dom'
import { LockOutlined, UserOutlined, BellOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import { getCodeImg, userLogin, getInfo } from '../../api/api'

const Login = () => {
  const history = useHistory()

  const formRef = useRef()

  const fetchCodeImg = async () => {
    const result = await getCodeImg()
    // if (result.data.code === 200 && result.data.img) {
    //   setImgSrc('data:image/gif;base64,' + result.data.img)
    //   setUuid(result.data.uuid)
    // }
  }

  useEffect(() => {
    // formRef.current.setFieldsValue({ username: '121212' })
  })

  // useEffect(() => {
  //   handleClearLocalStorage()
  //   fetchCodeImg()
  // }, [])

  const onFinish = async values => {
    history.push(`/patientList`)

    // const params = {
    //   uuid: uuid,
    //   ...values,
    // }
    // const result = await userLogin(params)
    // if (result.data.code === 500) {
    //   message.warning(result.data.msg)
    //   fetchCodeImg()
    // } else if (result.data.code === 200) {
    //   localStorage.setItem('token', result.data.token)
    //   const info = await getInfo()
    //   if (info.data.code === 200) {
    //     localStorage.setItem('info', info.data.roles[0])
    //     localStorage.setItem('username', info.data.user.nickName)
    //     message.success(`登录成功`)
    //     history.push(`/sixBenignList`)
    //   } else if (info.data.code === 500) {
    //     handleClearLocalStorage()
    //     message.warning(`获取用户角色失败，请重新登录`)
    //     fetchCodeImg()
    //   }
    // }
  }

  const handleChangeImg = async () => {
    fetchCodeImg()
  }

  // 登录的时候清空暂存数据
  const handleClearLocalStorage = () => {
    localStorage.setItem('token', '')
    localStorage.setItem('info', '')
  }

  return (
    <div className="login-box-wrap">
      <div className="login-box">
        <div className="login-container">
          <div className='login-title'>账号密码登录</div>
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            ref={formRef}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: '请输入账号',
                },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                placeholder="请输入账号"
                autoComplete='new-user'
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: '请输入密码',
                },
              ]}
            >
              <Input
                size="large"
                prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                type="password"
                placeholder="请输入密码"
                autoComplete='new-password'
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <div className='remember-box'>
                <Checkbox>自动登录</Checkbox>
                <a href="javascript:;">忘记密码</a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button size="large" type="primary" htmlType="submit" className="login-form-button">
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className='login-tips'>Copyright © 2023 <a href="javascript:;">泰莱生物科技</a></div>
        </div>
      </div>
    </div>
  )
}

export default Login
