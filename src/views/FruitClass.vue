<template>
  <!-- 导航栏 -->
  <el-row class="fruit-nav">
    <el-col :span="3"><div class="nav-item nav-logo">🍓 水果管家</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="gotoFacility">🍌 设施</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="gotInvocing">🍎 进销管理</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="gotoFruitFresh">🍊 水果健康监控</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="router.push('/caculte')">🍍 健康报告</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="gotoBuy">🍇 销售</div></el-col>
    <el-col :span="3"><div class="nav-item active" @click="gotoFruitClass">🍉 水果种类</div></el-col>
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
      @selection-change="handleSelectionChange"
      :default-sort = "{prop: 'date', order: 'descending'}"
    >
      <el-table-column
        type="selection"
        width="55"
        label="选择">
      </el-table-column>
      <el-table-column
        type="index"
        label="序号"
        width="80">
      </el-table-column>
      <el-table-column
        prop="fruitName"
        label="种类名"
        sortable
        width="280">
      </el-table-column>
      <el-table-column
        prop="updatePeople"
        label="修改人"
        sortable
        width="280">
      </el-table-column>
      <el-table-column
        prop="updateTime"
        label="修改时间"
        sortable
        width="280">
      </el-table-column>
      <el-table-column
        prop="createPeople"
        label="创建人"
        sortable
        width="280">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        sortable
        width="380">
      </el-table-column>
      <el-table-column
        prop="address"
        label="操作"
        width="380">
        <template #default="scpoe">
          <el-button type="warning" @click="openUpdateDialog(scpoe.$index,scpoe.row)" class="fruit-button">🍐 修改</el-button>
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
    title="添加水果种类"
    width="500"
    :before-close="handleClose"
    class="fruit-dialog"
  >
    <span>
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="种类名称">
          <el-input v-model="fruitClassform.name" @input="fruitAddOnchange" placeholder="请输入水果种类名称"/>
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
    title="水果种类详情"
    width="500"
    :before-close="handleClose"
    class="fruit-dialog"
  >
    <span>
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="种类名称">
          <el-input v-model="fruitClassform.name" disabled/>
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
    title="修改水果种类"
    width="500"
    :before-close="handleClose"
    class="fruit-dialog"
  >
    <span>
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="种类名称">
          <el-input v-model="fruitClassform.name" @input="fruitAddOnchange" placeholder="请输入水果种类名称"/>
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

  <!-- 删除对话框 -->
  <el-dialog
    v-model="dialogDelete"
    title="删除确认"
    width="500"
    :before-close="handleClose"
    class="fruit-dialog"
  >
    <span>
      <div class="delete-message">🍌 确定要删除选中的水果种类吗？</div>
    </span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogDelete = false" class="fruit-button">取消</el-button>
        <el-button type="danger" @click="onSubmitDelete" class="fruit-button">
          确认删除
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';

const showMessage = () => {
ElMessage.info('你点击了按钮');
};

// 导航相关
const gotoFruitClass=()=>{
router.push('/fruitclass')
};
const gotoBuy = () => {
    router.push('/buy');
};
const gotoFacility=()=>{
router.push('/facility')
};
const gotoFruitFresh=()=>{
router.push('/fruitFreshNess')
};
const gotInvocing=()=>{
router.push('/invocing')
};

// 多选
const multipleSelection = ref([]);
const handleSelectionChange = (val) =>{
console.log(val);
multipleSelection.value = val;
};

// 删除
const dialogDelete = ref(false);
const openDelete = ()=>{
dialogDelete.value = true;
}
const onSubmitDelete = async() => {
var ids = [];
for(var i=0;i<multipleSelection.value.length;i++){
  ids[i] = multipleSelection.value[i].id;
}
console.log(ids);

console.log('submit!');
try{
  const response = await axiosInstance.post(config.backendUrl+'/fruitClass/delete',ids);
  console.log(response);
  if(response.data.success){
    ElMessage.success(response.data.message);
    dialogDelete.value = false;
  }else{
    ElMessage.error(response.data.message);
  }
  getFruitClassByPage();
}catch(error){
  console.log("操作失败");
}
};

// 导航
import { useRouter } from 'vue-router';
const router = useRouter();

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
};

const handleCurrentChange = (val) => {
currentPage.value = val;
getFruitClassByPage();
};

const tableData = ref([
{
  id: 11,
  fruitName: 'Tom',
  updatePeople: 'No. 189, Grove St, Los Angeles',
  updateTime:1,
  createPeople:"as",
  createTime:1
}
]);

import { reactive } from 'vue'

// do not use same name with ref
const fruitClassform = reactive({
name: '',
id:0
})

// 修改时查询水果种类表是否同名
const fruitAddOnchange=async() =>{
try{
  console.log("执行");
  const response = await axiosInstance.get(config.backendUrl+'/fruitClass/getExisit?fruitName='+fruitClassform.name);
  if(!response.data.success){
    ElMessage.error(response.data.message);
  }
}catch(error){
  console.log("系统异常");
}
};

// 请求
import axiosInstance from '../axiosInstance';
import { onMounted } from 'vue';
import config from '../config';
const data = ref(null);

const onSubmitAdd = async() => {
console.log('submit!');
try{
  if(fruitClassform.name==null || fruitClassform.name.trim().length<1){
    ElMessage.error("请输入种类名称");
  }
  const response = await axiosInstance.post(config.backendUrl+'/fruitClass/add?fruitName='+fruitClassform.name);
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

const dialogUpdate = ref(false);

const openUpdateDialog = (index,row)=>{
fruitClassform.name = row.fruitName;
fruitClassform.id = row.id;
dialogUpdate.value = true;
}

// 修改
const onSubmitUpdate = async() => {
console.log('submit!');
try{
  if(fruitClassform.name==null || fruitClassform.name.trim().length<1){
    ElMessage.error("请输入种类名称");
  }
  const response = await axiosInstance.post(config.backendUrl+'/fruitClass/update?fruitName='+fruitClassform.name,{
    id: fruitClassform.id
  });
  console.log(response);
  if(response.data.success){
    ElMessage.success(response.data.message);
    dialogUpdate.value = false;
  }else{
    ElMessage.error(response.data.message);
  }
  getFruitClassByPage();
}catch(error){
  console.log("操作失败");
}
};

const getFruitClassByPage= async() =>{
try{
  const response = await axiosInstance.get(config.backendUrl+'/fruitClass/getFruitClassByPage?page='+currentPage.value+'&pageSize='+pageSize.value);
  console.log(response);
  if(response.data.success){
    totalCount.value = response.data.content.totalCount;
    tableData.value = response.data.content.data;
    console.log(tableData.value)
  }else{
    ElMessage.error(response.data.message);
  }
}catch(error){
  console.log("系统异常");
}
};

// 详情
const dialogDetail = ref(false);
const openDetail = (index,row)=>{
dialogDetail.value = true;
fruitClassform.name = row.fruitName;
console.log(row.fruitName);
console.log(index);
};

// 对话框
import { ElMessageBox } from 'element-plus';
const dialogAdd = ref(false);
const openAddDialog = ()=>{
console.log("打开了这里");
dialogAdd.value = true;
console.log(dialogAdd.value)
};
const handleClose = (done) => {
ElMessageBox.confirm('Are you sure to close this dialog?')
  .then(() => {
    fruitClassform.name="";
    done();
  })
  .catch(() => {
    // 捕获错误
  });
};

const gotoMember = () => router.push('/member');

onMounted(() => {
getFruitClassByPage();
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
}

/* 表格样式 */
.fruit-table {
border-radius: 10px;
overflow: hidden;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.fruit-table :deep(th) {
background-color: #f8a5c2;
color: black; /* 修改表头文字颜色为黑色 */
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