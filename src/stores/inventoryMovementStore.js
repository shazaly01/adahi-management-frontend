// src/stores/inventoryMovementStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import inventoryMovementService from '@/services/inventoryMovementService'

export const useInventoryMovementStore = defineStore('inventoryMovement', () => {
  const movements = ref([])
  const pagination = ref({})
  const currentMovement = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchMovements(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await inventoryMovementService.get(page, search)
      movements.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب الحركات المخزنية.'
      console.error(err)
      movements.value = []
    } finally {
      loading.value = false
    }
  }

  // إذا كانت هناك حاجة لجلب حركة واحدة مستقبلاً
  async function fetchMovement(id) {
    loading.value = true
    error.value = null
    currentMovement.value = null
    try {
      const response = await inventoryMovementService.find(id)
      currentMovement.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل الحركة المخزنية.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    movements,
    pagination,
    currentMovement,
    loading,
    error,
    fetchMovements,
    fetchMovement,
  }
})
