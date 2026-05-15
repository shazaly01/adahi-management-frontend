<!-- src/views/inventory/EntityStocksTable.vue -->
<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="entityStocks"
      :is-loading="loading"
      :row-clickable="false"
    >
      <!-- جهة التوزيع (إضافة جديدة) -->
      <template #cell-distribution_entity="{ item }">
        <span class="font-bold text-text-primary">
          {{ item.distribution_entity ? item.distribution_entity.name : 'غير محدد' }}
        </span>
      </template>

      <!-- نوع الأضحية -->
      <template #cell-sacrifice_type="{ item }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
        >
          {{ item.sacrifice_type ? item.sacrifice_type.name : 'غير محدد' }}
        </span>
      </template>

      <!-- الكمية (الرصيد) -->
      <template #cell-quantity="{ item }">
        <div class="flex items-center gap-2">
          <span
            class="px-3 py-1 rounded-full text-sm font-bold"
            :class="
              item.quantity > 0
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
            "
            title="الرصيد الحالي المتاح للتوزيع لدى الجهة"
          >
            {{ item.quantity }}
          </span>
        </div>
      </template>

      <!-- تاريخ آخر تحديث -->
      <template #cell-updated_at="{ item }">
        <span class="text-sm font-mono text-gray-500 dark:text-gray-400" dir="ltr">
          {{ formatDate(item.updated_at || item.created_at) }}
        </span>
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
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  entityStocks: {
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

defineEmits(['page-change'])

// إعداد أعمدة الجدول بناءً على الكيان الجديد
const tableHeaders = [
  { key: 'distribution_entity', label: 'جهة التوزيع' },
  { key: 'sacrifice_type', label: 'نوع الأضحية' },
  { key: 'quantity', label: 'الرصيد المتاح (رؤوس)', cellClass: 'text-center' },
  { key: 'updated_at', label: 'آخر تحديث' },
]

// دالة مساعدة لتنسيق التاريخ بشكل مبسط
const formatDate = (dateString) => {
  if (!dateString) return 'غير متوفر'
  try {
    const date = new Date(dateString)
    return (
      date.toISOString().split('T')[0] +
      ' ' +
      date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    )
  } catch (e) {
    return dateString
  }
}
</script>
