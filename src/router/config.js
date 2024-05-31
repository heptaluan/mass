import IndexComponent from '../components/index'
import Login from '../pages/Login/Login'

import PatientList from '../pages/PatientList/PatientList'
import PatientDetail from '../pages/PatientDetail/PatientDetail'
import ReportList from '../pages/ReportList/ReportList'
import QualityControl from '../pages/QualityControl/QualityControl'
import UserControl from '../pages/UserControl/UserControl'

const routes = [
  {
    path: '/',
    component: IndexComponent,
    routes: [
      {
        path: '/login',
        component: Login,
        routes: [],
      },
      {
        path: '/patientList',
        component: PatientList,
        routes: [],
      },
      {
        path: '/patientDetail',
        component: PatientDetail,
        routes: [],
      },
      {
        path: '/reportList',
        component: ReportList,
        routes: [],
      },
      {
        path: '/qualityControl',
        component: QualityControl,
        routes: [],
      },
      {
        path: '/userControl',
        component: UserControl,
        routes: [],
      },
    ],
  },
]

export default routes
