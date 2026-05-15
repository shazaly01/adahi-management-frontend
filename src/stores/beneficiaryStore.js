import { defineStore } from 'pinia'
import { ref } from 'vue'
import beneficiaryService from '@/services/beneficiaryService'

export const useBeneficiaryStore = defineStore('beneficiary', () => {
  const beneficiaries = ref([])
  const pagination = ref({})
  const currentBeneficiary = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchBeneficiaries(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await beneficiaryService.get(page, search)
      beneficiaries.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات المستفيدين.'
      console.error(err)
      beneficiaries.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchBeneficiary(id) {
    loading.value = true
    error.value = null
    currentBeneficiary.value = null
    try {
      const response = await beneficiaryService.find(id)
      currentBeneficiary.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل المستفيد.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // الدالة الجديدة: تُرجع النتيجة مباشرة للـ Component للتعامل معها فوراً (إظهار Modal أو تنبيه)
  async function checkNationalId(nationalId) {
    loading.value = true
    error.value = null
    try {
      const response = await beneficiaryService.checkByNationalId(nationalId)
      return response.data // ترجع كائن يحتوي على { exists, has_received, beneficiary }
    } catch (err) {
      error.value = 'فشل في التحقق من الرقم الوطني للمستفيد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createBeneficiary(payload) {
    loading.value = true
    error.value = null
    try {
      await beneficiaryService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إضافة المستفيد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBeneficiary(id, payload) {
    loading.value = true
    error.value = null
    try {
      await beneficiaryService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات المستفيد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBeneficiary(id) {
    loading.value = true
    error.value = null
    try {
      await beneficiaryService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المستفيد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    beneficiaries,
    pagination,
    currentBeneficiary,
    loading,
    error,
    fetchBeneficiaries,
    fetchBeneficiary,
    checkNationalId,
    createBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
  }
})
