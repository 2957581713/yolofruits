import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/login.vue';
import Home from '../views/Home.vue';
import Main from '../views/Main.vue';
import FruitClass from '../views/FruitClass.vue';
import Invocing from '../views/Invocing.vue';
import FruitFreshNess from '../views/FruitFreshNess.vue';
import Facility from '../views/Facility.vue';
import AdminLogin from '../views/admin/login.vue'
import AdminHome from '../views/admin/Home.vue'
import BusinessInfo from '../views/admin/BusinessInfo.vue'
import MemberInfo from '../views/admin/MemberInfo.vue'
import QueryRegistration from '../views/QueryRegistration.vue';
import AuditBusiness from '../views/admin/AuditBusiness.vue';
import DataFruit from '../views/admin/DataFruit.vue';
import BUY from '../views/buy.vue';
import member from '../views/member.vue';
import Caculte from '../views/Caculte.vue';
const routes = [
// admin
  {
    path: '/adminlogin',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/caculte',
    name: 'Caculte',
    component: Caculte
  },
  {
    path: '/member',
    name: 'member',
    component: member
  },
  {
    path: '/buy',
    name: 'BUY',
    component: BUY
  },
  {
    path: '/dataset',
    name: 'DataFruit',
    component: DataFruit
  },
  {
    path: '/adminHome',
    name: 'AdminHome',
    component: AdminHome
  },
  {
    path: '/business',
    name: 'BusinessInfo',
    component: BusinessInfo
  },
  {
    path: '/member',
    name: 'MemberInfo',
    component: MemberInfo
  },
  
  {
    path: '/query-registration',
    name: 'QueryRegistration',
    component: QueryRegistration
  },

  {
    path: '/auditBusiness',
    name: 'AuditBusiness',
    component: AuditBusiness
  },


// s商户
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/fruitclass',
    name: 'FrultClass',
    component: FruitClass
  },
  {
    path: '/fruitFreshNess',
    name: 'FruitFreshNess',
    component: FruitFreshNess
  },
  {
    path: '/facility',
    name: 'Facility',
    component: Facility
  },
  {
    path: '/invocing',
    name: 'Invocing',
    component: Invocing
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path:'/Main',
    name:'Main',
    component: Main
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;