//src\services\beneficiaryService.js
import apiClient from './apiClient'

const resource = '/beneficiaries'

export default {
  get(page = 1, search = '') {
    return apiClient.get(resource, {
      params: { page, search },
    })
  },

  find(id) {
    // نمرر المعرف (الذي قد يكون DECIMAL 18 رقم) كما هو
    return apiClient.get(`${resource}/${id}`)
  },

  // الدالة الجديدة: فحص الرقم الوطني قبل التوزيع
  checkByNationalId(nationalId) {
    return apiClient.get(`${resource}/check`, {
      params: { national_id: nationalId },
    })
  },

  create(payload) {
    return apiClient.post(resource, payload)
  },

  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
