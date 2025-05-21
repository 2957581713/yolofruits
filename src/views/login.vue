<template>
  <div class="login-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <el-card class="login-card">
      <template #header>
        <h1>水果管理系统 - {{ isRegister ? '注册' : '登录' }}</h1>
      </template>
      
      <el-form 
        v-if="!isRegister"
        :model="form" 
        :rules="rules" 
        ref="loginFormRef" 
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button type="text" @click="isRegister = true">前往注册</el-button>
          <el-button type="text" @click="goToQueryResult">查询注册结果</el-button>
        </el-form-item>
      </el-form>
      
      <el-form
        v-else
        :model="registerForm"
        :rules="registerRules"
        ref="registerFormRef"
        label-width="120px"
      >
        <el-form-item label="商家名称" prop="businessName">
          <el-input v-model="registerForm.businessName" placeholder="请输入商家名称"></el-input>
        </el-form-item>
        <el-form-item label="订货人姓名" prop="orderPeopleName">
          <el-input v-model="registerForm.orderPeopleName" placeholder="请输入订货人姓名"></el-input>
        </el-form-item>
        <el-form-item label="订货人电话" prop="orderPeoplePhone">
          <el-input v-model="registerForm.orderPeoplePhone" placeholder="请输入订货人电话"></el-input>
        </el-form-item>
        <el-form-item label="注册码" prop="registrationCode">
          <el-input v-model="registerForm.registrationCode" placeholder="请输入注册码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister">提交注册</el-button>
          <el-button type="text" @click="isRegister = false">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import config from '../config';
import { ElMessage } from 'element-plus';

// 数据定义
const form = ref({
  username: '',
  password: ''
});

const registerForm = ref({
  businessName: '',
  orderPeopleName: '',
  orderPeoplePhone: '',
  registrationCode: ''
});

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
});

const registerRules = ref({
  businessName: [
    { required: true, message: '请输入商家名称', trigger: 'blur' }
  ],
  orderPeopleName: [
    { required: true, message: '请输入订货人姓名', trigger: 'blur' }
  ],
  orderPeoplePhone: [
    { required: true, message: '请输入订货人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  registrationCode: [
    { required: true, message: '请输入注册码', trigger: 'blur' }
  ]
});

// 状态管理
const isRegister = ref(false);
const router = useRouter();
const loginFormRef = ref(null);
const registerFormRef = ref(null);

// 视觉资源（建议替换为自己的水果主题图片）
const backgroundImage = ref('https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80');

// 方法定义
const handleLogin = async () => {
  
  const valid = await loginFormRef.value.validate();
  if (valid) {
    try {
      const response = await axios.post(config.backendUrl + '/user/login', {
        username: form.value.username,
        password: form.value.password
      });
      if (response.status === 200) {
        if(!response.data.success){
          ElMessage.error(response.data.message);
        }
        else{
          ElMessage.success('登录成功');
          localStorage.setItem("token",response.data.content);
          router.push('/buy');
        }
      }
    } catch (error) {
      ElMessage.error('网络连接失败');
      console.error('登录失败:', error);
    }
  }
};

const handleRegister = async () => {
  const valid = await registerFormRef.value.validate();
  if (valid) {
    try {
      const response = await axios.post(config.adminUrl + '/admin/registerBusiness', {
        businessName: registerForm.value.businessName,
        orderPeopleName: registerForm.value.orderPeopleName,
        orderPeoplePhone: registerForm.value.orderPeoplePhone,
        registrationCode: registerForm.value.registrationCode
      });
      
      if (response.data.success) {
        ElMessage.success('注册已提交，请等待管理员审核');
        isRegister.value = false;
      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      ElMessage.error('网络连接失败');
      console.error('注册失败:', error);
    }
  }
};

const goToQueryResult = () => {
  router.push('/query-registration');
};
</script>

<style scoped>
/* 水果主题变量 */
:root {
  --fruit-primary: #FF7B54;  /* 主色调-橙红(类似柑橘) */
  --fruit-secondary: #6ECB63; /* 辅助色-青绿(类似青苹果) */
  --fruit-light: #FFF5E4;     /* 浅色背景(类似果肉) */
  --fruit-dark: #4A403A;      /* 深色文字 */
  --fruit-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-container {
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(2px);
}

.login-card {
  background-color: var(--fruit-light);
  width: 480px;
  border-radius: 16px;
  box-shadow: var(--fruit-shadow);
  position: relative;
  z-index: 1;
  border: none;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
}

.login-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, var(--fruit-primary), var(--fruit-secondary));
}

.login-card h1 {
  text-align: center;
  margin: 20px 0;
  font-size: 24px;
  color: var(--fruit-primary);
  font-weight: 600;
  letter-spacing: 1px;
}

/* 表单元素美化 */
.el-form {
  padding: 0 20px 20px;
}

.el-form-item__label {
  color: var(--fruit-dark) !important;
  font-weight: 500;
}

.el-input {
  border-radius: 8px !important;
}

.el-input__wrapper {
  background-color: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) !important;
  transition: box-shadow 0.3s;
}

.el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--fruit-secondary) !important;
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--fruit-primary) !important;
}

/* 按钮组样式 */
.el-form-item__content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.el-button--primary {
  background-color: var(--fruit-primary) !important;
  border-color: var(--fruit-primary) !important;
  border-radius: 8px !important;
  padding: 10px 20px !important;
  transition: all 0.3s;
  flex: 1;
}

.el-button--primary:hover {
  background-color: #FF6B3D !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 123, 84, 0.3);
}

.el-button--text {
  color: var(--fruit-secondary) !important;
  padding: 8px 12px !important;
  margin-left: 0 !important;
}

.el-button--text:hover {
  color: #5ABD50 !important;
  text-decoration: underline;
  background: transparent !important;
}

/* 注册表单适配 */
.el-form--label-top .el-form-item__label {
  padding-bottom: 6px !important;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .login-card {
    width: 90%;
    margin: 0 auto;
  }
  
  .el-form-item__content {
    flex-direction: column;
  }
  
  .el-button {
    width: 100%;
  }
}
</style>