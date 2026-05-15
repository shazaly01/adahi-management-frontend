import { defineStore } from 'pinia'
import { ref } from 'vue'
import distributionService from '@/services/distributionService'

export const useDistributionStore = defineStore('distribution', () => {
  const distributions = ref([])
  const pagination = ref({})
  const currentDistribution = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchDistributions(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await distributionService.get(page, search)
      distributions.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات التوزيع.'
      console.error(err)
      distributions.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchDistribution(id) {
    loading.value = true
    error.value = null
    currentDistribution.value = null
    try {
      const response = await distributionService.find(id)
      currentDistribution.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل التوزيع.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createDistribution(payload) {
    loading.value = true
    error.value = null
    try {
      await distributionService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء التوزيع.'
      console.error(err)
      throw err // نرمي الخطأ ليتعامل معه الـ Component (مثل إظهار Toast)
    } finally {
      loading.value = false
    }
  }

  async function updateDistribution(id, payload) {
    loading.value = true
    error.value = null
    try {
      await distributionService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث مرفقات التوزيع.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    distributions,
    pagination,
    currentDistribution,
    loading,
    error,
    fetchDistributions,
    fetchDistribution,
    createDistribution,
    updateDistribution,
  }
})
