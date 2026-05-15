import { defineStore } from 'pinia'
import { ref } from 'vue'
import warehouseService from '@/services/warehouseService'

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses = ref([])
  const pagination = ref({})
  const currentWarehouse = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchWarehouses(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await warehouseService.get(page, search)
      warehouses.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات المخازن.'
      console.error(err)
      warehouses.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchWarehouse(id) {
    loading.value = true
    error.value = null
    currentWarehouse.value = null
    try {
      const response = await warehouseService.find(id)
      currentWarehouse.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل المخزن.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createWarehouse(payload) {
    loading.value = true
    error.value = null
    try {
      await warehouseService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إضافة المخزن.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateWarehouse(id, payload) {
    loading.value = true
    error.value = null
    try {
      await warehouseService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات المخزن.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteWarehouse(id) {
    loading.value = true
    error.value = null
    try {
      await warehouseService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المخزن.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    warehouses,
    pagination,
    currentWarehouse,
    loading,
    error,
    fetchWarehouses,
    fetchWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  }
})
