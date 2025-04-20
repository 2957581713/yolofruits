<template>
    <h1>主页</h1>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import config from '../config';
  
  const form = ref({
    username: '',
    password: ''
  });
  

  
  const router = useRouter();
  </script>
  
  <style scoped>
  
  </style>