<!--src\views\installments\InstallmentContractsTable.vue--->
<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="contracts"
      :is-loading="loading"
      :row-clickable="false"
    >
      <!-- معلومات المستفيد -->
      <template #cell-beneficiary="{ item }">
        <div class="flex items-center gap-2">
          <span class="font-bold text-text-primary">{{
            item.beneficiary?.name || 'غير معروف'
          }}</span>
        </div>
      </template>

      <!-- المبالغ المالية -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col gap-1 text-sm">
          <div class="flex justify-between w-40">
            <span class="text-gray-500 dark:text-gray-400">الإجمالي:</span>
            <span class="font-mono font-bold text-text-primary">{{
              formatCurrency(item.total_amount)
            }}</span>
          </div>
          <div class="flex justify-between w-40">
            <span class="text-emerald-600 dark:text-emerald-400">المدفوع:</span>
            <span class="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{{
              formatCurrency(item.paid_amount)
            }}</span>
          </div>
          <div class="w-full h-px bg-surface-border my-0.5"></div>
          <div class="flex justify-between w-40">
            <span class="text-rose-600 dark:text-rose-400">المتبقي:</span>
            <span class="font-mono font-bold text-rose-600 dark:text-rose-400">
              {{ formatCurrency(item.total_amount - item.paid_amount) }}
            </span>
          </div>
        </div>
      </template>

      <!-- حالة العقد -->
      <template #cell-status="{ item }">
        <span
          v-if="item.status === 'completed' || item.paid_amount >= item.total_amount"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
        >
          مكتمل السداد
        </span>
        <span
          v-else
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
        >
          ساري (نشط)
        </span>
      </template>

      <!-- أزرار العمليات (إدارة الدفعات) -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-3">
          <AppButton
            variant="primary"
            class="!py-1.5 !px-3 text-xs"
            @click.stop="$emit('manage-payments', item)"
          >
            إدارة الدفعات
          </AppButton>
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
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  contracts: {
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

defineEmits(['manage-payments', 'page-change'])

const tableHeaders = [
  { key: 'beneficiary', label: 'المستفيد' },
  { key: 'financials', label: 'الحالة المالية' },
  { key: 'status', label: 'حالة العقد' },
  { key: 'actions', label: '', cellClass: 'w-32 text-left' },
]

// دالة التنسيق المالي
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 ج.س'
  return (
    new Intl.NumberFormat('ar-SD', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value) + ' ج.س'
  )
}
</script>
