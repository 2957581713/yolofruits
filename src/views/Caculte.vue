<template>
    <!-- 导航栏 -->
    <el-row class="fruit-nav">
        <el-col :span="3"><div class="nav-item nav-logo">🍓 水果管家</div></el-col>
        <el-col :span="3"><div class="nav-item" @click="gotoFacility">🍌 设施</div></el-col>
        <el-col :span="3"><div class="nav-item" @click="gotInvocing">🍎 进销管理</div></el-col>
        <el-col :span="3"><div class="nav-item" @click="gotoFruitFresh">🍊 水果健康监控</div></el-col>
        <el-col :span="3"><div class="nav-item active">🍍 健康报告</div></el-col>
        <el-col :span="3"><div class="nav-item" @click="gotoBuy">🍇 销售</div></el-col>
        <el-col :span="3"><div class="nav-item" @click="gotoFruitClass">🍉 水果种类</div></el-col>
        <el-col :span="3"><div class="nav-item" @click="gotoMember">🍋 员工管理</div></el-col>
    </el-row>

    <div class="report-container">
        <el-row :gutter="20" class="filter-row">
            <el-col :span="6">
                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="fruit-date-picker"
                    @change="fetchReportData"
                />
            </el-col>
            <el-col :span="6">
                <el-select
                    v-model="selectedFruit"
                    placeholder="选择水果种类"
                    clearable
                    class="fruit-select"
                    @change="fetchReportData"
                >
                    <el-option
                        v-for="fruit in fruitOptions"
                        :key="fruit.id"
                        :label="fruit.fruitName"
                        :value="fruit.id"
                    />
                </el-select>
            </el-col>
            <el-col :span="6">
                <el-button 
                    type="primary" 
                    @click="fetchReportData" 
                    class="fruit-button"
                >
                    🍏 生成报告
                </el-button>
            </el-col>
        </el-row>

        <!-- 柱状图展示 -->
        <div class="chart-container">
            <div ref="barChart" style="width: 100%; height: 400px;"></div>
        </div>

        <!-- 表格数据 -->
        <div class="table-container">
            <el-table
                :data="reportData"
                align="center"
                class="fruit-table"
                :default-sort="{prop: 'date', order: 'descending'}"
                style="width: 100%"
            >
                <el-table-column
                    prop="fruitName"
                    label="水果种类"
                    sortable
                    width="180"
                />
                <el-table-column
                    prop="date"
                    label="日期"
                    sortable
                    width="180"
                    :formatter="formatDate"
                />
                <el-table-column
                    prop="avgHealthScore"
                    label="平均健康度"
                    sortable
                    width="180"
                >
                    <template #default="scope">
                        <el-rate
                            :model-value="getHealthScore(scope.row.avgHealthScore)"
                            disabled
                            :max="5"
                            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                        />
                        <span class="score-text">{{ getHealthScore(scope.row.avgHealthScore) }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="saleQuantity"
                    label="销量(kg)"
                    sortable
                    width="180"
                />
                <el-table-column
                    prop="saleAmount"
                    label="销售额(元)"
                    sortable
                    width="180"
                />
                <el-table-column
                    prop="spoilageRate"
                    label="损坏率(%)"
                    sortable
                    width="180"
                >
                    <template #default="scope">
                        <span :class="{'warning-text': scope.row.spoilageRate > 10}">
                            {{ scope.row.spoilageRate }}%
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import axiosInstance from '../axiosInstance';
import config from '../config';

const router = useRouter();

// 导航相关
const gotoFruitClass = () => router.push('/fruitclass');
const gotoBuy = () => router.push('/buy');
const gotoFacility = () => router.push('/facility');
const gotoFruitFresh = () => router.push('/fruitFreshNess');
const gotInvocing = () => router.push('/invocing');
const gotoMember = () => router.push('/member');

// 数据相关
const dateRange = ref([]);
const selectedFruit = ref(null);
const fruitOptions = ref([
    { id: 1, fruitName: '苹果' },
    { id: 2, fruitName: '香蕉' },
    { id: 3, fruitName: '橙子' },
    { id: 4, fruitName: '草莓' },
    { id: 5, fruitName: '葡萄' }
]);

const reportData = ref([]);
const loading = ref(false);
const barChart = ref(null);
let chartInstance = null;

// 处理健康度评分
const getHealthScore = (score) => {
    const num = Number(score);
    return isNaN(num) ? 0 : Math.min(Math.max(num, 0), 5);
};

// 按日期分组的数据
const dateGroupedData = computed(() => {
    const grouped = {};
    reportData.value.forEach(item => {
        const dateStr = item.date;
        if (!grouped[dateStr]) {
            grouped[dateStr] = {
                date: dateStr,
                fruits: []
            };
        }
        grouped[dateStr].fruits.push(item);
    });
    
    // 按日期排序（降序）
    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 获取报表数据
const fetchReportData = async () => {
    loading.value = true;
    
    try {
        const selectedFruitName = fruitOptions.value.find(f => f.id === selectedFruit.value)?.fruitName;
        
        const response = await axiosInstance.get(`${config.backendUrl}/fruit/fruit-health`, {
            params: {
                fruitName: selectedFruitName,
                startDate: dateRange.value[0]?.toISOString().split('T')[0],
                endDate: dateRange.value[1]?.toISOString().split('T')[0]
            }
        });
        
        if (response.data.success) {
            // 确保健康度为数值类型
            reportData.value = (response.data.content || []).map(item => ({
                ...item,
                avgHealthScore: getHealthScore(item.avgHealthScore),
                spoilageRate: Number(item.spoilageRate) || 0,
                saleQuantity: Number(item.saleQuantity) || 0,
                saleAmount: Number(item.saleAmount) || 0
            }));
            ElMessage.success('数据加载成功');
            updateChart();
        } else {
            ElMessage.error(response.data.message || '获取数据失败');
        }
    } catch (error) {
        console.error('请求错误:', error);
        ElMessage.error('数据加载失败');
    } finally {
        loading.value = false;
    }
};

// 日期格式化
const formatDate = (row, column) => {
    const date = new Date(row[column.property]);
    return isNaN(date.getTime()) ? row[column.property] : date.toLocaleDateString();
};

const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 初始化图表
const initChart = () => {
    if (barChart.value) {
        chartInstance = echarts.init(barChart.value);
        updateChart();
    }
};

// 更新图表数据
const updateChart = () => {
    if (!chartInstance || !reportData.value.length) return;

    // 按水果种类分组数据
    const fruitGroups = {};
    reportData.value.forEach(item => {
        if (!fruitGroups[item.fruitName]) {
            fruitGroups[item.fruitName] = [];
        }
        fruitGroups[item.fruitName].push(item);
    });

    // 准备图表数据
    const dates = [...new Set(reportData.value.map(item => formatDateLabel(item.date)))];
    const series = [];
    const fruits = Object.keys(fruitGroups);

    fruits.forEach(fruit => {
        const fruitData = fruitGroups[fruit];
        const data = dates.map(date => {
            const item = fruitData.find(d => formatDateLabel(d.date) === date);
            return item ? getHealthScore(item.avgHealthScore) : 0;
        });

        series.push({
            name: fruit,
            type: 'bar',
            data: data,
            barWidth: '40%',
            itemStyle: {
                color: getHealthColorForChart(fruit)
            },
            label: {
                show: true,
                position: 'top',
                formatter: function(params) {
                    return params.value > 0 ? params.value.toFixed(1) : '';
                }
            }
        });
    });

    const option = {
        title: {
            text: '水果健康度对比',
            left: 'center',
            textStyle: {
                color: '#5a3e36',
                fontSize: 18,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: fruits,
            top: 30,
            textStyle: {
                color: '#5a3e36'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
            top: 80
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: {
                lineStyle: {
                    color: '#5a3e36'
                }
            },
            axisLabel: {
                color: '#5a3e36'
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 5,
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#5a3e36'
                }
            },
            axisLabel: {
                color: '#5a3e36',
                formatter: '{value}'
            },
            splitLine: {
                lineStyle: {
                    color: '#f0f0f0'
                }
            }
        },
        series: series
    };

    chartInstance.setOption(option);
};

// 获取水果对应的颜色
const getHealthColorForChart = (fruitName) => {
    const colors = {
        '苹果': '#ff4d4f',  // 红色
        '香蕉': '#fadb14',  // 黄色
        '橙子': '#fa8c16',  // 橙色
        '草莓': '#eb2f96',  // 粉色
        '葡萄': '#722ed1'   // 紫色
    };
    return colors[fruitName] || '#52c41a'; // 默认绿色
};

onMounted(() => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 2);
    dateRange.value = [startDate, endDate];
    fetchReportData();
    
    nextTick(() => {
        initChart();
    });
});

// 监听窗口大小变化，重新调整图表大小
window.addEventListener('resize', () => {
    if (chartInstance) {
        chartInstance.resize();
    }
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

/* 报表容器 */
.report-container {
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 筛选行 */
.filter-row {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

/* 图表容器 */
.chart-container {
    margin-bottom: 30px;
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 表格容器 */
.table-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

/* 表格星星组件样式 */
.fruit-table .el-rate {
    display: inline-block;
    vertical-align: middle;
    margin-right: 8px;
}

.fruit-table .el-rate__icon {
    font-size: 14px;
}

.score-text {
    display: inline-block;
    vertical-align: middle;
    color: #5a3e36;
    font-weight: bold;
}

/* 警告文本 */
.warning-text {
    color: #e74c3c;
    font-weight: bold;
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

/* 日期选择器 */
.fruit-date-picker {
    width: 100%;
}

/* 下拉选择 */
.fruit-select {
    width: 100%;
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
    
    .filter-row .el-col {
        margin-bottom: 10px;
    }
}
</style>