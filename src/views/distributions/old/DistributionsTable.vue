<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="distributions"
      :is-loading="loading"
      :row-clickable="false"
    >
      <!-- رقم الإيصال والمستفيد -->
      <template #cell-distribution_info="{ item }">
        <div class="flex flex-col">
          <span class="font-bold text-text-primary">{{
            item.beneficiary?.name || 'غير معروف'
          }}</span>
          <span
            class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono"
            title="رقم الإيصال"
          >
            إيصال: {{ item.receipt_number }}
          </span>
        </div>
      </template>

      <!-- نوع الأضحية -->
      <template #cell-sacrifice_type="{ item }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
        >
          {{ item.sacrifice_type?.name || 'غير محدد' }}
        </span>
      </template>

      <!-- طريقة الدفع والسعر الفعلي وعدد الأشهر -->
      <template #cell-payment_info="{ item }">
        <div class="flex flex-col gap-1">
          <div>
            <span
              v-if="item.payment_method === 'free'"
              class="px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
            >
              مجاني
            </span>
            <span
              v-else-if="item.payment_method === 'cash'"
              class="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400"
            >
              كاش
            </span>
            <span
              v-else-if="item.payment_method === 'installments'"
              class="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
            >
              أقساط
            </span>
          </div>
          <span
            v-if="item.payment_method !== 'free'"
            class="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5"
          >
            {{ formatCurrency(item.actual_price) }}
            <!-- عرض عدد الأشهر إذا كان تقسيطاً -->
            <span
              v-if="item.payment_method === 'installments' && item.months_count"
              class="text-xs text-text-muted font-sans font-normal inline-block mr-1"
            >
              (على {{ item.months_count }} أشهر)
            </span>
          </span>
        </div>
      </template>

      <!-- الموزع المُنفذ -->
      <template #cell-distributor="{ item }">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ item.distributor?.full_name || item.distributor?.name || 'موزع غير معروف' }}
        </span>
      </template>

      <!-- تاريخ التوزيع -->
      <template #cell-created_at="{ item }">
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
          <span dir="ltr">{{ formatDate(item.created_at) }}</span>
        </div>
      </template>

      <!-- أزرار العمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-3">
          <button
            v-if="authStore.can('distribution.update')"
            @click.stop="$emit('edit-distribution', item)"
            class="text-primary hover:text-primary-dark p-1 rounded transition-colors"
            title="تحديث المرفقات (الصورة/المستند)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              ></path>
            </svg>
          </button>
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
import { useAuthStore } from '@/stores/authStore'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  distributions: {
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

defineEmits(['edit-distribution', 'page-change'])

const authStore = useAuthStore()

const tableHeaders = [
  { key: 'distribution_info', label: 'المستفيد والإيصال' },
  { key: 'sacrifice_type', label: 'نوع الأضحية' },
  { key: 'payment_info', label: 'الآلية والسعر' },
  { key: 'distributor', label: 'الموزع المُنفذ' },
  { key: 'created_at', label: 'تاريخ التوزيع' },
  { key: 'actions', label: '', cellClass: 'w-16 text-left' },
]

// دوال التنسيق
const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 ج.س'
  return (
    new Intl.NumberFormat('ar-SD', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value) + ' ج.س'
  )
}

const formatDate = (dateString) => {
  if (!dateString) return 'غير محدد'
  // تنظيف التاريخ للتعامل مع صيغ Laravel (2026-05-10 14:21:28 أو 2026-05-10T14:21:28.000000Z)
  return dateString.split('T')[0].split(' ')[0]
}
</script>
