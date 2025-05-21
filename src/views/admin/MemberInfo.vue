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
          <el-menu-item index="2" @click="router.push('/member')">
            <span>员工信息</span>
          </el-menu-item>
          <el-menu-item index="3" @click="router.push('/auditBusiness')">
            <span>商户信息审核</span>
          </el-menu-item>
          <el-menu-item index="4" @click="router.push('/dataset')">
            <span>数据集管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <el-card>
          <div class="header">
            <el-button type="primary" @click="handleAdd">新增员工</el-button>
            <div class="search-group">
              <el-input
                v-model="searchParams.username"
                placeholder="搜索用户名"
                style="width: 200px"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              />
              <el-input
                v-model="searchParams.phone"
                placeholder="搜索手机号"
                style="width: 200px; margin-left: 10px"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              />
              <el-select
                v-model="searchParams.statu"
                placeholder="状态"
                clearable
                style="width: 120px; margin-left: 10px"
                @change="handleSearch"
              >
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </div>
          </div>

          <el-table :data="tableData" border style="width: 100%" v-loading="loading">
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column prop="business_name" label="所属商户" />
            <el-table-column prop="statu" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.statu === 1 ? 'success' : 'danger'">
                  {{ row.statu === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="180" />
            <el-table-column prop="update_time" label="更新时间" width="180" />
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

        <el-dialog
          v-model="dialogVisible"
          :title="dialogTitle"
          width="600px"
          @close="resetForm"
        >
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="100px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" />
            </el-form-item>
            <el-form-item label="密码" prop="password" v-if="!formData.id">
              <el-input v-model="formData.password" type="password" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" />
            </el-form-item>
            <el-form-item label="所属商户" prop="business_id">
              <el-select
                v-model="formData.business_id"
                filterable
                placeholder="请选择商户"
                style="width: 100%"
              >
                <el-option
                  v-for="item in businessOptions"
                  :key="item.id"
                  :label="item.business_name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="statu">
              <el-radio-group v-model="formData.statu">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">取消</el-button>
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
import { 
  getMemberList, 
  addMember, 
  updateMember, 
  deleteMember,
  getBusinessList
} from '../../axiosInstance'; // 根据您的实际路径调整

const router = useRouter();
const activeIndex = ref('2');
const loading = ref(false);
const tableData = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref(null);
const businessOptions = ref([]);

const searchParams = reactive({
  username: '',
  phone: '',
  statu: null
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
});

const formData = reactive({
  id: null,
  username: '',
  password: '',
  phone: '',
  business_id: null,
  statu: 1
});

const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  business_id: [
    { required: true, message: '请选择所属商户', trigger: 'change' }
  ],
  statu: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

const handleSelect = (index) => {
  activeIndex.value = index;
};

const fetchBusinessList = async () => {
  try {
    const res = await getBusinessList({ page: 1, pageSize: 1000 });
    businessOptions.value = res.data.list;
  } catch (error) {
    console.error(error);
  }
};

const fetchData = async () => {
  try {
    loading.value = true;
    const params = {
      ...searchParams,
      page: pagination.current,
      pageSize: pagination.size
    };
    const res = await getMemberList(params);
    tableData.value = res.data.list;
    pagination.total = res.data.total;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleSizeChange = (val) => {
  pagination.size = val;
  fetchData();
};

const handleCurrentChange = (val) => {
  pagination.current = val;
  fetchData();
};

const handleAdd = () => {
  dialogTitle.value = '新增员工';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑员工';
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该员工吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteMember(id);
    ElMessage.success('删除成功');
    fetchData();
  }).catch(() => {});
};

const submitForm = async () => {
  await formRef.value.validate();
  try {
    if (formData.id) {
      await updateMember(formData);
      ElMessage.success('更新成功');
    } else {
      await addMember(formData);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    fetchData();
  } catch (error) {
    console.error(error);
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  formData.id = null;
  formData.password = '';
};

onMounted(() => {
  fetchData();
  fetchBusinessList();
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
  justify-content: space-between;
}

.search-group {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>