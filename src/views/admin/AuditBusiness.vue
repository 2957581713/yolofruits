<template>
  <el-container>
    <el-header>商户管理系统</el-header>
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
          <el-menu-item index="1" @click="router.push('/business')">
            <span>商户信息</span>
          </el-menu-item>
        
          <el-menu-item index="2" @click="router.push('/auditBusiness')">
            <span>商户信息审核</span>
          </el-menu-item>
          <el-menu-item index="3" @click="router.push('/dataset')">
            <span>数据集管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <el-card>
          <div class="header">
            <el-button type="primary" @click="fetchPendingRegistrations">审核商户申请</el-button>
            <el-button type="primary" @click="fetchData">已审核审核商户</el-button>
            <el-input
              v-model="searchParams.business_name"
              placeholder="搜索商户名称"
              style="width: 240px; margin-left: 10px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- 待审核商户表格 -->
          <el-table 
            v-if="showPendingTable"
            :data="pendingTableData" 
            border 
            style="width: 100%" 
            v-loading="loading"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="businessName" label="商户名称" />
            <el-table-column prop="orderPeopleName" label="联系人" />
            <el-table-column prop="orderPeoplePhone" label="联系电话" />
            <el-table-column prop="registrationCode" label="注册码" />
            <el-table-column prop="createTime" label="申请时间" width="180">
              <template #default="{row}">
                {{ formatTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{row}">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button size="small" type="success" @click="handleApprove(row.id)">通过</el-button>
                <el-button size="small" type="danger" @click="showRejectDialog(row.id)">拒绝</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 已审核商户表格 -->
          <el-table 
            v-else
            :data="tableData" 
            border 
            style="width: 100%" 
            v-loading="loading"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="businessName" label="商户名称" />
            <el-table-column prop="orderPeopleName" label="联系人" />
            <el-table-column prop="orderPeoplePhone" label="联系电话" />
            <el-table-column prop="createTime" label="创建时间" width="180">
              <template #default="{row}">
                {{ formatTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="auditTime" label="审核时间" width="180">
              <template #default="{row}">
                {{ row.auditTime ? formatTime(row.auditTime) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="auditPeopleName" label="审核人" />
            <el-table-column label="状态" width="100">
              <template #default="{row}">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(row.id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>

        <!-- 拒绝原因对话框 -->
        <el-dialog
          v-model="rejectDialogVisible"
          title="拒绝原因"
          width="500px"
        >
          <el-form
            ref="rejectFormRef"
            :model="rejectForm"
            :rules="rejectRules"
            label-width="100px"
          >
            <el-form-item label="拒绝原因" prop="reason">
              <el-input 
                v-model="rejectForm.reason" 
                type="textarea" 
                :rows="4"
                placeholder="请输入拒绝原因"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="rejectDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleReject">确定</el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 编辑商户对话框 -->
        <el-dialog
          v-model="editDialogVisible"
          title="编辑商户信息"
          width="500px"
          @close="resetForm"
        >
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="100px"
          >
            <el-form-item label="商户名称" prop="businessName">
              <el-input v-model="formData.businessName" />
            </el-form-item>
            <el-form-item label="联系人" prop="orderPeopleName">
              <el-input v-model="formData.orderPeopleName" />
            </el-form-item>
            <el-form-item label="联系电话" prop="orderPeoplePhone">
              <el-input v-model="formData.orderPeoplePhone" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitForm">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { getAuditBusinessList,passAuditBusiness,rejectAuditBusiness } from '../../axiosInstance';
const router = useRouter();
const activeIndex = ref('3');
const loading = ref(false);
const tableData = ref([]);
const pendingTableData = ref([]);
const showPendingTable = ref(false);
const editDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const formRef = ref(null);
const rejectFormRef = ref(null);
const currentRejectId = ref(null);

const searchParams = reactive({
  business_name: ''
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
});

const formData = reactive({
  id: null,
  businessName: '',
  orderPeopleName: '',
  orderPeoplePhone: ''
});

const rejectForm = reactive({
  reason: ''
});

const rules = reactive({
  businessName: [
    { required: true, message: '请输入商户名称', trigger: 'blur' }
  ],
  orderPeopleName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  orderPeoplePhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
});

const rejectRules = reactive({
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' }
  ]
});

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
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const fetchPendingRegistrations = async () => {
  try {
    loading.value = true;
    showPendingTable.value = true;
    const params = {
      ...searchParams,
      page: pagination.current,
      pageSize: pagination.size,
      status:0
    };
    const res = await getAuditBusinessList(params);
    // 这里替换为您的API调用，获取待审核的商户申请
    // const res = await getPendingRegistrations();
    // pendingTableData.value = res.data.content;
    // 模拟数据
    if(res.data.success == true){
      pendingTableData.value = res.data.content.data;
      pagination.total = res.data.content.totalCount;
    }
    else{
      ElMessage.error(res.data.message);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const fetchData = async () => {
  try {
    loading.value = true;
    showPendingTable.value = false;
    const params = {
      ...searchParams,
      page: pagination.current,
      pageSize: pagination.size,
      status:1
    };
    const res = await getAuditBusinessList(params);
    // 这里替换为您的API调用，获取待审核的商户申请
    // const res = await getPendingRegistrations();
    // pendingTableData.value = res.data.content;
    // 模拟数据
    if(res.data.success == true){
      tableData.value = res.data.content.data;
      pagination.total = res.data.content.totalCount;
    }
    else{
      ElMessage.error(res.data.message);
    };
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSelect = (index) => {
  activeIndex.value = index;
};

const handleSearch = () => {
  pagination.current = 1;
  if (showPendingTable.value) {
    fetchPendingRegistrations();
  } else {
    fetchData();
  }
};

const handleSizeChange = (val) => {
  pagination.size = val;
  if (showPendingTable.value) {
    fetchPendingRegistrations();
  } else {
    fetchData();
  }
};

const handleCurrentChange = (val) => {
  pagination.current = val;
  if (showPendingTable.value) {
    fetchPendingRegistrations();
  } else {
    fetchData();
  }
};

const handleApprove = async (id) => {
  try {
    // 这里替换为您的API调用，审核通过
    // await approveRegistration(id);
    console.log(id);
    const data = {
      id: id
    };
    const res = await passAuditBusiness(data);
    if(res.data.success == true){
      ElMessage.success('审核通过成功');
    }
    else{
      ElMessage.error(res.data.message);
    }
    
    fetchPendingRegistrations();
  } catch (error) {
    console.error(error);
    ElMessage.error('操作失败');
  }
};

const showRejectDialog = (id) => {
  currentRejectId.value = id;
  rejectDialogVisible.value = true;
};

const handleReject = async () => {
  try {
    await rejectFormRef.value.validate();
    // 这里替换为您的API调用，审核拒绝
    // await rejectRegistration(currentRejectId.value, rejectForm.reason);
    
    
    const data = {
      id: currentRejectId.value,
      auditResult: rejectForm.reason
    };
    const res = await rejectAuditBusiness(data);
    if(res.data.success == true){
      ElMessage.success('已拒绝该申请');
    }
    else{
      ElMessage.error(res.data.message);
    }
    rejectDialogVisible.value = false;
    rejectForm.reason = '';
    
    fetchPendingRegistrations();
  } catch (error) {
    console.error(error);
  }
};

const handleEdit = (row) => {
  Object.assign(formData, row);
  editDialogVisible.value = true;
};

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该商户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 这里替换为您的API调用，删除商户
    // await deleteBusiness(id);
    ElMessage.success('删除成功');
    fetchData();
  }).catch(() => {});
};

const submitForm = async () => {
  await formRef.value.validate();
  try {
    if (formData.id) {
      // 这里替换为您的API调用，更新商户
      // await updateBusiness(formData);
      ElMessage.success('更新成功');
    } else {
      // 这里替换为您的API调用，新增商户
      // await addBusiness(formData);
      ElMessage.success('新增成功');
    }
    editDialogVisible.value = false;
    fetchData();
  } catch (error) {
    console.error(error);
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  formData.id = null;
  formData.businessName = '';
  formData.orderPeopleName = '';
  formData.orderPeoplePhone = '';
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.el-header {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #545c64;
  color: #fff;
  height: calc(100vh - 60px);
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.el-menu-vertical {
  border-right: none;
  height: 100%;
}

.el-menu-item.is-active {
  background-color: #434a50 !important;
}

.header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.header .el-input {
  margin-left: auto;
}

.header .el-button + .el-button {
  margin-left: 10px; /* 确保按钮之间有一定间距 */
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>