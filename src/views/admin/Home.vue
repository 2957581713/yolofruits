<template>
    <el-container>
      <el-header>Header</el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu
            :default-active="activeIndex"
            class="el-menu-vertical"
            @select="handleSelect"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
          >
            <el-menu-item index="1">
              <span>商户信息</span>
            </el-menu-item>
            <el-menu-item index="2">
              <span>员工信息</span>
            </el-menu-item>
            <el-menu-item index="3">
              <span>数据集管理</span>
            </el-menu-item>
            <el-menu-item index="4">
              <span>数据集</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { ElMessage } from 'element-plus';
  
  const activeIndex = ref('1');
  
  const handleSelect = (index) => {
    activeIndex.value = index;
    ElMessage.info(`你点击了导航 ${index}`);
  };
  
  const showMessage = () => {
    ElMessage.info('你点击了按钮');
  };
  
  import { useRouter } from 'vue-router';
  const router = useRouter();
  </script>
  
  <style scoped>
  .home-container {
    max-width: 600px;
    margin: 100px auto;
  }
  
  .el-header, .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }
  
  .el-aside {
    background-color: #545c64;
    color: #fff;
  }
  
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 500px;
  }
  
  .el-menu-vertical {
    border-right: none;
  }
  
  .el-menu-item.is-active {
    background-color: #434a50 !important;
  }
  </style>