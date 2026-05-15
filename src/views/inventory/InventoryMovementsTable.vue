<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="movements"
      :is-loading="loading"
      :row-clickable="false"
    >
      <!-- المرجع -->
      <template #cell-reference="{ item }">
        <div class="flex flex-col">
          <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
            {{ formatReferenceType(item.reference_type) }}
          </span>
          <span class="text-xs text-gray-500 font-mono mt-0.5" dir="ltr"
            >#{{ item.reference_id }}</span
          >
        </div>
      </template>

      <!-- المسؤول المعدل -->
      <template #cell-custodian_name="{ item }">
        <span class="text-sm font-medium text-text-primary">{{ item.custodian_name }}</span>
      </template>

      <!-- الموقع (المخزن / الجهة) - العمود الجديد -->
      <template #cell-location="{ item }">
        <div class="flex flex-col text-xs">
          <span class="text-gray-500">من: {{ item.warehouse_name }}</span>
          <span class="text-indigo-500 font-bold">إلى: {{ item.entity_name }}</span>
        </div>
      </template>

      <!-- نوع الأضحية المعدل -->
      <template #cell-sacrifice_type="{ item }">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-border text-text-primary"
        >
          {{ item.sacrifice_type }}
        </span>
      </template>

      <!-- الحركة والكمية -->
      <template #cell-movement_details="{ item }">
        <div class="flex items-center gap-2">
          <span
            class="px-2 py-0.5 rounded-full text-xs font-bold w-14 text-center"
            :class="
              item.movement_type === 'in'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            "
          >
            {{ item.movement_type === 'in' ? 'وارد' : 'صادر' }}
          </span>
          <span
            class="font-mono font-bold text-base w-16 text-right"
            :class="item.movement_type === 'in' ? 'text-emerald-600' : 'text-rose-600'"
            dir="ltr"
          >
            {{ item.movement_type === 'in' ? '+' : '-' }}{{ item.quantity }}
          </span>
        </div>
      </template>

      <!-- التاريخ والوقت -->
      <template #cell-created_at="{ item }">
        <div class="flex flex-col text-sm">
          <span dir="ltr">{{ formatDate(item.created_at) }}</span>
          <span class="text-xs text-gray-400">{{ formatTime(item.created_at) }}</span>
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
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  movements: Array,
  loading: Boolean,
  pagination: Object,
})

const emit = defineEmits(['page-change'])

const tableHeaders = [
  { key: 'reference', label: 'المستند' },
  { key: 'custodian_name', label: 'المسؤول' },
  { key: 'location', label: 'المسار (من/إلى)' }, // عمود جديد
  { key: 'sacrifice_type', label: 'النوع' },
  { key: 'movement_details', label: 'الكمية' },
  { key: 'created_at', label: 'التاريخ' },
]

const formatReferenceType = (typeString) => {
  if (!typeString) return '---'
  if (typeString.includes('Supply')) return 'فاتورة توريد'
  if (typeString.includes('Allocation')) return 'تسليم عُهدة'
  if (typeString.includes('Distribution')) return 'صرف أضحية'
  return 'حركة مخزنية'
}

const formatDate = (dateString) => (dateString ? dateString.split(' ')[0] : '')
const formatTime = (dateString) => (dateString ? dateString.split(' ')[1]?.substring(0, 5) : '')
</script>
