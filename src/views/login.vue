<template>
  <div class="login-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <el-card class="login-card">
      <template #header>
        <h1>水果管理系统 - 登录</h1>
      </template>
      <el-form :model="form" :rules="rules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin">登录</el-button>
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

const form = ref({
  username: '',
  password: ''
});

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
});

const router = useRouter();
const loginFormRef = ref(null);
const backgroundImage = ref('/path/to/your/background-image.jpg'); // 替换为你的背景图路径

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate();
  if (valid) {
    try {
      const response = await axios.post(config.backendUrl + '/user/login', {
        username: form.value.username,
        password: form.value.password
      });
      if (response.status === 200) {
        ElMessage.success('登录成功');
        router.push('/home');
      }
    } catch (error) {
      ElMessage.error('登录失败，请检查用户名和密码');
      console.error('登录失败:', error);
    }
  }
};
</script>

<style scoped>
.login-container {
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  background-color: rgba(255, 255, 255, 0.8);
  width: 350px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>