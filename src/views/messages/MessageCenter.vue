src\views\messages\MessageCenter.vue
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary text-emerald-600">مركز المراسلات (SMS)</h1>
    </div>

    <div class="bg-surface-section p-6 rounded-xl border border-surface-border shadow-sm">
      <h2 class="text-lg font-bold mb-4 text-text-primary flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          ></path>
        </svg>
        إرسال رسالة جماعية للمستفيدين
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-1">
          <AreasDropdown
            id="message-area"
            v-model="formData.area_id"
            label="اختر المنطقة المستهدفة"
            required
          />
          <p class="text-xs text-gray-500 mt-1">
            سيتم إرسال الرسالة لكافة المستفيدين في هذه المنطقة والمناطق التابعة لها.
          </p>
        </div>

        <div class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
            نص الرسالة
          </label>
          <textarea
            v-model="formData.content"
            rows="3"
            class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-surface-ground dark:border-surface-border dark:text-text-primary p-3"
            placeholder="اكتب نص الرسالة هنا (مثلاً: يرجى التوجه لمقر الجمعية لاستلام المساعدات...)"
          ></textarea>

          <div class="flex justify-between items-center mt-2">
            <span
              class="text-xs font-bold px-2 py-1 rounded"
              :class="
                formData.content.length > 70
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'text-gray-500'
              "
            >
              عدد الحروف: {{ formData.content.length }}
              <span class="mx-1">|</span>
              تكلفة الإرسال: {{ Math.ceil(formData.content.length / 70) || 1 }} رسالة
              <span class="text-[10px] font-normal text-gray-400 mx-1"
                >(70 حرف للرسالة العربية)</span
              >
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          @click="handleSend"
          :disabled="isSending || !formData.area_id || !formData.content"
          class="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          <span
            v-if="isSending"
            class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
          ></span>
          {{ isSending ? 'جاري الجدولة...' : 'إرسال الرسائل الآن' }}
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-text-primary">سجل الرسائل السابقة</h2>
        <button
          @click="messageStore.fetchMessages(1)"
          class="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          تحديث السجل
        </button>
      </div>

      <AppTable
        :headers="tableHeaders"
        :items="messages"
        :is-loading="loading"
        :row-clickable="false"
      >
        <template #cell-beneficiary="{ item }">
          <div class="flex flex-col">
            <span v-if="item.type === 'area'" class="font-bold text-emerald-600"
              >بث منطقة: {{ item.area }}</span
            >
            <span v-else class="font-bold">{{ item.beneficiary }}</span>
            <span class="text-xs text-gray-500 font-mono">{{ item.phone }}</span>
          </div>
        </template>

        <template #cell-status="{ item }">
          <div class="flex flex-col items-center gap-1">
            <span
              class="px-3 py-1 rounded-full text-xs font-bold"
              :class="{
                'bg-emerald-100 text-emerald-700': item.status === 'sent',
                'bg-amber-100 text-amber-700': item.status === 'pending',
                'bg-rose-100 text-rose-700': item.status === 'failed',
              }"
            >
              {{
                item.status === 'sent'
                  ? 'تم الإرسال'
                  : item.status === 'pending'
                    ? 'قيد الانتظار'
                    : 'فشل'
              }}
            </span>

            <span
              v-if="item.status === 'failed' && item.error_log"
              class="text-[10px] text-rose-600 max-w-[150px] truncate cursor-help"
              :title="item.error_log"
            >
              {{ item.error_log }}
            </span>
          </div>
        </template>

        <template #cell-content="{ item }">
          <p class="max-w-xs truncate" :title="item.content">{{ item.content }}</p>
        </template>
      </AppTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessageStore } from '@/stores/messageStore'
import { useToast } from 'vue-toastification'
import AppTable from '@/components/ui/AppTable.vue'

const messageStore = useMessageStore()
const { messages, loading, pagination } = storeToRefs(messageStore)
const toast = useToast()

const isSending = ref(false)
const formData = ref({
  area_id: '',
  content: '',
  type: 'area', // إرسال جماعي للمنطقة
})

const tableHeaders = [
  { key: 'created_at', label: 'التاريخ' },
  { key: 'beneficiary', label: 'المستلم / المنطقة' },
  { key: 'content', label: 'نص الرسالة' },
  { key: 'status', label: 'الحالة', cellClass: 'text-center w-32' },
  { key: 'sender', label: 'بواسطة' },
]

onMounted(() => {
  messageStore.fetchMessages(1)
})

const handleSend = async () => {
  isSending.value = true
  try {
    const response = await messageStore.sendMessage(formData.value)
    toast.success(response.message || 'تمت جدولة إرسال الرسائل بنجاح')

    // تصفير النموذج وتحديث الجدول
    formData.value.content = ''
    formData.value.area_id = ''
    await messageStore.fetchMessages(1)
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء محاولة الإرسال')
  } finally {
    isSending.value = false
  }
}
</script>
