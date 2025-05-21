<template>
  <!-- 导航栏 -->
  <el-row class="fruit-nav">
      <el-col :span="3"><div class="nav-item nav-logo">🍓 您的水果管家</div></el-col>
      <el-col :span="3"><div class="nav-item active" @click="gotoFacility">🍌 设施</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotInvocing">🍎 进销管理</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFruitFresh">🍊 水果健康监控</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="router.push('/caculte')">🍍 健康报告</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoBuy">🍇 销售</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFruitClass">🍉 水果种类</div></el-col>
      <el-col :span="3"><div class="nav-item"@click="gotoMember">🍋 员工管理</div></el-col>
  </el-row>
  
  <el-row class="action-buttons">
      <el-button type="success" @click="openAddDialog" class="fruit-button">🍒 添加货柜</el-button>
      <el-input
          v-model="searchContainerName"
          placeholder="搜索货柜名称"
          style="width: 200px; margin-left: 20px;"
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
          :data="tableData"
          align="center"
          class="fruit-table"
          :default-sort = "{prop: 'createTime', order: 'descending'}"
      >
          <el-table-column
              type="index"
              label="序号"
              width="80">
          </el-table-column>
          <el-table-column
              prop="containerName"
              label="货柜名称"
              sortable
              width="300">
          </el-table-column>
          <el-table-column
              prop="fruitName"
              label="存放水果"
              sortable
              width="300">
          </el-table-column>
          <el-table-column
              prop="createTime"
              label="创建时间"
              sortable
              width="300">
          </el-table-column>
          <el-table-column
              prop="updateTime"
              label="更新时间"
              sortable
              width="300">
          </el-table-column>
          <el-table-column
              label="操作"
              width="400">
              <template #default="scope">
                  <el-button type="warning" @click="openUpdateDialog(scope.row)" class="fruit-button">🍐 修改</el-button>
                  <el-button type="info" @click="openBindFruitDialog(scope.row)" class="fruit-button">🍈 绑定水果</el-button>
                  <el-button type="danger" @click="handleDelete(scope.row.id)" class="fruit-button">🍑 删除</el-button>
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

  <!-- 添加货柜对话框 -->
  <el-dialog
      v-model="dialogAddVisible"
      title="添加货柜"
      width="500"
      :before-close="handleClose"
      class="fruit-dialog"
  >
      <el-form :model="addForm" label-width="120px">
          <el-form-item label="货柜名称" required>
              <el-input v-model="addForm.containerName" placeholder="请输入货柜名称" />
          </el-form-item>
      </el-form>
      <template #footer>
          <div class="dialog-footer">
              <el-button @click="dialogAddVisible = false" class="fruit-button">取消</el-button>
              <el-button type="primary" @click="handleAdd" class="fruit-button">确认</el-button>
          </div>
      </template>
  </el-dialog>

  <!-- 修改货柜对话框 -->
  <el-dialog
      v-model="dialogUpdateVisible"
      title="修改货柜"
      width="500"
      :before-close="handleClose"
      class="fruit-dialog"
  >
      <el-form :model="updateForm" label-width="120px">
          <el-form-item label="货柜名称" required>
              <el-input v-model="updateForm.containerName" placeholder="请输入货柜名称" />
          </el-form-item>
      </el-form>
      <template #footer>
          <div class="dialog-footer">
              <el-button @click="dialogUpdateVisible = false" class="fruit-button">取消</el-button>
              <el-button type="primary" @click="handleUpdate" class="fruit-button">确认</el-button>
          </div>
      </template>
  </el-dialog>

  <!-- 绑定水果对话框 -->
  <el-dialog
      v-model="dialogBindFruitVisible"
      title="绑定水果"
      width="500"
      :before-close="handleClose"
      class="fruit-dialog"
  >
      <el-form :model="bindFruitForm" label-width="120px">
          <el-form-item label="货柜名称">
              <el-input v-model="bindFruitForm.containerName" disabled />
          </el-form-item>
          <el-form-item label="选择水果" required>
              <el-select
                  v-model="bindFruitForm.selectedFruit"
                  filterable
                  placeholder="请选择水果"
                  style="width: 100%"
                  @change="handleFruitSelectChange"
              >
                  <el-option
                      v-for="fruit in fruitOptions"
                      :key="fruit.id"
                      :label="fruit.name"
                      :value="fruit.id"
                  />
              </el-select>
          </el-form-item>
          <el-form-item label="当前绑定">
              <el-tag v-if="bindFruitForm.currentFruit" style="margin-right: 8px;">
                  {{ bindFruitForm.currentFruitName }}
              </el-tag>
              <span v-else>未绑定水果</span>
          </el-form-item>
      </el-form>
      <template #footer>
          <div class="dialog-footer">
              <el-button @click="dialogBindFruitVisible = false" class="fruit-button">取消</el-button>
              <el-button type="primary" @click="handleBindFruit" class="fruit-button">确认绑定</el-button>
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
const tableData = ref([]);
const fruitOptions = ref([]); // 所有水果选项
const searchContainerName = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

// 对话框控制
const dialogAddVisible = ref(false);
const dialogUpdateVisible = ref(false);
const dialogBindFruitVisible = ref(false);

// 表单数据
const addForm = ref({
    containerName: ''
});

const updateForm = ref({
    id: null,
    containerName: ''
});

const bindFruitForm = ref({
    containerId: null,
    containerName: '',
    selectedFruit: null, // 改为单选
    currentFruit: null,
    currentFruitName:null   // 当前绑定的水果
});

const gotoMember = () => router.push('/member');

// 获取货柜列表
const fetchContainerList = async () => {
    try {
        const response = await axiosInstance.get(config.backendUrl + '/container/list', {
            params: {
                containerName: searchContainerName.value,
                page: currentPage.value,
                pageSize: pageSize.value
            }
        });
        
        if (response.data.success) {
            tableData.value = response.data.content.data;
            totalCount.value = response.data.content.totalCount;
        } else {
            ElMessage.error(response.data.message);
        }
    } catch (error) {
        console.error('获取货柜列表失败', error);
        ElMessage.error('获取货柜列表失败');
    }
};

// 获取所有水果
const fetchAllFruits = async () => {
    try {
        const response = await axiosInstance.get(config.backendUrl + '/fruit/getAll');
        if (response.data.success) {
            fruitOptions.value = response.data.content;
        } else {
            ElMessage.error(response.data.message);
        }
    } catch (error) {
        console.error('获取水果列表失败', error);
        ElMessage.error('获取水果列表失败');
    }
};

// 分页处理
const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchContainerList();
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchContainerList();
};

// 搜索处理
const handleSearch = () => {
    currentPage.value = 1;
    fetchContainerList();
};

const handleSearchClear = () => {
    searchContainerName.value = '';
    currentPage.value = 1;
    fetchContainerList();
};

// 添加货柜
const openAddDialog = () => {
    addForm.value.containerName = '';
    dialogAddVisible.value = true;
};

const handleAdd = async () => {
    if (!addForm.value.containerName.trim()) {
        ElMessage.error('请输入货柜名称');
        return;
    }
    
    try {
        const response = await axiosInstance.post(config.backendUrl + '/container/add?containerName='+addForm.value.containerName);
        
        if (response.data.success) {
            ElMessage.success('添加成功');
            dialogAddVisible.value = false;
            fetchContainerList();
        } else {
            ElMessage.error(response.data.message);
        }
    } catch (error) {
        console.error('添加货柜失败', error);
        ElMessage.error('添加货柜失败');
    }
};

// 修改货柜
const openUpdateDialog = (row) => {
    updateForm.value = {
        id: row.id,
        containerName: row.containerName
    };
    dialogUpdateVisible.value = true;
};

const handleUpdate = async () => {
    if (!updateForm.value.containerName.trim()) {
        ElMessage.error('请输入货柜名称');
        return;
    }
    
    try {
        const response = await axiosInstance.post(config.backendUrl + '/container/update', {
            id: updateForm.value.id,
            name: updateForm.value.containerName
        });
        
        if (response.data.success) {
            ElMessage.success('修改成功');
            dialogUpdateVisible.value = false;
            fetchContainerList();
        } else {
            ElMessage.error(response.data.message);
        }
    } catch (error) {
        console.error('修改货柜失败', error);
        ElMessage.error('修改货柜失败');
    }
};

// 删除货柜
const handleDelete = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除这个货柜吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        
        const response = await axiosInstance.post(config.backendUrl + '/container/delete', {
            id: id
        });
        
        if (response.data.success) {
            ElMessage.success('删除成功');
            fetchContainerList();
        } else {
            ElMessage.error(response.data.message);
        }
    } catch (error) {
        console.error('删除货柜失败', error);
        if (error !== 'cancel') {
            ElMessage.error('删除货柜失败');
        }
    }
};

// 绑定水果
const openBindFruitDialog = async (row) => {
    bindFruitForm.value = {
        containerId: row.id,
        containerName: row.containerName,
        selectedFruit: null,
        currentFruit: null,
        currentFruitName: null
    };
    bindFruitForm.value.currentFruit = row.fruitId;
    bindFruitForm.value.currentFruitName = row.fruitName;
    // try {
    //     // 获取当前绑定的水果
    //     const response = await axiosInstance.get(config.backendUrl + '/container/setFruit', {
    //         params: {
    //             containerId: row.id
    //         }
    //     });
        
    //     if (response.data.success && response.data.content) {
    //         bindFruitForm.value.currentFruit = response.data.content;
    //         bindFruitForm.value.selectedFruit = response.data.content.id;
    //     }
    // } catch (error) {
    //     console.error('获取绑定水果失败', error);
    //     ElMessage.error('获取绑定水果失败');
    // }
    
    dialogBindFruitVisible.value = true;
};

// 水果选择变化
const handleFruitSelectChange = (fruitId) => {
    const selectedFruit = fruitOptions.value.find(fruit => fruit.id === fruitId);
    if (selectedFruit) {
        bindFruitForm.value.selectedFruit = fruitId;
    }
};

const handleBindFruit = async () => {
    if (!bindFruitForm.value.selectedFruit) {
        ElMessage.error('请选择要绑定的水果');
        return;
    }
    
    try {
        const response = await axiosInstance.post(config.backendUrl + '/container/setFruit', {
            id: bindFruitForm.value.containerId,
            fruitId: bindFruitForm.value.selectedFruit
        });
        
        if (response.data.success) {
            ElMessage.success('绑定成功');
            dialogBindFruitVisible.value = false;
            fetchContainerList();
        } else {
            ElMessage.error(response.data.message);
        }
    } catch (error) {
        console.error('绑定水果失败', error);
        ElMessage.error('绑定水果失败');
    }
};

// 对话框关闭处理
const handleClose = (done) => {
    ElMessageBox.confirm('确定要关闭吗？', '提示', {
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
    fetchContainerList();
    fetchAllFruits();
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