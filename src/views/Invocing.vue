<template>
  <!-- 导航栏 -->
  <el-row class="fruit-nav">
      <el-col :span="3"><div class="nav-item nav-logo">🍓 您的水果管家</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFacility">🍌 设施</div></el-col>
      <el-col :span="3"><div class="nav-item active" @click="gotInvocing">🍎 进销管理</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoFruitFresh">🍊 水果健康监控</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="router.push('/caculte')">🍍 健康报告</div></el-col>
      <el-col :span="3"><div class="nav-item" @click="gotoBuy">🍇 销售</div></el-col>
      <el-col :span="3"><div class="nav-item " @click="gotoFruitClass">🍉 水果种类</div></el-col>
      <el-col :span="3"><div class="nav-item"@click="gotoMember">🍋 员工管理</div></el-col>
  </el-row>
  <el-row class="action-buttons">
      <el-button type="success" @click="openAddDialog" class="fruit-button">🍒 添加</el-button>
      <el-button type="danger" @click="openDelete" class="fruit-button">🍑 删除</el-button>
  </el-row>
  <div class="center-container">
      <el-table
          :data="tableData"
          align="center"
          class="fruit-table"
          :default-sort = "{prop: 'date', order: 'descending'}"
      >
          <el-table-column
              type="index"
              label="序号"
              width="80">
          </el-table-column>
          <el-table-column
              prop="source"
              label="进货商"
              sortable
              width="380">
          </el-table-column>
          <el-table-column
              prop="sourcePhone"
              label="进货商电话"
              sortable
              width="380">
          </el-table-column>
          <el-table-column
              prop="name"
              label="批次名"
              sortable
              width="380">
          </el-table-column>
          <el-table-column
              prop="createTime"
              label="时间"
              sortable
              width="380">
          </el-table-column>
          <el-table-column
              prop="createPeople"
              label="创建人"
              sortable
              width="380">
          </el-table-column>
          <el-table-column
              prop="address"
              label="操作"
              width="380">
              <template #default="scpoe">
                  <el-button type="warning" @click="openUpdate(scpoe.$index,scpoe.row)" class="fruit-button">🍐 修改</el-button>
                  <el-button type="info" @click="openDetail(scpoe.$index,scpoe.row)" class="fruit-button">🍈 详情</el-button>
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

  <!-- 添加对话框 -->
  <el-dialog
      v-model="dialogAdd"
      title="添加水果批次"
      width="500"
      :before-close="handleClose"
      class="fruit-dialog"
  >
      <span>
          <!-- 主表单 -->
          <el-form :model="formData" label-width="120px">
              <el-form-item label="名称">
                  <el-input v-model="formData.name" />
              </el-form-item>
              <el-form-item label="来源">
                  <el-input v-model="formData.source" />
              </el-form-item>
              <el-form-item label="来源电话">
                  <el-input v-model="formData.sourcePhone" />
              </el-form-item>

              <!-- 水果信息表单 -->
              <el-form-item label="水果信息">
                  <div v-for="(fruit, index) in formData.invoicingFruits" :key="index">
                      <el-form :model="fruit" label-width="100px">
                          <el-form-item label="水果名称">
                              <el-input v-model="fruit.fruitName" />
                          </el-form-item>
                          <el-form-item label="水果类别">
                              <el-select v-model="fruit.fruitclassId" placeholder="请选择水果类别" @change="updateFruitClassName(index)">
                                  <el-option
                                      v-for="option in fruitClasses"
                                      :key="option.id"
                                      :label="option.fruitName"
                                      :value="option.id"
                                  />
                              </el-select>
                          </el-form-item>
                          <el-form-item label="数量">
                              <el-input v-model="fruit.number" 
                              @input="filterNumberInput($event, index)"/>
                          </el-form-item>
                      </el-form>
                      <el-button type="danger" @click="removeRow(index)">删除</el-button>
                  </div>
                  <el-button type="primary" @click="addRow">添加水果信息</el-button>
              </el-form-item>
          </el-form>
      </span>
      <template #footer>
          <div class="dialog-footer">
              <el-button @click="dialogAdd = false" class="fruit-button">取消</el-button>
              <el-button type="primary" @click="onSubmitAdd" class="fruit-button">
                  确认
              </el-button>
          </div>
      </template>
  </el-dialog>

  <!-- 详情对话框 -->
  <el-dialog
      v-model="dialogDetail"
      title="水果批次详情"
      width="500"
      :before-close="handleClose"
      class="fruit-dialog"
  >
      <span>
          <!-- 主表单 -->
          <el-form :model="formData" label-width="120px" disabled>
              <el-form-item label="名称">
                  <el-input v-model="formData.name" />
              </el-form-item>
              <el-form-item label="来源">
                  <el-input v-model="formData.source" />
              </el-form-item>
              <el-form-item label="来源电话">
                  <el-input v-model="formData.sourcePhone" />
              </el-form-item>
              <el-form-item label="时间">
                  <el-input v-model="formData.createTime" />
              </el-form-item>
              <el-form-item label="创建人">
                  <el-input v-model="formData.createPeople" />
              </el-form-item>

              <!-- 水果信息表单 -->
              <el-form-item label="水果信息" disabled>
                  <div v-for="(fruit, index) in formData.invoicingFruits" :key="index">
                      <el-form :model="fruit" label-width="100px">
                          <el-form-item label="水果名称">
                              <el-input v-model="fruit.fruitName" disabled />
                          </el-form-item>
                          <el-form-item label="水果类别">
                              <el-select v-model="fruit.fruitclassId" placeholder="请选择水果类别" @change="updateFruitClassName(index)" disabled>
                                  <el-option
                                      v-for="option in fruitClasses"
                                      :key="option.id"
                                      :label="option.fruitName"
                                      :value="option.id"
                                  />
                              </el-select>
                          </el-form-item>
                          <el-form-item label="数量">
                              <el-input v-model="fruit.number" 
                              @input="filterNumberInput($event, index)" disabled />
                          </el-form-item>

                          <el-form-item label="创建时间">
                              <el-input v-model="fruit.createTime" disabled />
                          </el-form-item>
                          <el-form-item label="创建人">
                              <el-input v-model="fruit.createPeople" disabled />
                          </el-form-item>
                          <el-form-item label="更新时间">
                              <el-input v-model="fruit.updateTime" disabled />
                          </el-form-item>
                          <el-form-item label="更新人">
                              <el-input v-model="fruit.updatePeople" disabled />
                          </el-form-item>
                      </el-form>
                      <el-form-item label="">
                          --------------------------------------------------
                      </el-form-item>
                  </div>
              </el-form-item>
          </el-form>
      </span>
      <template #footer>
          <div class="dialog-footer">
              <el-button @click="dialogDetail = false" class="fruit-button">关闭</el-button>
          </div>
      </template>
  </el-dialog>

  <!-- 修改对话框 -->
  <el-dialog
      v-model="dialogUpdate"
      title="修改水果批次"
      width="500"
      :before-close="handleClose"
      class="fruit-dialog"
  >
      <span>
          <!-- 主表单 -->
          <el-form :model="formData" label-width="120px">
              <el-form-item label="名称">
                  <el-input v-model="formData.name" />
              </el-form-item>
              <el-form-item label="来源">
                  <el-input v-model="formData.source" />
              </el-form-item>
              <el-form-item label="来源电话">
                  <el-input v-model="formData.sourcePhone" />
              </el-form-item>
              <el-form-item label="时间">
                  <el-input v-model="formData.createTime" disabled />
              </el-form-item>
              <el-form-item label="创建人">
                  <el-input v-model="formData.createPeople" disabled />
              </el-form-item>

              <!-- 水果信息表单 -->
              <el-form-item label="水果信息">
                  <div v-for="(fruit, index) in formData.invoicingFruits" :key="index">
                      <el-form :model="fruit" label-width="100px">
                          <el-form-item label="水果名称">
                              <el-input v-model="fruit.fruitName" />
                          </el-form-item>
                          <el-form-item label="水果类别">
                              <el-select v-model="fruit.fruitclassId" placeholder="请选择水果类别" @change="updateFruitClassName(index)">
                                  <el-option
                                      v-for="option in fruitClasses"
                                      :key="option.id"
                                      :label="option.fruitName"
                                      :value="option.id"
                                  />
                              </el-select>
                          </el-form-item>
                          <el-form-item label="数量">
                              <el-input v-model="fruit.number" 
                              @input="filterNumberInput($event, index)" />
                          </el-form-item>
                          <el-form-item label="创建时间">
                              <el-input v-model="fruit.createTime" disabled />
                          </el-form-item>
                          <el-form-item label="创建人">
                              <el-input v-model="fruit.createPeople" disabled />
                          </el-form-item>
                          <el-form-item label="更新时间">
                              <el-input v-model="fruit.updateTime" disabled />
                          </el-form-item>
                          <el-form-item label="更新人">
                              <el-input v-model="fruit.updatePeople" disabled />
                          </el-form-item>
                      </el-form>
                      <el-form-item label="">
                          --------------------------------------------------
                      </el-form-item>
                      <el-button type="danger" @click="removeRow(index)">删除</el-button>
                  </div>
                  <el-button type="primary" @click="addRow">添加水果信息</el-button>
              </el-form-item>
          </el-form>
      </span>
      <template #footer>
          <div class="dialog-footer">
              <el-button @click="dialogUpdate = false" class="fruit-button">取消</el-button>
              <el-button type="primary" @click="onSubmitUpdate" class="fruit-button">
                  确认
              </el-button>
          </div>
      </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage, formatter } from 'element-plus';
import { column } from 'element-plus/es/components/table-v2/src/common.mjs';
import { onMounted } from 'vue';
const showMessage = () => {
  ElMessage.info('你点击了按钮');
};

// 分页相关
import { ref } from 'vue';

// 当前页码
const currentPage = ref(1);
// 每页显示的条数
const pageSize = ref(5);
// 数据总条数
const totalCount = ref(100);

// 页码改变时的回调函数
const handleSizeChange = (val) => {
  pageSize.value = val;
  getFruitClassByPage();
  // 这里可以添加更新表格数据的逻辑，例如调用接口重新获取数据
  // 示例中暂时保留原有的 console.log 注释，可根据实际情况调整
  // console.log(`每页 ${val} 条`);
};
const gotoMember = () => router.push('/member');
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getFruitClassByPage();
  // 这里可以添加更新表格数据的逻辑，例如调用接口重新获取数据
  // 示例中暂时保留原有的 console.log 注释，可根据实际情况调整
  // console.log(`当前页: ${val}`);
};
// 分页

// 修改
const dialogUpdate = ref(false);
const onSubmitUpdate = async() => {
  console.log(formData);
  var values = formData.value;
  console.log(values);
  const emptyset = new Set();
  if(values.name==null || values.name.trim().length<1
      || values.source==null || values.source.trim().length<1
      || values.sourcePhone==null || values.sourcePhone.trim().length<1){
      setTimeout(() => {
          ElMessage.error("请填写完整信息");
      }, 0);
      return;
  }
  for(var i =0;i<values.invoicingFruits.length;i++){
      if(values.invoicingFruits[i].fruitName==null || values.invoicingFruits[i].fruitName.trim().length<1
          || values.invoicingFruits[i].number==null)
      {
          setTimeout(() => {
              ElMessage.error("请填写完整信息");
          }, 0);
          return;
      }
      if(emptyset.has(values.invoicingFruits[i].fruitName)){
          setTimeout(() => {
              ElMessage.error("请填写完整信息");
          }, 0);
          return;
      }
  }
  // 处理values
  values.createPeople=null;
  for(var i =0;i<values.invoicingFruits.length;i++){
      values.invoicingFruits[i].createPeople=null;
      values.invoicingFruits[i].updatePeople=null;
      values.invoicingFruits[i].businessId=null;
  }
  console.log("执行");
  console.log('submit!');
  try{
      const response = await axiosInstance.post(config.backendUrl+'/invoicing/update',values);
      console.log(response);
      if(response.data.success){
          ElMessage.success(response.data.message);
          dialogUpdate.value = false;
          getFruitClassByPage();
      }else{
          ElMessage.error(response.data.message);
      }
  }catch(error){
      console.log("操作失败");
  }
};

// 详情表单
const dialogDetail = ref(false);
// 详情表单
import { ElMessageBox } from 'element-plus';
import axiosInstance from '../axiosInstance';
const fruitClasses = ref([]);

const openUpdate = (index,row)=>{
  dialogUpdate.value = true;
  console.log(row.id);
  getInvoicingFruitsById(row.id);
  console.log(index);
};

const openDetail = (index,row)=>{
  dialogDetail.value = true;
  console.log(row.id);
  getInvoicingFruitsById(row.id);
  console.log(index);
};

// 查询数据分页
const getFruitClassByPage= async() =>{
  try{
      const response = await axiosInstance.get(config.backendUrl+'/invoicing/getInvoicingByPage?page='+currentPage.value+'&pageSize='+pageSize.value);
      console.log(response);
      if(response.data.success){
          totalCount.value = response.data.content.totalCount;
          tableData.value = response.data.content.data;
          console.log(tableData.value);
      }else{
          ElMessage.error(response.data.message);
      }
  }catch(error){
      console.log("系统异常");
  }
};

// 获水果数据
const getInvoicingFruitsById = async (id) => {
  try {
      const response = await axiosInstance.post(config.backendUrl+"/invoicing/getInvoicingFruitsById",{
          id: id
      });
      var i = response.data.content.invoicingFruits;
      formData.value = response.data.content;
      console.log(formData.value);
      // 确保 invoicingFruits 是一个数组
      if (Array.isArray(formData.value.invoicingFruits)) {
          formData.value.invoicingFruits.forEach(fruit => {
              // 找到对应的水果类别并设置 fruitclassId
              const selectedClass = fruitClasses.value.find(c => c.id === fruit.fruitclassId);
              if (selectedClass) {
                  fruit.fruitclassName = selectedClass.fruitName;
              }
          });
      }
  } catch (error) {
      console.error('获取水果数据失败', error);
  }
};

// 获取水果类别数据
const fetchFruitClasses = async () => {
  try {
      const response = await axiosInstance.get(config.backendUrl+"/fruitClass/getAll");
      fruitClasses.value = response.data.content;
  } catch (error) {
      console.error('获取水果类别数据失败', error);
  }
};
// 更新水果类别名称
const updateFruitClassName = (index) => {
  const selectedId = formData.value.invoicingFruits[index].fruitclassId;
  const selectedClass = fruitClasses.value.find((c) => c.id === selectedId);
  if (selectedClass) {
      formData.value.invoicingFruits[index].fruitclassName = selectedClass.fruitName;
  }
};
onMounted(() => {
  fetchFruitClasses();
  getFruitClassByPage();
});

const tableData = ref([
  {

  }
]);


const handleClose = (done) => {
  ElMessageBox.confirm('Are you sure to close this dialog?')
    .then(() => {
          formData.value="";
          done();
      })
    .catch(() => {
          // 捕获错误
      });
};


// 导航相关
const gotoFruitClass=()=>{
  router.push('/fruitclass');
};
const gotoBuy = () => {
    router.push('/buy');
};
const gotoFacility=()=>{
  router.push('/facility');
};
const gotoFruitFresh=()=>{
  router.push('/fruitFreshNess');
};
const gotInvocing=()=>{
  router.push('/invocing');
};

// 导航

import { useRouter } from 'vue-router';
import config from '../config';
const router = useRouter();

// 添加
const dialogAdd = ref(false);
const openAddDialog=()=>{
  dialogAdd.value = true;
};

const onSubmitAdd = async() => {
  console.log(formData);
  var values = formData.value;
  console.log(values);
  const emptyset = new Set();
  if(values.name==null || values.name.trim().length<1
      || values.source==null || values.source.trim().length<1
      || values.sourcePhone==null || values.sourcePhone.trim().length<1){
      setTimeout(() => {
          ElMessage.error("请填写完整信息");
      }, 0);
      return;
  }
  for(var i =0;i<values.invoicingFruits.length;i++){
      if(values.invoicingFruits[i].fruitName==null || values.invoicingFruits[i].fruitName.trim().length<1
          || values.invoicingFruits[i].number==null)
      {
          setTimeout(() => {
              ElMessage.error("请填写完整信息");
          }, 0);
          return;
      }
      if(emptyset.has(values.invoicingFruits[i].fruitName)){
          setTimeout(() => {
              ElMessage.error("请填写完整信息");
          }, 0);
          return;
      }
  }
  console.log("执行");
  console.log('submit!');
  try{
      const response = await axiosInstance.post(config.backendUrl+'/invoicing/add',values);
      console.log(response);
      if(response.data.success){
          ElMessage.success(response.data.message);
          dialogAdd.value = false;
      }else{
          ElMessage.error(response.data.message);
      }
  }catch(error){
      console.log("操作失败");
  }
};
// 过滤输入，只允许输入数字
const filterNumberInput = (value, index) => {
  const filteredValue = value.replace(/[^0-9]/g, '');
  formData.value.invoicingFruits[index].number = filteredValue;
};

const formData = ref({
  id: null,
  name: '',
  source: '',
  sourcePhone: '',
  invoicingFruits: [
      {
          id: null,
          fruitName: '',
          fruitclassId: null,
          number: null,
          fruitclassName: '',
          invoicingId: null,
          businessId: null,
          createTime: null,
          createPeople: null,
          updatePeople: null,
          updateTime: null
      }
  ]
});
// 添加行
const addRow = () => {
  formData.value.invoicingFruits.push({
      id: null,
      fruitName: '',
      fruitclassId: null,
      number: null,
      fruitclassName: '',
      invoicingId: null,
      businessId: null,
      createTime: null,
      createPeople: null,
      updatePeople: null,
      updateTime: null
  });
};

// 删除行
const removeRow = (index) => {
  formData.value.invoicingFruits.splice(index, 1);
  if (index > -1) {
      formData.value.invoicingFruits.splice(index, 1);
  }
};
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

.delete-message {
  text-align: center;
  font-size: 18px;
  color: #e74c3c;
  padding: 20px 0;
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