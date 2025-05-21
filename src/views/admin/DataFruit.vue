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
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              style="width: 200px; margin-right: 10px"
              @change="handleDateChange"
            />
            <el-button type="primary" @click="handleUpload">上传数据集</el-button>
            
          </div>

          <el-table :data="tableData" border style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="数据集名称" width="120"/>
            <el-table-column prop="date" label="日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.date) }}
              </template>
            </el-table-column>
            <el-table-column prop="num" label="图片个数" width="120"/>
            <el-table-column prop="size" label="大小" width="120">
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button size="small" @click="handleDownload(row)">下载</el-button>
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

        <!-- 上传数据集对话框 -->
        <el-dialog
          v-model="uploadDialogVisible"
          title="上传数据集"
          width="500px"
          @close="resetUploadForm"
        >
          <el-form
            ref="uploadFormRef"
            :model="uploadFormData"
            :rules="uploadRules"
            label-width="100px"
          >
            <el-form-item label="数据集名称" prop="name">
              <el-input v-model="uploadFormData.name" />
            </el-form-item>
            <el-form-item label="日期" prop="date">
              <el-date-picker
                v-model="uploadFormData.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="数据集文件" prop="file">
              <el-upload
                class="upload-demo"
                :auto-upload="false"
                :limit="1"
                :on-change="handleFileChange"
                :file-list="fileList"
              >
                <el-button type="primary">选择文件</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    请上传数据集文件，支持csv、xlsx、json格式
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="uploadDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitUpload">上传</el-button>
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
  getDatasetList, 
  uploadDataset, 
  downloadDataset, 
  deleteDataset 
} from '../../axiosInstance'; // 根据您的实际路径调整

const router = useRouter();
const activeIndex = ref('4');
const loading = ref(false);
const tableData = ref([
  {
  id: 0,
  name: "",
  date:"",
  num:0,
  size:""

}
]);
const uploadDialogVisible = ref(false);
const selectedDate = ref(null);
const fileList = ref([]);

const searchParams = reactive({
  date: null
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
});

const uploadFormData = reactive({
  name: '',
  date: null,
  file: null
});

const uploadRules = reactive({
  name: [
    { required: true, message: '请输入数据集名称', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  file: [
    { required: true, message: '请选择文件', trigger: 'change' }
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
    if (selectedDate.value) {
      params.date = formatDateForApi(selectedDate.value);
    }
    const res = await getDatasetList(params);
    if(res.data.success){
      tableData.value = res.data.content.data;
      pagination.total = res.data.content.totalCount;
    }
    
  } catch (error) {
    console.error(error);
    ElMessage.error('获取数据集列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleDateChange = (date) => {
  searchParams.date = date ? formatDateForApi(date) : null;
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

const handleUpload = () => {
  uploadDialogVisible.value = true;
};

const handleFileChange = (file) => {
  uploadFormData.file = file.raw;
};

const handleDownload = async (row) => {
  try {
    // loading.value = true;
    
    const name = row.name;
    const params = {
      name: name
    };
    const response = await downloadDataset(params);
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name.replace('/', '_')}archive.zip`);
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    ElMessage.error('下载失败');
  } finally {
    loading.value = false;
  }
};

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该数据集吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteDataset(id);
    ElMessage.success('删除成功');
    fetchData();
  }).catch(() => {});
};

const submitUpload = async () => {
  try {
    await uploadFormRef.value.validate();
    
    const formData = new FormData();
    formData.append('name', uploadFormData.name);
    formData.append('date', formatDateForApi(uploadFormData.date));
    formData.append('file', uploadFormData.file);
    
    await uploadDataset(formData);
    ElMessage.success('上传成功');
    uploadDialogVisible.value = false;
    fetchData();
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error('上传失败');
    }
  }
};

const resetUploadForm = () => {
  uploadFormRef.value?.resetFields();
  fileList.value = [];
  uploadFormData.file = null;
};

// 日期格式化工具函数
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const formatDateForApi = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

/* .header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
} */

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-demo {
  width: 100%;
}

.el-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.el-table {
  width: auto !important;
  margin: 20px auto;
}

/* 表头和内容居中 */
.el-table :deep(.el-table__header-wrapper th),
.el-table :deep(.el-table__body-wrapper td) {
  text-align: center;
}

/* 操作按钮居中 */
.el-table :deep(.cell) {
  display: flex;
  justify-content: center;
}

.header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10px; /* 添加按钮之间的间距 */
}
</style>