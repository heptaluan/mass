import IndexComponent from '../components/index'
import Login from '../pages/Login/Login'
import PatientTesting from '../pages/PatientTesting/PatientTesting'

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
        path: '/patientTesting',
        component: PatientTesting,
        routes: [],
      },
    ],
  },
]

export default routes
