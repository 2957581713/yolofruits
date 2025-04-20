<template>
<el-container>
  <el-header>Header</el-header>
  <el-main>
  <el-carousel :interval="4000" type="card" height="500px" >
    <el-carousel-item v-for="item in 6" :key="item" >
      <img src="https://luoboot1.oss-cn-hangzhou.aliyuncs.com/a4f21c96-298f-415d-a460-bfc21ab2a288.jpg"/>
    </el-carousel-item>
  </el-carousel>
  <el-button type="primary" @click="gotosystem">进入系统</el-button>
  </el-main>
</el-container>
</template>

<script setup>
import { ElMessage } from 'element-plus';

const showMessage = () => {
  ElMessage.info('你点击了按钮');
};

import { useRouter } from 'vue-router';
const router = useRouter();

const gotosystem = () => {
  // 先检查是否登录，未登录则回到登录页面
    router.push('/Main');
};
</script>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 100px auto;
}
/* 轮播图 */
.el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }
  
  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
/* 轮播图 */


.card-content {
  padding: 20px;
}
.el-header, .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }
.el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 500px;
  }
</style>