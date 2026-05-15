//src\stores\allocationStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import allocationService from '@/services/allocationService'

export const useAllocationStore = defineStore('allocation', () => {
  const allocations = ref([])
  const pagination = ref({})
  const currentAllocation = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchAllocations(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await allocationService.get(page, search)
      allocations.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات تسليم العهد.'
      console.error(err)
      allocations.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchAllocation(id) {
    loading.value = true
    error.value = null
    currentAllocation.value = null
    try {
      const response = await allocationService.find(id)
      currentAllocation.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل العهدة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createAllocation(payload) {
    loading.value = true
    error.value = null
    try {
      await allocationService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تسليم العهدة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAllocation(id, payload) {
    loading.value = true
    error.value = null
    try {
      await allocationService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات العهدة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    allocations,
    pagination,
    currentAllocation,
    loading,
    error,
    fetchAllocations,
    fetchAllocation,
    createAllocation,
    updateAllocation,
  }
})
