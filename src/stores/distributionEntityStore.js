import { defineStore } from 'pinia'
import { ref } from 'vue'
import distributionEntityService from '@/services/distributionEntityService'

export const useDistributionEntityStore = defineStore('distributionEntity', () => {
  const distributionEntities = ref([])
  const pagination = ref({})
  const currentEntity = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchEntities(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await distributionEntityService.get(page, search)
      distributionEntities.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب بيانات جهات التوزيع.'
      console.error(err)
      distributionEntities.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchEntity(id) {
    loading.value = true
    error.value = null
    currentEntity.value = null
    try {
      const response = await distributionEntityService.find(id)
      currentEntity.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل جهة التوزيع.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createEntity(data) {
    loading.value = true
    error.value = null
    try {
      const response = await distributionEntityService.create(data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء جهة التوزيع.'
      console.error(err)
      throw err // نرمي الخطأ ليتعامل معه الـ Component (مثل إظهار إشعار Toast)
    } finally {
      loading.value = false
    }
  }

  async function updateEntity(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await distributionEntityService.update(id, data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث جهة التوزيع.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEntity(id) {
    loading.value = true
    error.value = null
    try {
      const response = await distributionEntityService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف جهة التوزيع.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    distributionEntities,
    pagination,
    currentEntity,
    loading,
    error,
    fetchEntities,
    fetchEntity,
    createEntity,
    updateEntity,
    deleteEntity,
  }
})
