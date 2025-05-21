import axios from 'axios';

let router;

export const setRouter = (r) => {
  router = r;
};

const instance = axios.create({
  baseURL: 'http://localhost:8000/admin', // 替换为实际的 API 基础 URL
  timeout: 10000
});


// 请求拦截器
instance.interceptors.request.use(
  config => {
    // localStorage.removeItem('token');
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (router) {
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);



export const getAuditBusinessList = (params) =>{
  return instance({
      url: '/business/getAuditBusinessList',
      method: 'get',
      params: params
  });
}
export const passAuditBusiness = (id) =>{
  return instance({
      url: '/business/passAuditBusiness',
      method: 'post',
      data: id
  });
}

export const rejectAuditBusiness = (data) =>{
  return instance({
      url:'/business/rejectAuditBusiness',
      method:'post',
      data:data
  });
}



// 商户信息接口
export const getBusinessList = (params) => {
  return instance({
    url: '/business/list',
    method: 'get',
    params
  });
};

export const addBusiness = (data) => {
  return instance({
    url: '/business',
    method: 'post',
    data
  });
};

export const getDatasetList  = (data) => {
  return instance({
    url: '/data/getDataList',
    method: 'post',
    data:data
  });
};
export const uploadDataset   = (data) => {
  
};
export const downloadDataset   = (params) => {
  return instance({
    url: '/data/downloadDirectoryAsZip',
    method: 'get',
    params: params,
    responseType: 'blob'
  });
  
};
export const deleteDataset   = (data) => {
  
};


export const updateBusiness = (data) => {
  return instance({
    url: '/business',
    method: 'put',
    data
  });
};

export const deleteBusiness = (id) => {
  return instance({
    url: `/business/${id}`,
    method: 'delete'
  });
};

// 员工信息接口
export const getMemberList = (params) => {
  return instance({
    url: '/business-member/list',
    method: 'get',
    params
  });
};

export const addMember = (data) => {
  return instance({
    url: '/business-member',
    method: 'post',
    data
  });
};

export const updateMember = (data) => {
  return instance({
    url: '/business-member',
    method: 'put',
    data
  });
};

export const deleteMember = (id) => {
  return instance({
    url: `/business-member/${id}`,
    method: 'delete'
  });
};

// 水果种类接口
export const getFruitClassByPage = (params) => {
  return instance({
    url: '/fruitClass/getFruitClassByPage',
    method: 'get',
    params
  });
};

export const addFruitClass = (params) => {
  return instance({
    url: '/fruitClass/add',
    method: 'post',
    params
  });
};

export const updateFruitClass = (data) => {
  return instance({
    url: '/fruitClass/update',
    method: 'post',
    data
  });
};

export const deleteFruitClass = (data) => {
  return instance({
    url: '/fruitClass/delete',
    method: 'post',
    data
  });
};

export const checkFruitClassExist = (params) => {
  return instance({
    url: '/fruitClass/getExisit',
    method: 'get',
    params
  });
};

export default instance;