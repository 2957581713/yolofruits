import request from '@/utils/request'

// 商户信息接口
export const getBusinessList = (params) => {
  return request({
    url: '/business/list',
    method: 'get',
    params
  })
}

export const addBusiness = (data) => {
  return request({
    url: '/business',
    method: 'post',
    data
  })
}

export const updateBusiness = (data) => {
  return request({
    url: '/business',
    method: 'put',
    data
  })
}

export const deleteBusiness = (id) => {
  return request({
    url: `/business/${id}`,
    method: 'delete'
  })
}

// 员工信息接口
export const getMemberList = (params) => {
  return request({
    url: '/business-member/list',
    method: 'get',
    params
  })
}

export const addMember = (data) => {
  return request({
    url: '/business-member',
    method: 'post',
    data
  })
}

export const updateMember = (data) => {
  return request({
    url: '/business-member',
    method: 'put',
    data
  })
}

export const deleteMember = (id) => {
  return request({
    url: `/business-member/${id}`,
    method: 'delete'
  })
}