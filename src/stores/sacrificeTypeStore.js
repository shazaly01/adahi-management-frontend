import { defineStore } from 'pinia'
import { ref } from 'vue'
import sacrificeTypeService from '@/services/sacrificeTypeService'

export const useSacrificeTypeStore = defineStore('sacrificeType', () => {
  const sacrificeTypes = ref([])
  const pagination = ref({})
  const currentSacrificeType = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchSacrificeTypes(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await sacrificeTypeService.get(page, search)
      sacrificeTypes.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب أنواع الأضاحي.'
      console.error(err)
      sacrificeTypes.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchSacrificeType(id) {
    loading.value = true
    error.value = null
    currentSacrificeType.value = null
    try {
      const response = await sacrificeTypeService.find(id)
      currentSacrificeType.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل نوع الأضحية.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createSacrificeType(payload) {
    loading.value = true
    error.value = null
    try {
      await sacrificeTypeService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إضافة نوع الأضحية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSacrificeType(id, payload) {
    loading.value = true
    error.value = null
    try {
      await sacrificeTypeService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات نوع الأضحية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSacrificeType(id) {
    loading.value = true
    error.value = null
    try {
      await sacrificeTypeService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف نوع الأضحية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    sacrificeTypes,
    pagination,
    currentSacrificeType,
    loading,
    error,
    fetchSacrificeTypes,
    fetchSacrificeType,
    createSacrificeType,
    updateSacrificeType,
    deleteSacrificeType,
  }
})
