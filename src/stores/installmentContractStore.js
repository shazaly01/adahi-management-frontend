import { defineStore } from 'pinia'
import { ref } from 'vue'
import installmentContractService from '@/services/installmentContractService'

export const useInstallmentContractStore = defineStore('installmentContract', () => {
  const contracts = ref([])
  const pagination = ref({})
  const currentContract = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchContracts(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await installmentContractService.get(page, search)
      contracts.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات عقود الأقساط.'
      console.error(err)
      contracts.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchContract(id) {
    loading.value = true
    error.value = null
    currentContract.value = null
    try {
      const response = await installmentContractService.find(id)
      currentContract.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل عقد الأقساط.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    contracts,
    pagination,
    currentContract,
    loading,
    error,
    fetchContracts,
    fetchContract,
  }
})
