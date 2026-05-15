<!--src\views\inventory\SuppliesTable.vue--->
<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="supplies"
      :is-loading="loading"
      :row-clickable="false"
    >
      <!-- اسم المورد -->
      <template #cell-supplier_info="{ item }">
        <div class="flex flex-col">
          <span class="font-bold text-text-primary">
            {{ item.supplier?.name || item.supplier_name || 'غير محدد' }}
          </span>
          <span
            v-if="item.receipt_number"
            class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono"
            title="رقم الإيصال/الفاتورة"
          >
            إيصال: {{ item.receipt_number }}
          </span>
        </div>
      </template>

      <!-- المخزن المستلم (إضافة جديدة) -->
      <template #cell-warehouse="{ item }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-surface-section border border-surface-border text-text-secondary"
        >
          <svg
            class="w-3.5 h-3.5 ml-1 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            ></path>
          </svg>
          {{ item.warehouse?.name || 'غير محدد' }}
        </span>
      </template>

      <!-- نوع الأضحية -->
      <template #cell-sacrifice_type="{ item }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
        >
          {{ item.sacrifice_type?.name || 'غير محدد' }}
        </span>
      </template>

      <!-- الكمية -->
      <template #cell-quantity="{ item }">
        <span class="font-bold text-text-primary">
          {{ item.quantity }}
        </span>
      </template>

      <!-- التكلفة الإجمالية (تم التصحيح لـ total_value) -->
      <template #cell-total_value="{ item }">
        <span class="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
          {{ formatCurrency(item.total_value || item.total_cost) }}
        </span>
      </template>

      <!-- تاريخ التوريد -->
      <template #cell-supply_date="{ item }">
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <svg
            class="w-4 h-4 ml-1.5 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <span dir="ltr">{{ formatDate(item.created_at || item.supply_date) }}</span>
        </div>
      </template>

      <!-- أزرار العمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-3">
          <button
            v-if="authStore.can('supply.update')"
            @click.stop="$emit('edit-supply', item)"
            class="text-primary hover:text-primary-dark p-1 rounded transition-colors"
            title="تعديل بيانات التوريد (الملاحظات)"
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

    <!-- الترقيم (Pagination) -->
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
  supplies: {
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

defineEmits(['edit-supply', 'page-change'])

const authStore = useAuthStore()

const tableHeaders = [
  { key: 'supplier_info', label: 'المورد' },
  { key: 'warehouse', label: 'المخزن المستلم' },
  { key: 'sacrifice_type', label: 'نوع الأضحية' },
  { key: 'quantity', label: 'الكمية', cellClass: 'text-center' },
  { key: 'total_value', label: 'إجمالي التكلفة' },
  { key: 'supply_date', label: 'تاريخ التوريد' },
  { key: 'actions', label: '', cellClass: 'w-16 text-left' },
]

// دوال التنسيق المساعدة
const formatCurrency = (value) => {
  if (!value) return '0 ج.س'
  return (
    new Intl.NumberFormat('ar-SD', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value) + ' ج.س'
  )
}

const formatDate = (dateString) => {
  if (!dateString) return 'غير محدد'
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}
</script>
