import { defineStore } from 'pinia'
import { ref } from 'vue'
import entityStockService from '@/services/entityStockService'

export const useEntityStockStore = defineStore('entityStock', () => {
  const entityStocks = ref([])
  const pagination = ref({})
  const currentEntityStock = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchEntityStocks(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await entityStockService.get(page, search)
      entityStocks.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات الأرصدة المخزنية.'
      console.error(err)
      entityStocks.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchEntityStock(id) {
    loading.value = true
    error.value = null
    currentEntityStock.value = null
    try {
      const response = await entityStockService.find(id)
      currentEntityStock.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل الرصيد.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    entityStocks,
    pagination,
    currentEntityStock,
    loading,
    error,
    fetchEntityStocks,
    fetchEntityStock,
  }
})
