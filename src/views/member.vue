<template>
    <!-- 导航栏 -->
    <el-row class="fruit-nav">
      <el-col :span="3"><div class="nav-item nav-logo">🍓 您的水果管家</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFacility">🍌 设施</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotInvocing">🍎 进销管理</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFruitFresh">🍊 水果健康监控</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="router.push('/caculte')">🍍 健康报告</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoBuy">🍇 销售</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFruitClass">🍉 水果种类</div></el-col>
      <el-col :span="3"><div class="nav-item active">🍋 员工管理</div></el-col>
    </el-row>
  
    <el-row class="action-buttons">
      <el-button type="success" @click="openAddDialog" class="fruit-button">🍒 添加员工</el-button>
      <el-input
        v-model="searchName"
        placeholder="搜索员工姓名"
        style="width: 250px; margin-left: 20px;"
        clearable
        @clear="handleSearchClear"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch" class="fruit-button">🔍</el-button>
        </template>
      </el-input>
    </el-row>
  
    <div class="center-container">
      <el-table
        :data="employeeData"
        align="center"
        class="fruit-table"
        :default-sort="{prop: 'create_time', order: 'descending'}"
      >
        <el-table-column
          type="index"
          label="序号"
          width="80">
        </el-table-column>
        <el-table-column
          prop="username"
          label="用户名"
          sortable
          width="200">
        </el-table-column>
        <el-table-column
          prop="phone"
          label="手机号"
          sortable
          width="200">
        </el-table-column>
        <el-table-column
          prop="statu"
          label="状态"
          sortable
          width="150">
          <template #default="scope">
            <el-tag :type="scope.row.statu === 1 ? 'success' : 'danger'">
              {{ scope.row.statu === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          sortable
          width="250">
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="更新时间"
          sortable
          width="250">
        </el-table-column>
        <el-table-column
          label="操作"
          width="300">
          <template #default="scope">
            <el-button type="warning" @click="openEditDialog(scope.row)" class="fruit-button">🍐 编辑</el-button>
            <el-button 
              type="danger" 
              @click="handleDelete(scope.row)" 
              class="fruit-button"
            >
              🍑 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!--分页工具条-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        class="fruit-pagination"
      />
    </div>
  
    <!-- 添加员工对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加员工"
      width="500"
      :before-close="handleClose"
      class="fruit-dialog"
    >
      <el-form :model="addForm" label-width="120px" :rules="formRules" ref="addFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="初始状态">
          <el-radio-group v-model="addForm.statu">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false" class="fruit-button">取消</el-button>
          <el-button type="primary" @click="handleAddEmployee" class="fruit-button">确认</el-button>
        </div>
      </template>
    </el-dialog>
  
    <!-- 编辑员工对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑员工"
      width="500"
      :before-close="handleClose"
      class="fruit-dialog"
    >
      <el-form :model="editForm" label-width="120px" :rules="formRules" ref="editFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" disabled />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" disabled />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="editForm.password" type="password" placeholder="如需修改密码请填写" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.statu">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false" class="fruit-button">取消</el-button>
          <el-button type="primary" @click="handleEditEmployee" class="fruit-button">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { useRouter } from 'vue-router';
  import axiosInstance from '../axiosInstance';
  import config from '../config';
  
  const router = useRouter();
  
  // 表格数据
  const employeeData = ref([]);
  const searchName = ref('');
  
  // 分页相关
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalCount = ref(0);
  
  // 对话框控制
  const addDialogVisible = ref(false);
  const editDialogVisible = ref(false);
  
  // 表单数据
  const addForm = ref({
    username: '',
    password: '',
    phone: '',
    statu: 1
  });
  
  const editForm = ref({
    id: null,
    username: '',
    phone: '',
    password: '',
    statu: 1
  });
  
  // 表单验证规则
  const formRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 50, message: '长度在 6 到 50 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ]
  };
  
  // 表单引用
  const addFormRef = ref(null);
  const editFormRef = ref(null);
  
  // 获取员工列表
  const fetchEmployeeList = async () => {
    try {
      const response = await axiosInstance.get(config.backendUrl + '/user/getAllByPage', {
        params: {
          name: searchName.value,
          page: currentPage.value,
          pageSize: pageSize.value
        }
      });
      
      if (response.data.success) {
        employeeData.value = response.data.content.data;
        totalCount.value = response.data.content.totalCount;
      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      console.error('获取员工列表失败', error);
      ElMessage.error('获取员工列表失败');
    }
  };
  
  // 分页处理
  const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchEmployeeList();
  };
  
  const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchEmployeeList();
  };
  
  // 搜索处理
  const handleSearch = () => {
    currentPage.value = 1;
    fetchEmployeeList();
  };
  
  const handleSearchClear = () => {
    searchName.value = '';
    currentPage.value = 1;
    fetchEmployeeList();
  };
  
  // 添加员工
  const openAddDialog = () => {
    addForm.value = {
      username: '',
      password: '',
      phone: '',
      statu: 1
    };
    addDialogVisible.value = true;
  };
  
  const handleAddEmployee = async () => {
    try {
      await addFormRef.value.validate();
      
      const response = await axiosInstance.post(config.backendUrl + '/user/add', {
        username: addForm.value.username,
        password: addForm.value.password,
        phone: addForm.value.phone,
        statu: addForm.value.statu
      });
      
      if (response.data.success) {
        ElMessage.success('添加成功');
        addDialogVisible.value = false;
        fetchEmployeeList();
      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      console.error('添加员工失败', error);
      if (error !== 'cancel') {
        ElMessage.error('添加员工失败');
      }
    }
  };
  
  // 编辑员工
  const openEditDialog = (row) => {
    editForm.value = {
      id: row.id,
      username: row.username,
      phone: row.phone,
      password: '',
      statu: row.statu
    };
    editDialogVisible.value = true;
  };
  
  const handleEditEmployee = async () => {
    try {
      await editFormRef.value.validate();
      
      const response = await axiosInstance.post(config.backendUrl + '/user/update', {
        id: editForm.value.id,
        username: editForm.value.username,
        phone: editForm.value.phone,
        password: editForm.value.password || undefined,
        statu: editForm.value.statu
      });
      
      if (response.data.success) {
        ElMessage.success('修改成功');
        editDialogVisible.value = false;
        fetchEmployeeList();
      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      console.error('修改员工信息失败', error);
      if (error !== 'cancel') {
        ElMessage.error('修改员工信息失败');
      }
    }
  };
  
  // 删除员工
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除员工 ${row.username} 吗?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      
      const response = await axiosInstance.post(config.backendUrl + '/user/delete', {
        id: row.id,
        username: row.username,
        phone: row.phone
      });
      
      if (response.data.success) {
        ElMessage.success('删除成功');
        fetchEmployeeList();
      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      console.error('删除员工失败', error);
      if (error !== 'cancel') {
        ElMessage.error('删除员工失败');
      }
    }
  };
  
  // 对话框关闭处理
  const handleClose = (done) => {
    ElMessageBox.confirm('确定要关闭吗？未保存的更改将会丢失', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      done();
    })
    .catch(() => {});
  };
  
  // 导航相关
  const gotoFruitClass = () => {
    router.push('/fruitclass');
  };
  const gotoBuy = () => {
    router.push('/buy');
  };
  const gotoFacility = () => {
    router.push('/facility');
  };
  const gotoFruitFresh = () => {
    router.push('/fruitFreshNess');
  };
  const gotInvocing = () => {
    router.push('/invocing');
  };
  
  // 初始化
  onMounted(() => {
    fetchEmployeeList();
  });
  </script>
  
  <style scoped>
  /* 整体背景 */
  :deep(.el-main) {
    background-color: #fff8f0;
  }
  
  /* 导航栏样式 */
  .fruit-nav {
    background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(255, 154, 158, 0.3);
    margin-bottom: 20px;
    padding: 5px 0;
  }
  
  .nav-item {
    text-align: center;
    padding: 12px 0;
    margin: 0 5px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #5a3e36;
    font-weight: 500;
    background-color: rgba(255, 255, 255, 0.7);
  }
  
  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .nav-logo {
    font-weight: bold;
    color: #e74c3c;
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .active {
    background-color: #ffbe76;
    color: white;
  }
  
  /* 按钮样式 */
  .fruit-button {
    border-radius: 20px;
    padding: 10px 20px;
    margin: 0 10px;
    transition: all 0.3s ease;
    border: none;
    font-weight: 500;
  }
  
  .fruit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .action-buttons {
    margin: 20px 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  
  /* 表格样式 */
  .fruit-table {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .fruit-table :deep(th) {
    background-color: #f8a5c2;
    color: black;
  }
  
  .fruit-table :deep(tr:hover) {
    background-color: #fce4ec !important;
  }
  
  .fruit-table :deep(.el-table__row) {
    transition: all 0.3s ease;
  }
  
  /* 分页样式 */
  .fruit-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  
  .fruit-pagination :deep(.btn-prev),
  .fruit-pagination :deep(.btn-next),
  .fruit-pagination :deep(.number) {
    border-radius: 50% !important;
    margin: 0 5px;
  }
  
  .fruit-pagination :deep(.active) {
    background-color: #f8a5c2 !important;
    color: white !important;
  }
  
  /* 对话框样式 */
  .fruit-dialog :deep(.el-dialog) {
    border-radius: 15px;
    background: linear-gradient(135deg, #f5f7fa 0%, #fff8f0 100%);
  }
  
  .fruit-dialog :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #f8a5c2 0%, #fad0c4 100%);
    border-radius: 15px 15px 0 0;
    color: white;
  }
  
  .fruit-dialog :deep(.el-dialog__title) {
    color: white;
  }
  
  .center-container {
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  /* 响应式调整 */
  @media (max-width: 1200px) {
    .nav-item {
      padding: 10px 0;
      font-size: 14px;
    }
  }
  
  @media (max-width: 992px) {
    .fruit-nav .el-col {
      margin-bottom: 5px;
    }
  }
  </style>