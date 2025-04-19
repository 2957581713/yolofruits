<template>
  <div class="login-container">
    <h1>登录</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="username" type="text" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import config from '../config'

const username = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    const response = await axios.post(config.backendUrl+'/user/login', {
      username: username.value,
      password: password.value
    });
    if (response.status === 200) {
      router.push('/home');
    }
  } catch (error) {
    console.error('登录失败:', error);
  }
};
</script>

<style scoped>
.login-container {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>    