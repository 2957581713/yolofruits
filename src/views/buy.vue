<template>
    <!-- 导航栏 -->
    <el-row class="fruit-nav">
      <el-col :span="3"><div class="nav-item nav-logo">🍓 您的水果管家</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFacility">🍌 设施</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotInvocing">🍎 进销管理</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFruitFresh">🍊 水果健康监控</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotCaculte">🍍 健康报告</div></el-col>
      <el-col :span="3"><div class="nav-item active" @click="gotoBuy">🍇 销售</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFruitClass">🍉 水果种类</div></el-col>
      <el-col :span="3"><div class="nav-item"@click="gotoMember">🍋 员工管理</div></el-col>
    </el-row>
    <!-- 搜索和筛选区域 -->
    <el-row class="search-area">
        <el-col :span="6">
          <el-input
            v-model="searchQuery"
            placeholder="搜索水果名称或种类"
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch" class="search-button">🔍</el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
    <el-container class="analysis-report-container">
      
      
      <el-main>
<!-- 销售表格 -->
<el-table
        :data="filteredFruits"
        align="center"
        class="fruit-table"
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          label="水果名称"
          sortable
          width="180">
        </el-table-column>
        <el-table-column
          prop="className"
          label="水果种类"
          sortable
          width="180">
        </el-table-column>
        <el-table-column
          prop="batchName"
          label="批次"
          sortable
          width="150">
        </el-table-column>
        <el-table-column
          prop="containerName"
          label="柜号"
          sortable
          width="120">
        </el-table-column>
        <el-table-column
          prop="number"
          label="库存数量(kg)"
          sortable
          width="150">
        </el-table-column>
        <el-table-column
          prop="freshness"
          label="新鲜度"
          sortable
          width="120">
          <template #default="{row}">
            <el-tag >
              {{ getFreshnessTagType(row.freshness) }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="arrivalDate"
          label="到货日期"
          sortable
          width="180">
        </el-table-column> -->
        <el-table-column
          label="操作"
          width="200">
          <template #default="{row}">
            <el-button 
              type="success" 
              @click="openSellDialog(row)"
              class="fruit-button"
              :disabled="row.quantity <= 0"
            >
              🛒 销售
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
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
      </el-main>
      
      
      <!-- 销售对话框 -->
      <el-dialog
        v-model="sellDialogVisible"
        title="销售水果"
        width="500"
        class="fruit-dialog"
      >
        <el-form :model="sellForm" label-width="auto" style="max-width: 600px">
          <el-form-item label="水果名称">
            <el-input v-model="sellForm.name" disabled />
          </el-form-item>
          <el-form-item label="批次号">
            <el-input v-model="sellForm.batchName" disabled />
          </el-form-item>
          <el-form-item label="柜号">
            <el-input v-model="sellForm.containerName" disabled />
          </el-form-item>
          <el-form-item label="当前库存(kg)">
            <el-input v-model="sellForm.number" disabled />
          </el-form-item>
          <el-form-item label="销售数量(kg)" required>
            <el-input-number 
              v-model="sellForm.sellQuantity" 
              :min="0.1" 
              :max="sellForm.currentQuantity"
              :precision="1"
              :step="0.1"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click=" sellDialogVisible = false" class="fruit-button">取消</el-button>
            <el-button type="primary" @click="confirmSell" class="fruit-button">
              确认销售
            </el-button>
          </div>
        </template>
      </el-dialog>
    </el-container>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import axiosInstance from '../axiosInstance';
  import config from '../config';
  import { useRouter } from 'vue-router';
  
  // 导航相关
  const router = useRouter();
  const gotoFruitClass = () => router.push('/fruitclass');
  const gotCaculte = () => router.push('/caculte');
  const gotoBuy = () => router.push('/buy');
  const gotoFacility = () => router.push('/facility');
  const gotoFruitFresh = () => router.push('/fruitFreshNess');
  const gotInvocing = () => router.push('/invocing');
  const gotoMember = () => router.push('/member');
  
  // 分页相关
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalCount = ref(0);
  
  const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchFruits();
  };
  
  const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchFruits();
  };
  
  // 水果数据
  const fruits = ref([]);
  const filteredFruits = ref([]);
  const searchQuery = ref('');
  const selectedCabinet = ref('');
  const selectedBatch = ref('');
  
  // 获取筛选选项
  const cabinetOptions = computed(() => {
    const cabinets = new Set();
    fruits.value.forEach(fruit => cabinets.add(fruit.cabinetNumber));
    return Array.from(cabinets);
  });
  
  const batchOptions = computed(() => {
    const batches = new Set();
    fruits.value.forEach(fruit => batches.add(fruit.batchNumber));
    return Array.from(batches);
  });
  
  // 获取水果数据
  const fetchFruits = async () => {
    try {
      const response = await axiosInstance.get(
        `${config.backendUrl}/fruit/list?page=${currentPage.value}&pageSize=${pageSize.value}`
      );
      
      if (response.data.success) {
        fruits.value = response.data.content.data;
        totalCount.value = response.data.content.totalCount;
        applyFilters();
      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      console.error("获取水果数据失败:", error);
      ElMessage.error("获取水果数据失败");
    }
  };
  
  // 搜索和筛选
  const handleSearch = () => {
    applyFilters();
  };
  
  const handleFilterChange = () => {
    applyFilters();
  };
  
  const applyFilters = () => {
    let result = [...fruits.value];
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(fruit => 
        fruit.fruitName.toLowerCase().includes(query) || 
        fruit.fruitType.toLowerCase().includes(query)
      );
    }
    
    if (selectedCabinet.value) {
      result = result.filter(fruit => fruit.cabinetNumber === selectedCabinet.value);
    }
    
    if (selectedBatch.value) {
      result = result.filter(fruit => fruit.batchNumber === selectedBatch.value);
    }
    
    filteredFruits.value = result;
  };
  
  // 新鲜度标签类型
  const getFreshnessTagType = (freshness) => {
    if (freshness == 0) return '新鲜';
    if (freshness == 1) return '一般';
    return '腐烂';
  };
  
  // 销售对话框
  const sellDialogVisible = ref(false);
  const sellForm = ref({
    id: '',
    name: '',
    batchId: '',
    containerId: '',
    number: 0,
    sellQuantity: 0.1
  });
  
  const openSellDialog = (row) => {
    sellForm.value = row;
    sellDialogVisible.value = true;
  };
  
  const confirmSell = async () => {
    try {
      const response = await axiosInstance.post(
        `${config.backendUrl}/fruit/record`,
        {
          id: sellForm.value.id,
          quantity: sellForm.value.sellQuantity
        }
      );
      
      if (response.data.success) {
        ElMessage.success("销售记录已保存");
        sellDialogVisible.value = false;
        fetchFruits();
      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      console.error("销售失败:", error);
      ElMessage.error("销售失败");
    }
  };
  
  const handleClose = (done) => {
    ElMessageBox.confirm('确定要关闭吗?')
      .then(() => {
        sellForm.value = {
          id: '',
          fruitName: '',
          batchNumber: '',
          cabinetNumber: '',
          currentQuantity: 0,
          sellQuantity: 0.1
        };
        done();
      })
      .catch(() => {});
  };
  
  onMounted(() => {
    fetchFruits();
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
  
  /* 分析报告容器样式 */
  .analysis-report-container {
    padding: 20px;
  }
  
  /* 分析报告标题样式 */
  .analysis-report-title {
    font-size: 32px;
    color: #e74c3c;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  /* 搜索区域样式 */
  .search-area {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }
  
  .search-input {
    border-radius: 20px;
  }
  
  .search-button {
    border-radius: 0 20px 20px 0;
  }
  
  .filter-select {
    width: 100%;
  }
  
  /* 表格样式 */
  .fruit-table {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
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
  </style>