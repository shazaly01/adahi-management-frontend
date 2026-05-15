import apiClient from './apiClient'

const resource = '/dashboard'

export default {
  /**
   * جلب كافة إحصائيات لوحة التحكم من الـ Backend
   */
  getStats() {
    return apiClient.get(resource)
  },
}
