<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="allocations"
      :is-loading="loading"
      :row-clickable="false"
    >
      <template #cell-distribution_entity="{ item }">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold"
          >
            {{ item.distribution_entity?.name ? item.distribution_entity.name.charAt(0) : 'ج' }}
          </div>
          <span class="font-bold text-text-primary">
            {{ item.distribution_entity?.name || 'جهة غير معروفة' }}
          </span>
        </div>
      </template>

      <template #cell-sacrifice_type="{ item }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
        >
          {{ item.sacrifice_type?.name || 'غير محدد' }}
        </span>
      </template>

      <template #cell-quantity="{ item }">
        <span class="font-bold text-text-primary text-lg">
          {{ item.quantity }}
        </span>
      </template>

      <template #cell-value="{ item }">
        <span class="font-mono font-semibold text-gray-700 dark:text-gray-300">
          {{ item.value ? formatCurrency(item.value) : '---' }}
        </span>
      </template>

      <template #cell-created_at="{ item }">
        <div class="flex flex-col text-sm text-gray-600 dark:text-gray-300">
          <span dir="ltr">{{ formatDate(item.created_at) }}</span>
          <span class="text-xs text-gray-400">{{ formatTime(item.created_at) }}</span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-3">
          <button
            @click.stop="$emit('print-allocation', item.id)"
            class="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors"
            title="طباعة إيصال التسليم"
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

          <button
            v-if="authStore.can('allocation.update')"
            @click.stop="$emit('edit-allocation', item)"
            class="text-primary hover:text-primary-dark p-1 rounded transition-colors"
            title="تعديل الملاحظات"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              ></path>
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <AppPagination
      v-if="pagination && pagination.total > 0"
      :current-page="pagination.current_page"
      :total-pages="pagination.last_page"
      :total-items="pagination.total"
      :per-page="pagination.per_page"
      @page-change="(page) => $emit('page-change', page)"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  allocations: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({}),
  },
})

// تمت إضافة print-allocation إلى الـ Emits
defineEmits(['edit-allocation', 'print-allocation', 'page-change'])

const authStore = useAuthStore()

const tableHeaders = [
  { key: 'distribution_entity', label: 'جهة التوزيع المستلمة' },
  { key: 'sacrifice_type', label: 'نوع الأضحية' },
  { key: 'quantity', label: 'الكمية', cellClass: 'text-center' },
  { key: 'value', label: 'القيمة المالية (ج.س)' },
  { key: 'created_at', label: 'تاريخ ووقت التسليم' },
  { key: 'actions', label: '', cellClass: 'w-16 text-left' },
]

// دوال التنسيق
const formatCurrency = (value) => {
  return (
    new Intl.NumberFormat('ar-SD', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value) + ' ج.س'
  )
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}
</script>
