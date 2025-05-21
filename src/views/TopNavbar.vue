<template>
    <el-header class="header">
      <div class="logo">
        <img src="https://picsum.photos/100/50" alt="Logo">
      </div>
      <el-menu mode="horizontal" class="menu">
        <el-menu-item index="1">首页</el-menu-item>
        <el-menu-item index="2">产品</el-menu-item>
        <el-menu-item index="3">关于我们</el-menu-item>
        <el-menu-item index="4">联系我们</el-menu-item>
      </el-menu>
      <div class="buttons">
        <el-button type="primary">登录</el-button>
        <el-button type="success">注册</el-button>
      </div>
    </el-header>
  </template>
  
  <script setup>
  // 这里可以添加一些逻辑，比如导航链接的点击事件等
  </script>
  
  <style scoped>
  .header {
    background-color: #333;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  }
  
  .logo img {
    height: 50px;
  }
  
  .menu {
    border-bottom: none;
  }
  
  .buttons {
    display: flex;
    gap: 10px;
  }
  </style>    