<template>
    <el-container>
        <el-main>
            <el-card>
                <div class="header">
                    <div class="search-group">
                        <el-date-picker
                            v-model="dateRange"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            class="fruit-date-picker"
                            @change="handleSearch"
                        />
                        <el-button @click="handleSearch">查询</el-button>
                    </div>
                </div>
                <el-table
                    :data="tableData"
                    border
                    style="width: 100%"
                    v-loading="loading"
                >
                    <el-table-column prop="message" label="反馈信息"></el-table-column>
                    <el-table-column prop="member_name" label="会员姓名"></el-table-column>
                    <el-table-column prop="member_phone" label="会员电话"></el-table-column>
                    <el-table-column label="操作" width="180">
                        <template #default="{ row }">
                            <el-button size="small" type="danger" @click="handleDelete(row.id)">
                                删除
                            </el-button>
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
        </el-main>
    </el-container>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { getFeedback, deleteFeedback } from '../../axiosInstance';

const router = useRouter();
const loading = ref(false);
const tableData = ref([]);
// 改为存储日期范围的数组
const dateRange = ref([]); 
const searchParams = reactive({
    page: 1,
    pageSize: 10
});

const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
});

const fetchData = async () => {
    try {
        loading.value = true;
        const params = {
           ...searchParams,
            page: pagination.current,
            pageSize: pagination.size
        };
        // 如果日期范围选择有值，设置开始和结束日期参数
        if (dateRange.value.length === 2) {
            params.startDate = dateRange.value[0]?.toISOString().split('T')[0];
            params.endDate = dateRange.value[1]?.toISOString().split('T')[0];
        }
        const res = await getFeedback(params);
        if (res.data.success) {
            tableData.value = res.data.content.data;
            pagination.total = res.data.content.totalCount;
        } else {
            ElMessage.error(res.data.message);
        }
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

const handleDelete = (id) => {
    ElMessageBox.confirm('确定要删除该反馈信息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        const res = await deleteFeedback(id);
        if (res.data.success) {
            ElMessage.success('删除成功');
            fetchData();
        } else {
            ElMessage.error(res.data.message);
        }
    }).catch(() => {});
};

onMounted(() => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7);
    dateRange.value = [startDate, endDate];
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

.search-group {
    display: flex;
    align-items: center;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

/* 新增日期选择器样式，可按需调整 */
.fruit-date-picker {
    width: 100%;
    margin-right: 10px; 
}
</style>