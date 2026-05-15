import { defineStore } from 'pinia'
import { ref } from 'vue'
import messageService from '@/services/messageService'

export const useMessageStore = defineStore('message', () => {
  // --- الحالة (State) ---
  const messages = ref([])
  const pagination = ref({})
  const loading = ref(false)
  const error = ref(null)

  /**
   * جلب سجل المراسلات من السيرفر
   */
  async function fetchMessages(page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await messageService.get(page)
      messages.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في تحميل سجل الرسائل.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * إرسال رسالة جديدة
   */
  async function sendMessage(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await messageService.send(payload)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إرسال الرسالة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حذف سجل رسالة
   */
  async function deleteMessage(id) {
    loading.value = true
    error.value = null
    try {
      await messageService.delete(id)
      // تحديث القائمة محلياً بعد الحذف
      messages.value = messages.value.filter((m) => m.id !== id)
    } catch (err) {
      error.value = 'فشل في حذف السجل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    messages,
    pagination,
    loading,
    error,
    fetchMessages,
    sendMessage,
    deleteMessage,
  }
})
