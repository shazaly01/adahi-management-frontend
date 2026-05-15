<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="sacrificeTypes"
      :is-loading="loading"
      :row-clickable="false"
    >
      <template #cell-name="{ item }">
        <div class="flex items-center gap-2">
          <span class="font-bold text-text-primary">{{ item.name }}</span>
          <span
            v-if="!item.is_active"
            class="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            title="هذا النوع موقوف حالياً"
          >
            موقوف
          </span>
        </div>
      </template>

      <!-- تم تعديل الاسم ليصبح base_price بدلاً من estimated_price -->
      <template #cell-base_price="{ item }">
        <span class="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
          {{ formatCurrency(item.base_price) }}
        </span>
      </template>

      <!-- تم حذف أعمدة allowed_weight و notes لعدم وجودها في الباك إند -->

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-3">
          <button
            v-if="authStore.can('sacrifice_type.update')"
            @click.stop="$emit('edit-type', item)"
            class="text-primary hover:text-primary-dark p-1 rounded transition-colors"
            title="تعديل بيانات النوع"
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

          <button
            v-if="authStore.can('sacrifice_type.delete')"
            @click.stop="$emit('delete-type', item)"
            class="text-danger hover:text-red-700 p-1 rounded transition-colors"
            title="حذف النوع"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
  sacrificeTypes: {
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

defineEmits(['edit-type', 'delete-type', 'page-change'])

const authStore = useAuthStore()

// تم تحديث الترويسات لتطابق البيانات الفعلية فقط
const tableHeaders = [
  { key: 'name', label: 'النوع' },
  { key: 'base_price', label: 'السعر الأساسي' },
  { key: 'actions', label: '', cellClass: 'w-24 text-left' },
]

// دالة مساعدة لتنسيق الأرقام كعملة (أرقام صحيحة كما اتفقنا)
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
