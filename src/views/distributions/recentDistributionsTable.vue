<!--src\views\distributions\recentDistributionsTable.vue-->
<template>
  <AppCard class="h-full border-t-4 border-t-gray-800 shadow-md bg-gray-50 dark:bg-gray-900/50">
    <div class="flex justify-between items-center mb-5 border-b pb-3">
      <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">سجل اليوم (سريع)</h3>

      <!-- زر الطباعة الجماعية -->
      <button
        @click="emitBulkPrint"
        :disabled="selectedForPrint.length === 0"
        class="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-all hover:bg-gray-700"
      >
        طباعة المحددة ({{ selectedForPrint.length }})
      </button>
    </div>

    <!-- قائمة العمليات -->
    <div class="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
      <div
        v-if="distributions.length === 0"
        class="text-center text-gray-500 py-10 text-sm font-bold"
      >
        لا توجد عمليات مسجلة حالياً...
      </div>

      <div
        v-for="item in distributions"
        :key="item.id"
        class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3"
      >
        <input
          type="checkbox"
          :value="item.id"
          v-model="selectedForPrint"
          class="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
        />
        <div class="flex-grow">
          <div class="font-bold text-sm text-gray-800 dark:text-gray-100">
            {{ item.beneficiary?.name || 'مستفيد غير معروف' }}
          </div>
          <div class="text-xs text-gray-500 mt-1 flex justify-between">
            <span>الإيصال: #{{ item.receipt_number }}</span>
            <span class="font-bold text-emerald-600">{{
              getPaymentMethodLabel(item.payment_method)
            }}</span>
          </div>
        </div>

        <!-- أزرار الإجراءات (تعديل وطباعة) -->
        <div class="flex flex-col gap-2">
          <button
            @click="emitEdit(item)"
            class="text-gray-400 hover:text-amber-600 transition-colors"
            title="تعديل"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            @click="emitSinglePrint(item.id)"
            class="text-gray-400 hover:text-indigo-600 transition-colors"
            title="طباعة فورية"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'

const props = defineProps({
  distributions: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['print-single', 'print-bulk', 'edit-item'])

const selectedForPrint = ref([])

const paymentMethodsMap = {
  free: 'توزيع مجاني',
  cash: 'دفع نقدي',
  installments: 'دفع بالأقساط',
}

const getPaymentMethodLabel = (val) => {
  return paymentMethodsMap[val] || val
}

const emitSinglePrint = (id) => {
  emit('print-single', id)
}

const emitBulkPrint = () => {
  if (selectedForPrint.value.length > 0) {
    emit('print-bulk', [...selectedForPrint.value])
    selectedForPrint.value = []
  }
}

const emitEdit = (item) => {
  emit('edit-item', item)
}

defineExpose({
  clearSelection: () => {
    selectedForPrint.value = []
  },
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
