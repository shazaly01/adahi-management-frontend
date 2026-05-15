import { defineStore } from 'pinia'
import { ref } from 'vue'
import installmentPaymentService from '@/services/installmentPaymentService'

export const useInstallmentPaymentStore = defineStore('installmentPayment', () => {
  const payments = ref([])
  const pagination = ref({})
  const currentPayment = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchPayments(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await installmentPaymentService.get(page, search)
      payments.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات إيصالات السداد.'
      console.error(err)
      payments.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchPayment(id) {
    loading.value = true
    error.value = null
    currentPayment.value = null
    try {
      const response = await installmentPaymentService.find(id)
      currentPayment.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل الإيصال.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createPayment(payload) {
    loading.value = true
    error.value = null
    try {
      await installmentPaymentService.create(payload)
    } catch (err) {
      // سيتم التقاط الأخطاء القادمة من الباك إند مثل "المبلغ يتجاوز المتبقي"
      error.value = err.response?.data?.message || 'فشل في تسجيل الدفعة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    payments,
    pagination,
    currentPayment,
    loading,
    error,
    fetchPayments,
    fetchPayment,
    createPayment,
  }
})
