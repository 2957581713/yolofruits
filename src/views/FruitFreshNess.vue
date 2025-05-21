<template>
  <!-- 导航栏 -->
  <el-row class="fruit-nav">
    <el-col :span="3"><div class="nav-item nav-logo">🍓 您的水果管家</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="gotoFacility">🍌 设施</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="gotInvocing">🍎 进销管理</div></el-col>
    <el-col :span="3"><div class="nav-item active" @click="gotoFruitFresh">🍊 水果健康监控</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="router.push('/caculte')">🍍 健康报告</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="gotoBuy">🍇 销售</div></el-col>
    <el-col :span="3"><div class="nav-item " @click="gotoFruitClass">🍉 水果种类</div></el-col>
    <el-col :span="3"><div class="nav-item" @click="gotoMember">🍋 员工管理</div></el-col>
  </el-row>

  <!-- 摄像头权限提示 -->
  <div v-if="!hasCameraPermission" class="permission-prompt">
    <el-card class="permission-card">
      <div class="permission-content">
        <el-icon class="permission-icon"><camera-filled /></el-icon>
        <h3>需要摄像头权限</h3>
        <p>请允许访问摄像头以使用此功能</p>
        <el-button 
          type="primary" 
          @click="requestCameraPermission"
        >
          授予权限
        </el-button>
      </div>
    </el-card>
  </div>

  <!-- 摄像头设备选择 -->
  <div v-else class="camera-selection">
    <el-card class="camera-card">
      <template #header>
        <div class="card-header">
          <span>摄像头设备管理</span>
          <el-button type="primary" size="small" @click="refreshDevices">刷新设备</el-button>
        </div>
      </template>
      <div v-if="devices.length > 0">
        <div v-for="(device, index) in devices" :key="device.deviceId" class="device-item">
          <div class="device-info">
            <span>摄像头 {{ index + 1 }}: {{ device.label || `摄像头 ${index + 1}` }}</span>
            <!-- 修改为下拉选择器 -->
            <el-select
              v-model="device.containerId"
              placeholder="请选择展柜"
              style="width: 200px; margin-left: 10px;"
            >
              <el-option
                v-for="container in containerList"
                :key="container.id"
                :label="container.name"
                :value="container.id"
              />
            </el-select>
          </div>
          <div class="device-actions">
            <el-button 
              type="primary" 
              size="small" 
              @click="startSingleCamera(device)"
              :disabled="activeCameras.includes(device.deviceId)"
            >
              开启
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="stopSingleCamera(device.deviceId)"
              :disabled="!activeCameras.includes(device.deviceId)"
            >
              关闭
            </el-button>
          </div>
        </div>
      </div>
      <div v-else class="no-devices">
        未检测到摄像头设备
      </div>
    </el-card>
  </div>

  <!-- 摄像头控制区域 -->
  <div v-if="hasCameraPermission" class="camera-control">
    <el-input-number v-model="captureIntervalTime" :min="1" :max="3600" label="截取间隔(秒)" />
    <el-button 
      type="success" 
      @click="startTimedCapture" 
      :disabled="activeCameras.length === 0 || isTimedCapturing"
    >
      开始定时截取
    </el-button>
    <el-button 
      type="danger" 
      @click="stopTimedCapture" 
      :disabled="!isTimedCapturing"
    >
      停止定时截取
    </el-button>
    <div v-if="isTimedCapturing" class="capture-progress">
      定时任务已启动，下一次执行时间: {{ nextExecutionTime }}
    </div>
  </div>

  <!-- 摄像头视图区域 -->
  <div v-if="hasCameraPermission" class="cameras-container">
    <div v-for="camera in activeCamerasData" :key="camera.deviceId" class="camera-wrapper">
      <div class="camera-header">
        <span>{{ camera.label || '摄像头' }} (展柜: {{ getContainerName(camera.containerId) || '未设置' }})</span>
        <span class="camera-status" :class="{ 'status-ok': camera.status === 'active', 'status-error': camera.status === 'error', 'status-capturing': camera.status === 'capturing' }">
          {{ getCameraStatusText(camera.status) }}
        </span>
      </div>
      <video 
        :ref="el => setVideoRef(el, camera.deviceId)" 
        autoplay 
        playsinline 
        class="camera-view"
        @loadedmetadata="onVideoLoadedMetadata(el, camera.deviceId)"
        @error="onVideoError(el, camera.deviceId, $event)"
      ></video>
      <div class="camera-capture-control">
        <el-button 
          type="primary" 
          size="small" 
          @click="startSingleCameraCapture(camera.deviceId)"
          :disabled="!activeCameras.includes(camera.deviceId) || isTimedCapturing || camera.status !== 'active'"
        >
          单独截取
        </el-button>
        <span class="capture-status">
          {{ getCaptureStatus(camera.deviceId) }}
        </span>
      </div>
      <div class="captured-frames">
        <div v-for="(frame, index) in getFramesForCamera(camera.deviceId)" :key="index" class="frame-item">
          <img :src="frame.dataUrl" alt="截图" class="frame-image">
          <span class="frame-time">第{{ index + 1 }}帧 - {{ frame.timestamp }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 上传区域 -->
  <div v-if="hasCameraPermission" class="upload-section">
    <el-upload
      class="upload-demo fruit-upload"
      drag
      :action="uploadUrl"
      multiple
      :before-upload="beforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="image"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持jpg/png格式，大小不超过500kb
        </div>
      </template>
    </el-upload>

    <div v-if="imageUrl" class="result-container">
      <h3>检测结果：</h3>
      <img :src="imageUrl" alt="上传的图片" class="uploaded-image">
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElLoading } from 'element-plus';
import { UploadFilled, CameraFilled } from '@element-plus/icons-vue';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '../axiosInstance';
import config from '../config';

const router = useRouter();

// 上传URL
const uploadUrl = ref('http://localhost:8000/yolo/yolo/business/detectVideo');

// 用于存储图片地址的响应式变量
const imageUrl = ref(null);

// 展柜列表
const containerList = ref([]);

// 摄像头相关变量
const devices = ref([]);
const videoRefs = ref({});
const activeCameras = ref([]);
const activeCamerasData = ref([]);
const isTimedCapturing = ref(false);
const captureIntervalTime = ref(300); // 自定义截取间隔时间，默认5分钟(300秒)
const capturedFrames = ref({}); // 按设备ID存储
const streams = ref({});
const hasCameraPermission = ref(false);

// 定时捕获相关变量
let timedCaptureTimer = null;
const nextExecutionTime = ref('');
const totalFramesPerCapture = ref(10); // 每次捕获的总帧数
const frameInterval = ref(1000); // 帧之间的间隔，单位毫秒
let currentCaptureProcess = null; // 当前捕获进程

// 获取展柜列表
const fetchContainerList = async () => {
  try {
    const response = await axiosInstance.get(config.backendUrl + '/container/getAllIndex');
    if (response.data.success) {
      containerList.value = response.data.content || [];
      console.log('展柜列表获取成功:', containerList.value);
    } else {
      ElMessage.error(response.data.message || '获取展柜列表失败');
    }
  } catch (error) {
    handleRequestError(error, '获取展柜列表失败');
  }
};

// 通过ID获取展柜名称
const getContainerName = (containerId) => {
  if (!containerId) return null;
  const container = containerList.value.find(c => c.id === containerId);
  return container ? container.name : '未知展柜';
};

// 初始化函数
const init = async () => {
  try {
    // 检查摄像头权限
    const permissionStatus = await navigator.permissions.query({ name: 'camera' });
    
    if (permissionStatus.state === 'granted') {
      hasCameraPermission.value = true;
      await getDevices();
    } else if (permissionStatus.state === 'prompt') {
      hasCameraPermission.value = false;
    } else if (permissionStatus.state === 'denied') {
      hasCameraPermission.value = false;
      ElMessage.error('摄像头权限被拒绝，请在浏览器设置中授予权限');
    }
    
    // 监听权限变化
    permissionStatus.onchange = () => {
      if (permissionStatus.state === 'granted') {
        hasCameraPermission.value = true;
        getDevices();
      } else {
        hasCameraPermission.value = false;
      }
    };
    
    // 获取展柜列表
    await fetchContainerList();
  } catch (error) {
    console.error('Error checking camera permission:', error);
    // 无法查询权限状态，尝试直接获取设备
    requestCameraPermission();
  }
};

// 请求摄像头权限
const requestCameraPermission = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true });
    hasCameraPermission.value = true;
    await getDevices();
    ElMessage.success('摄像头权限已获取');
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    hasCameraPermission.value = false;
    
    if (error.name === 'NotAllowedError') {
      ElMessage.error('请在浏览器设置中授予摄像头权限');
    } else {
      ElMessage.error(`无法访问摄像头: ${error.message}`);
    }
  }
};

// 获取摄像头设备列表
const getDevices = async () => {
  try {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = mediaDevices
      .filter(device => device.kind === 'videoinput')
      .map(device => ({
        deviceId: device.deviceId,
        label: device.label,
        containerId: null, // 改为存储展柜ID
        groupId: device.groupId,
        status: 'inactive'
      }));
    
    devices.value = videoDevices;
    
    if (videoDevices.length === 0) {
      ElMessage.warning('未检测到摄像头设备');
    } else {
      console.log(`检测到 ${videoDevices.length} 个摄像头设备`);
    }
  } catch (error) {
    console.error('Error enumerating devices:', error);
    ElMessage.error('获取设备列表失败: ' + error.message);
  }
};

// 刷新设备列表
const refreshDevices = async () => {
  // 先停止所有摄像头
  stopAllCameras();
  // 然后刷新设备列表
  await getDevices();
  ElMessage.success('设备列表已刷新');
};

// 开启单个摄像头
const startSingleCamera = async (device) => {
  try {
    if (activeCameras.value.includes(device.deviceId)) return;
    
    // 针对不同摄像头设置不同约束
    const constraints = getCameraConstraints(device.deviceId);
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streams.value[device.deviceId] = stream;
    
    // 找到对应的video元素
    if (videoRefs.value[device.deviceId]) {
      videoRefs.value[device.deviceId].srcObject = stream;
      
      // 更新设备状态
      const updatedDevices = activeCamerasData.value.map(cam => {
        if (cam.deviceId === device.deviceId) {
          return { ...cam, status: 'active' };
        }
        return cam;
      });
      
      activeCamerasData.value = updatedDevices;
    }
    
    activeCameras.value.push(device.deviceId);
    
    // 更新设备状态
    const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === device.deviceId);
    if (deviceIndex === -1) {
      activeCamerasData.value.push({ ...device, status: 'active' });
    } else {
      activeCamerasData.value[deviceIndex].status = 'active';
    }
    
    capturedFrames.value[device.deviceId] = [];
    
    ElMessage.success(`摄像头 ${device.label || device.deviceId} 已开启`);
  } catch (error) {
    console.error(`Error accessing camera ${device.deviceId}:`, error);
    
    // 更新设备状态为错误
    const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === device.deviceId);
    if (deviceIndex !== -1) {
      activeCamerasData.value[deviceIndex].status = 'error';
    }
    
    ElMessage.error(`无法访问摄像头 ${device.label || device.deviceId}: ${error.message}`);
  }
};

// 获取摄像头约束参数
const getCameraConstraints = (deviceId) => {
  // 检查是否为内置摄像头（通常包含'webcam'、'integrated'等关键词）
  const isBuiltInCamera = deviceId.includes('webcam') || deviceId.includes('integrated');
  
  if (isBuiltInCamera) {
    // 内置摄像头优化设置
    return {
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      }
    };
  } else {
    // 外接摄像头优化设置
    return {
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      }
    };
  }
};

// 关闭单个摄像头
const stopSingleCamera = (deviceId) => {
  if (streams.value[deviceId]) {
    streams.value[deviceId].getTracks().forEach(track => track.stop());
    delete streams.value[deviceId];
  }
  
  if (videoRefs.value[deviceId]) {
    videoRefs.value[deviceId].srcObject = null;
  }
  
  activeCameras.value = activeCameras.value.filter(id => id !== deviceId);
  
  // 更新设备状态
  const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === deviceId);
  if (deviceIndex !== -1) {
    activeCamerasData.value[deviceIndex].status = 'inactive';
  }
  
  // 如果正在捕获，停止该摄像头的捕获
  if (currentCaptureProcess && activeCamerasData.value[currentCaptureProcess.currentCameraIndex].deviceId === deviceId) {
    stopTimedCapture();
  }
  
  ElMessage.success('摄像头已关闭');
};

// 停止所有摄像头
const stopAllCameras = () => {
  Object.keys(streams.value).forEach(deviceId => {
    streams.value[deviceId].getTracks().forEach(track => track.stop());
    if (videoRefs.value[deviceId]) {
      videoRefs.value[deviceId].srcObject = null;
    }
    
    // 更新设备状态
    const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === deviceId);
    if (deviceIndex !== -1) {
      activeCamerasData.value[deviceIndex].status = 'inactive';
    }
  });
  
  streams.value = {};
  activeCameras.value = [];
  
  // 停止所有捕获
  stopTimedCapture();
  
  ElMessage.success('所有摄像头已关闭');
};

// 设置video引用
const setVideoRef = (el, deviceId) => {
  if (el) {
    videoRefs.value[deviceId] = el;
  }
};

// 视频元数据加载完成事件处理
const onVideoLoadedMetadata = (el, deviceId) => {
  if (el && videoRefs.value[deviceId]) {
    console.log(`Video metadata loaded for device ${deviceId}`, el.videoWidth, el.videoHeight);
    
    // 获取视频的实际宽高
    const videoWidth = el.videoWidth;
    const videoHeight = el.videoHeight;
    
    // 如果获取到了有效的宽高，则设置视频元素的尺寸
    if (videoWidth && videoHeight) {
      el.style.width = '100%';
      el.style.height = 'auto';
      
      // 计算保持比例的高度
      const containerWidth = el.parentElement.clientWidth;
      const ratio = videoHeight / videoWidth;
      el.style.height = `${containerWidth * ratio}px`;
      
      // 更新设备状态
      const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === deviceId);
      if (deviceIndex !== -1) {
        activeCamerasData.value[deviceIndex].status = 'active';
      }
    }
  }
};

// 视频错误处理
const onVideoError = (el, deviceId, event) => {
  console.error(`Video error for device ${deviceId}:`, event);
  
  // 更新设备状态
  const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === deviceId);
  if (deviceIndex !== -1) {
    activeCamerasData.value[deviceIndex].status = 'error';
    
    // 如果是当前正在捕获的摄像头，停止捕获
    if (currentCaptureProcess && currentCaptureProcess.currentCameraIndex === deviceIndex) {
      stopTimedCapture();
      ElMessage.error(`摄像头 ${activeCamerasData.value[deviceIndex].label || deviceId} 发生错误，已停止定时截取`);
    }
  }
};

// 获取摄像头状态文本
const getCameraStatusText = (status) => {
  switch (status) {
    case 'active':
      return '已连接';
    case 'inactive':
      return '未连接';
    case 'error':
      return '错误';
    case 'capturing':
      return '正在截取';
    default:
      return '未知';
  }
};

// 开始单个摄像头的捕获
const startSingleCameraCapture = (deviceId) => {
  const cameraData = activeCamerasData.value.find(cam => cam.deviceId === deviceId);
  if (!cameraData) return;
  
  if (!cameraData.containerId) {
    ElMessage.warning('请先选择展柜');
    return;
  }
  
  if (cameraData.status !== 'active') {
    ElMessage.warning('摄像头状态异常，无法开始截取');
    return;
  }
  
  // 更新摄像头状态
  const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === deviceId);
  if (deviceIndex !== -1) {
    activeCamerasData.value[deviceIndex].status = 'capturing';
  }
  
  capturedFrames.value[deviceId] = [];
  let frameCount = 0;
  
  // 使用固定的帧间隔
  const startCapture = () => {
    if (frameCount >= totalFramesPerCapture.value) {
      clearInterval(frameTimer);
      
      // 更新摄像头状态
      const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === deviceId);
      if (deviceIndex !== -1) {
        activeCamerasData.value[deviceIndex].status = 'active';
      }
      
      // 发送所有帧到后端
      sendAllFramesToBackend(deviceId, cameraData.containerId);
      
      ElMessage.success(`摄像头 ${cameraData.label || deviceId} 已成功截取${totalFramesPerCapture.value}帧图像`);
      return;
    }
    
    captureFrame(deviceId, cameraData.containerId);
    frameCount++;
  };
  
  // 立即截取第一帧
  startCapture();
  
  // 之后每隔固定时间截取一帧
  frameTimer = setInterval(startCapture, frameInterval.value);
};

// 开始定时捕获
const startTimedCapture = () => {
  if (activeCameras.value.length === 0) {
    ElMessage.warning('没有活动的摄像头');
    return;
  }
  
  // 检查所有摄像头是否都设置了展柜ID
  const hasMissingContainerId = activeCamerasData.value.some(cam => !cam.containerId);
  if (hasMissingContainerId) {
    ElMessage.warning('请为所有摄像头选择展柜');
    return;
  }
  
  // 检查所有摄像头状态是否正常
  const hasInactiveCamera = activeCamerasData.value.some(cam => cam.status !== 'active');
  if (hasInactiveCamera) {
    ElMessage.warning('存在状态异常的摄像头，无法开始定时截取');
    return;
  }
  
  isTimedCapturing.value = true;
  
  // 重置所有摄像头的帧数据
  activeCamerasData.value.forEach(camera => {
    capturedFrames.value[camera.deviceId] = [];
  });
  
  // 立即执行一次捕获
  executeTimedCapture();
  
  // 设置定时器，按指定间隔执行捕获
  timedCaptureTimer = setInterval(executeTimedCapture, captureIntervalTime.value * 1000);
  
  // 更新下一次执行时间
  updateNextExecutionTime();
  
  ElMessage.success(`已启动定时截取任务，每隔 ${captureIntervalTime.value} 秒执行一次`);
};

// 执行定时捕获
const executeTimedCapture = async () => {
  // 重置所有摄像头的帧数据
  activeCamerasData.value.forEach(camera => {
    capturedFrames.value[camera.deviceId] = [];
  });
  
  // 按顺序处理每个摄像头
  await processAllCameras();
  
  // 更新下一次执行时间
  updateNextExecutionTime();
};

// 处理所有摄像头
const processAllCameras = async () => {
  let currentIndex = 0;
  
  const processNextCamera = async () => {
    if (currentIndex >= activeCamerasData.value.length) {
      // 所有摄像头处理完毕
      return;
    }
    
    const currentCamera = activeCamerasData.value[currentIndex];
    
    // 更新摄像头状态
    const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === currentCamera.deviceId);
    if (deviceIndex !== -1) {
      activeCamerasData.value[deviceIndex].status = 'capturing';
    }
    
    // 记录当前捕获进程
    currentCaptureProcess = {
      currentCameraIndex: currentIndex,
      frameCount: 0
    };
    
    // 捕获指定数量的帧
    await captureFramesForCamera(currentCamera.deviceId, currentCamera.containerId);
    
    // 更新摄像头状态
    const updatedDeviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === currentCamera.deviceId);
    if (updatedDeviceIndex !== -1) {
      activeCamerasData.value[updatedDeviceIndex].status = 'active';
    }
    
    // 处理下一个摄像头
    currentIndex++;
    await processNextCamera();
  };
  
  await processNextCamera();
};

// 为单个摄像头捕获指定数量的帧
const captureFramesForCamera = (deviceId, containerId) => {
  return new Promise((resolve) => {
    let frameCount = 0;
    
    const captureNextFrame = () => {
      if (frameCount >= totalFramesPerCapture.value) {
        // 发送所有帧到后端
        sendAllFramesToBackend(deviceId, containerId);
        resolve();
        return;
      }
      
      captureFrame(deviceId, containerId);
      frameCount++;
      
      // 更新当前捕获进程
      if (currentCaptureProcess) {
        currentCaptureProcess.frameCount = frameCount;
      }
      
      // 等待指定间隔后捕获下一帧
      setTimeout(captureNextFrame, frameInterval.value);
    };
    
    // 立即开始捕获第一帧
    captureNextFrame();
  });
};

// 停止定时捕获
const stopTimedCapture = () => {
  if (timedCaptureTimer) {
    clearInterval(timedCaptureTimer);
    timedCaptureTimer = null;
  }
  
  // 重置所有摄像头状态
  activeCamerasData.value.forEach(camera => {
    if (camera.status === 'capturing') {
      const deviceIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === camera.deviceId);
      if (deviceIndex !== -1) {
        activeCamerasData.value[deviceIndex].status = 'active';
      }
    }
  });
  
  currentCaptureProcess = null;
  isTimedCapturing.value = false;
  nextExecutionTime.value = '';
  
  ElMessage.success('已停止定时截取任务');
};

// 更新下一次执行时间
const updateNextExecutionTime = () => {
  if (!isTimedCapturing.value) {
    nextExecutionTime.value = '';
    return;
  }
  
  const nextTime = new Date(Date.now() + captureIntervalTime.value * 1000);
  nextExecutionTime.value = nextTime.toLocaleTimeString();
};

// 截取单帧
const captureFrame = (deviceId, containerId) => {
  const video = videoRefs.value[deviceId];
  if (!video) return;
  
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const frameData = canvas.toDataURL('image/jpeg');
    const timestamp = new Date().toLocaleTimeString();
    
    // 保存帧数据
    if (!capturedFrames.value[deviceId]) {
      capturedFrames.value[deviceId] = [];
    }
    
    capturedFrames.value[deviceId].push({
      dataUrl: frameData,
      timestamp: timestamp,
      containerId: containerId // 保存展柜ID
    });
    
  } catch (error) {
    console.error('Error capturing frame:', error);
    ElMessage.error('截取图像失败');
  }
};

// 发送所有帧到后端
const sendAllFramesToBackend = async (deviceId, containerId) => {
  const frames = capturedFrames.value[deviceId] || [];
  
  if (frames.length === 0) {
    console.log('No frames to send for device', deviceId);
    return;
  }
  
  // 创建一个包含所有帧的表单数据
  const formData = new FormData();
  
  // 添加展柜ID参数
  formData.append('containerId', containerId);
  
  // 添加摄像头索引参数
  const cameraIndex = activeCamerasData.value.findIndex(cam => cam.deviceId === deviceId);
  formData.append('index', cameraIndex);
  
  // 添加所有图像
  frames.forEach((frame, index) => {
    const blob = dataURLtoBlob(frame.dataUrl);
    formData.append('images', blob, `capture_${containerId}_${index}.jpg`);
  });
  
  const loading = ElLoading.service({
    text: `正在上传展柜 ${getContainerName(containerId)} 的图像...`,
    background: 'rgba(0, 0, 0, 0.7)'
  });
  
  // 使用axios发送请求
  try {
    const response = await axiosInstance.post(uploadUrl.value, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data.success) {
      console.log(`展柜 ${containerId} 上传成功:`, response.data);
      ElMessage.success(`展柜 ${getContainerName(containerId)} 的图像已成功上传`);
    } else {
      ElMessage.error(response.data.message || '上传失败');
    }
  } catch (error) {
    handleRequestError(error, '上传失败');
  } finally {
    loading.close();
  }
};

// base64转Blob
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// 获取指定摄像头的帧
const getFramesForCamera = (deviceId) => {
  return capturedFrames.value[deviceId] || [];
};

// 获取摄像头捕获状态
const getCaptureStatus = (deviceId) => {
  const frames = capturedFrames.value[deviceId] || [];
  const camera = activeCamerasData.value.find(cam => cam.deviceId === deviceId);
  
  if (camera && camera.status === 'capturing') {
    if (currentCaptureProcess && currentCaptureProcess.currentCameraIndex === activeCamerasData.value.findIndex(c => c.deviceId === deviceId)) {
      return `正在截取 (${currentCaptureProcess.frameCount}/${totalFramesPerCapture.value})`;
    }
    return `正在截取 (${frames.length}/${totalFramesPerCapture.value})`;
  } else if (frames.length > 0) {
    return `已截取 ${frames.length} 帧`;
  }
  
  return '';
};

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt500KB = file.size / 1024 < 500;

  if (!isImage) {
    ElMessage.error('只能上传JPG/PNG格式的图片!');
  }
  if (!isLt500KB) {
    ElMessage.error('图片大小不能超过500KB!');
  }
  
  return isImage && isLt500KB;
};

// 处理文件上传成功的回调函数
const handleUploadSuccess = (response, file, fileList) => {
  try {
    // 尝试解析JSON响应
    const data = typeof response === 'string' ? JSON.parse(response) : response;
    
    if (data.success) {
      imageUrl.value = data.content;
      ElMessage.success('文件上传成功，检测结果已展示');
    } else {
      ElMessage.error(data.message || '上传失败');
    }
  } catch (error) {
    console.error('解析上传响应失败:', error);
    ElMessage.error('上传失败，无法解析响应');
  }
};

// 处理上传错误
const handleUploadError = (error) => {
  handleRequestError(error, '上传失败');
};

// 统一处理请求错误
const handleRequestError = (error, defaultMessage) => {
  console.error('请求错误:', error);
  
  if (error.response) {
    // 服务器返回了错误状态码
    const errorMessage = error.response.data?.message || 
                        `请求失败，状态码: ${error.response.status}`;
    ElMessage.error(errorMessage);
  } else if (error.request) {
    // 请求已发送，但没有收到响应
    ElMessage.error('没有收到服务器响应');
  } else {
    // 请求设置时出错
    ElMessage.error(defaultMessage || '请求发生错误');
  }
};

// 导航相关
const gotoFruitClass = () => {
  router.push('/fruitclass');
};
const gotoBuy = () => {
  router.push('/buy');
};
const gotoMember = () => router.push('/member');
const gotoFacility = () => {
  router.push('/facility');
};
const gotoFruitFresh = () => {
  router.push('/fruitFreshNess');
};
const gotInvocing = () => {
  router.push('/invocing');
};

// 组件挂载时初始化
onMounted(() => {
  init();
});

// 组件卸载时清理
onUnmounted(() => {
  stopTimedCapture();
  stopAllCameras();
});
</script>

<style scoped>
/* 样式部分保持不变 */
/* 整体背景 */
:deep(.el-main) {
  background-color: #fff8f0;
  padding: 20px;
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

/* 权限提示样式 */
.permission-prompt {
  display: flex;
  justify-content: center;
  margin: 50px 0;
}

.permission-card {
  width: 400px;
  text-align: center;
  padding: 30px;
}

.permission-icon {
  font-size: 60px;
  color: #ff9a9e;
  margin-bottom: 20px;
}

.permission-content h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.permission-content p {
  color: #666;
  margin-bottom: 20px;
}

/* 设备管理区域 */
.camera-selection {
  margin-bottom: 20px;
}

.camera-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.device-info {
  display: flex;
  align-items: center;
}

.device-actions {
  display: flex;
  gap: 10px;
}

.no-devices {
  padding: 20px;
  text-align: center;
  color: #999;
}

/* 控制区域样式 */
.camera-control {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  align-items: center;
}

.capture-progress {
  margin-left: 20px;
  padding: 5px 10px;
  background-color: #e6ffea;
  color: #52c41a;
  border-radius: 4px;
  font-size: 14px;
}

/* 摄像头视图区域 */
.cameras-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.camera-wrapper {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.camera-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 10px;
  color: #5a3e36;
}

.camera-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-ok {
  background-color: #e6ffea;
  color: #52c41a;
}

.status-error {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.status-capturing {
  background-color: #fff7e6;
  color: #fa8c16;
}

.camera-view {
  width: 100%;
  border-radius: 8px;
  background-color: #000;
  object-fit: cover;
  margin-bottom: 10px;
}

.camera-capture-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.capture-status {
  font-size: 12px;
  color: #666;
}

/* 截图区域样式 */
.captured-frames {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.frame-item {
  position: relative;
  width: 120px;
  height: 90px;
  transition: all 0.3s ease;
}

.frame-item:hover {
  transform: scale(1.05);
  z-index: 1;
}

.frame-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.frame-time {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 2px 0;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 上传区域样式 */
.upload-section {
  display: flex;
  gap: 30px;
  margin-top: 30px;
}

.fruit-upload {
  flex: 1;
  border: 2px dashed #f8a5c2;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.8);
  max-width: 400px;
}

.fruit-upload:hover {
  border-color: #e74c3c;
  background-color: rgba(255, 255, 255, 0.9);
}

.fruit-upload .el-icon--upload {
  font-size: 40px;
  color: #f8a5c2;
  margin-bottom: 10px;
}

.fruit-upload .el-upload__text {
  font-size: 16px;
  color: #5a3e36;
}

.fruit-upload .el-upload__tip {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}

/* 结果容器样式 */
.result-container {
  flex: 1;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.result-container h3 {
  color: #5a3e36;
  margin-bottom: 15px;
}

/* 上传图片样式 */
.uploaded-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: block;
  margin: 0 auto;
}
</style>  