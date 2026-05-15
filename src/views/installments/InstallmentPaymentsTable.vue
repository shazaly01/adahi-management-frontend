<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="payments"
      :is-loading="loading"
      :row-clickable="false"
    >
      <!-- معلومات الإيصال -->
      <template #cell-receipt_info="{ item }">
        <div class="flex flex-col">
          <span class="font-bold font-mono text-text-primary">
            إيصال: {{ item.receipt_number || 'بدون رقم' }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            رقم العقد: #{{ item.installment_contract_id }}
          </span>
        </div>
      </template>

      <!-- المستفيد (يأتي عبر العلاقة مع العقد) -->
      <template #cell-beneficiary="{ item }">
        <span class="font-bold text-text-primary">
          {{ item.contract?.beneficiary?.name || 'غير معروف' }}
        </span>
      </template>

      <!-- المبلغ المحصل -->
      <template #cell-amount="{ item }">
        <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-lg">
          {{ formatCurrency(item.amount) }}
        </span>
      </template>

      <!-- المحصل (الموظف الذي استلم الدفعة) -->
      <template #cell-collector="{ item }">
        <div class="flex items-center gap-2 text-sm text-text-primary">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          <span>{{ item.collector?.full_name || item.collector?.name || 'النظام' }}</span>
        </div>
      </template>

      <!-- تاريخ ووقت التحصيل -->
      <template #cell-created_at="{ item }">
        <div class="flex flex-col text-sm text-gray-600 dark:text-gray-300">
          <span dir="ltr">{{ formatDate(item.created_at) }}</span>
          <span class="text-xs text-gray-400">{{ formatTime(item.created_at) }}</span>
        </div>
      </template>
    </AppTable>

    <!-- الترقيم -->
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
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  payments: {
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

// الجدول للعرض فقط
defineEmits(['page-change'])

const tableHeaders = [
  { key: 'receipt_info', label: 'رقم الإيصال' },
  { key: 'beneficiary', label: 'المستفيد' },
  { key: 'amount', label: 'المبلغ المحصل' },
  { key: 'collector', label: 'المحصل' },
  { key: 'created_at', label: 'تاريخ التحصيل' },
]

// دوال التنسيق
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 ج.س'
  return (
    new Intl.NumberFormat('ar-SD', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value) + ' ج.س'
  )
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.split('T')[0] || dateString.split(' ')[0]
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const timePart = dateString.split('T')[1] || dateString.split(' ')[1]
  if (!timePart) return ''
  return timePart.substring(0, 5)
}
</script>
