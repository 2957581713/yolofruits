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
            <el-button type="primary" @click="handleAdd">新增商户</el-button>
            <el-input
              v-model="searchParams.business_name"
              placeholder="搜索商户名称"
              style="width: 240px; margin-left: 10px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
          </div>

          <el-table :data="tableData" border style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="businessName" label="商户名称" />
            <el-table-column prop="orderPeopleName" label="商户联系人" />
            <el-table-column prop="orderPeoplePhone" label="商户联系人电话" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column prop="updateTime" label="更新时间" width="180" />
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
              <el-input v-model="formData.business_name" />
            </el-form-item>
            <el-form-item label="商户联系人" prop="orderPeople">
              <el-input v-model="formData.business_name" />
            </el-form-item>
            <el-form-item label="商户联系人电话" prop="orderPeoplePhone">
              <el-input v-model="formData.business_name" />
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
  getBusinessList, 
  addBusiness, 
  updateBusiness, 
  deleteBusiness 
} from '../../axiosInstance'; // 根据您的实际路径调整

const router = useRouter();
const activeIndex = ref('1');
const loading = ref(false);
const tableData = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref(null);

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
  business_name: ''
});

const rules = reactive({
  business_name: [
    { required: true, message: '请输入商户名称', trigger: 'blur' }
  ]
});

const handleSelect = (index) => {
  activeIndex.value = index;
};

const fetchData = async () => {
  try {
    loading.value = true;
    const params = {
      ...searchParams,
      page: pagination.current,
      pageSize: pagination.size
    };
    const res = await getBusinessList(params);
    tableData.value = res.data.content.data;
    pagination.total = res.data.content.totalCount;
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
  dialogTitle.value = '新增商户';
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑商户';
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该商户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteBusiness(id);
    ElMessage.success('删除成功');
    fetchData();
  }).catch(() => {});
};

const submitForm = async () => {
  await formRef.value.validate();
  try {
    if (formData.id) {
      await updateBusiness(formData);
      ElMessage.success('更新成功');
    } else {
      await addBusiness(formData);
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
  justify-content: space-between;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>