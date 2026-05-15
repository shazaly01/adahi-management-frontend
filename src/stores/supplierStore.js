import { defineStore } from 'pinia'
import { ref } from 'vue'
import supplierService from '@/services/supplierService'

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref([])
  const pagination = ref({})
  const currentSupplier = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchSuppliers(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await supplierService.get(page, search)
      // التوافق مع بنية API Resources في Laravel
      suppliers.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات الموردين.'
      console.error(err)
      suppliers.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchSupplier(id) {
    loading.value = true
    error.value = null
    currentSupplier.value = null
    try {
      const response = await supplierService.find(id)
      currentSupplier.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل المورد.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createSupplier(payload) {
    loading.value = true
    error.value = null
    try {
      await supplierService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إضافة المورد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSupplier(id, payload) {
    loading.value = true
    error.value = null
    try {
      await supplierService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات المورد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSupplier(id) {
    loading.value = true
    error.value = null
    try {
      await supplierService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المورد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    suppliers,
    pagination,
    currentSupplier,
    loading,
    error,
    fetchSuppliers,
    fetchSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
})
