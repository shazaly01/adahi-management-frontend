import apiClient from './apiClient'

const resource = '/distribution-entities'

export default {
  get(page = 1, search = '') {
    return apiClient.get(resource, {
      params: { page, search },
    })
  },

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  create(data) {
    return apiClient.post(resource, data)
  },

  update(id, data) {
    return apiClient.put(`${resource}/${id}`, data)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
