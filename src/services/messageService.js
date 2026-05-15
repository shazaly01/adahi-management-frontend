import apiClient from './apiClient'

const resource = '/messages'

export default {
  /**
   * جلب سجل الرسائل مع الترقيم (Pagination)
   */
  get(page = 1) {
    return apiClient.get(resource, {
      params: { page },
    })
  },

  /**
   * إرسال رسالة جديدة (فردية أو لمنطقة)
   * payload: { content, type, beneficiary_id, area_id }
   */
  send(payload) {
    return apiClient.post(resource, payload)
  },

  /**
   * حذف سجل رسالة من الأرشيف
   */
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
