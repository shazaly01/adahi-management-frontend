import apiClient from './apiClient'

// تحديث المسار ليتطابق مع الـ API Route الجديد
const resource = '/entity-stocks'

export default {
  get(page = 1, search = '') {
    return apiClient.get(resource, {
      params: { page, search },
    })
  },

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },
}
