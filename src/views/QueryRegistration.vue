<template>
    <div class="query-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
      <el-card class="query-card">
        <template #header>
          <h1>水果管理系统 - 注册结果查询</h1>
        </template>
        
        <el-form 
          :model="queryForm"
          :rules="queryRules"
          ref="queryFormRef"
          label-width="120px"
        >
          <el-form-item label="商家名称" prop="businessName">
            <el-input v-model="queryForm.businessName" placeholder="请输入商家名称"></el-input>
          </el-form-item>
          <el-form-item label="订货人电话" prop="orderPeoplePhone">
            <el-input v-model="queryForm.orderPeoplePhone" placeholder="请输入订货人电话"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="goBack">返回登录</el-button>
          </el-form-item>
        </el-form>
        
        <el-card v-if="queryResult" class="result-card">
          <template #header>
            <h2>注册状态查询结果</h2>
          </template>
          <div v-if="queryResult.success">
            <p><strong>商家名称：</strong>{{ queryResult.content.businessName }}</p>
            <p><strong>联系人姓名：</strong>{{ queryResult.content.orderPeopleName }}</p>
            <p><strong>注册状态：</strong>
              <el-tag :type="getStatusTagType(queryResult.content.status)">
                {{ getStatusText(queryResult.content.status) }}
              </el-tag>
            </p>
            <p v-if="queryResult.content.auditResult"><strong>拒绝原因：</strong>{{ queryResult.content.auditResult }}</p>
            <p><strong>注册时间：</strong>{{ formatTime(queryResult.content.createTime) }}</p>
            <p v-if="queryResult.content.auditTime"><strong>审核时间：</strong>{{ formatTime(queryResult.content.auditTime) }}</p>
            <p v-if="queryResult.content.auditPeopleName"><strong>审核人：</strong>{{ queryResult.content.auditPeopleName }}</p>
            <p><strong>注册码：</strong>{{ queryResult.content.registrationCode }}</p>
          </div>
          <div v-else>
            <p>{{ queryResult.message }}</p>
          </div>
        </el-card>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import config from '../config';
  import { ElMessage } from 'element-plus';
  
  const router = useRouter();
  const queryForm = ref({
    businessName: '',
    orderPeoplePhone: ''
  });
  
  const queryRules = ref({
    businessName: [
      { required: true, message: '请输入商家名称', trigger: 'blur' }
    ],
    orderPeoplePhone: [
      { required: true, message: '请输入订货人电话', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
  });
  
  const queryResult = ref(null);
  const queryFormRef = ref(null);
  const backgroundImage = ref('/path/to/your/background-image.jpg');
  
  const getStatusText = (status) => {
    const statusMap = {
      0: '待审核',
      1: '已通过',
      2: '已拒绝'
    };
    return statusMap[status] || '未知状态';
  };
  
  const getStatusTagType = (status) => {
    const typeMap = {
      0: 'warning',
      1: 'success',
      2: 'danger'
    };
    return typeMap[status] || 'info';
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '暂无';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const handleQuery = async () => {
    const valid = await queryFormRef.value.validate();
    
    if (valid) {
      try {
        const response = await axios.get(config.adminUrl + '/admin/query-registration?businessName=' + queryForm.value.businessName + '&orderPeoplePhone=' + queryForm.value.orderPeoplePhone);
        
        queryResult.value = response.data;
        console.log(queryResult.value.content);
        if (!response.data.success) {
          ElMessage.error(response.data.message || '查询失败');
        }
      } catch (error) {
        ElMessage.error('网络连接失败');
        console.error('查询失败:', error);
      }
    }
  };
  
  const goBack = () => {
    router.push('/login');
  };
  </script>
  
  <style scoped>
  .query-container {
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  .query-card {
    background-color: rgba(255, 255, 255, 0.8);
    width: 500px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }
  
  .query-card h1 {
    text-align: center;
    margin: 0;
    font-size: 20px;
  }
  
  .result-card {
    margin-top: 20px;
  }
  
  .result-card h2 {
    font-size: 16px;
    margin: 0;
  }
  
  .result-card p {
    margin: 10px 0;
  }
  </style>