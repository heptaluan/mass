import IndexComponent from '../components/index'
import Login from '../pages/Login/Login'

import PatientList from '../pages/PatientList/PatientList'
import PatientDetail from '../pages/PatientDetail/PatientDetail'

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
    ],
  },
]

export default routes
