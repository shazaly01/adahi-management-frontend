import { defineStore } from 'pinia'
import { ref } from 'vue'
import supplyService from '@/services/supplyService'

export const useSupplyStore = defineStore('supply', () => {
  const supplies = ref([])
  const pagination = ref({})
  const currentSupply = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchSupplies(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await supplyService.get(page, search)
      supplies.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات التوريد.'
      console.error(err)
      supplies.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchSupply(id) {
    loading.value = true
    error.value = null
    currentSupply.value = null
    try {
      const response = await supplyService.find(id)
      currentSupply.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل عملية التوريد.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createSupply(payload) {
    loading.value = true
    error.value = null
    try {
      await supplyService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء عملية التوريد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSupply(id, payload) {
    loading.value = true
    error.value = null
    try {
      await supplyService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات التوريد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    supplies,
    pagination,
    currentSupply,
    loading,
    error,
    fetchSupplies,
    fetchSupply,
    createSupply,
    updateSupply,
  }
})
