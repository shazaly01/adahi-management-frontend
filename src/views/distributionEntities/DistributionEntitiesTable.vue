<!--src\views\distributionEntities\DistributionEntitiesTable.vue-->
<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="entities"
      :is-loading="loading"
      :row-clickable="false"
    >
      <!-- رقم واسم الجهة -->
      <template #cell-entity_info="{ item }">
        <div class="flex flex-col">
          <span class="font-bold text-text-primary">
            {{ item.name }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono" title="رقم الجهة">
            رقم: {{ item.id }}
          </span>
        </div>
      </template>

      <!-- المنطقة -->
      <template #cell-region="{ item }">
        <div class="flex items-center text-sm text-text-secondary">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
          {{ item.region || 'غير محدد' }}
        </div>
      </template>

      <!-- حالة التفعيل -->
      <template #cell-status="{ item }">
        <span
          v-if="item.is_active"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
        >
          نشط
        </span>
        <span
          v-else
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
        >
          غير نشط
        </span>
      </template>

      <!-- تاريخ الإضافة -->
      <template #cell-created_at="{ item }">
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <span dir="ltr">{{ formatDate(item.created_at) }}</span>
        </div>
      </template>

      <!-- أزرار العمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-3">
          <!-- زر التعديل -->
          <button
            v-if="authStore.can('distribution_entity.update')"
            @click.stop="$emit('edit-entity', item)"
            class="text-primary hover:text-primary-dark p-1 rounded transition-colors"
            title="تعديل بيانات الجهة"
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

          <!-- زر الحذف -->
          <button
            v-if="authStore.can('distribution_entity.delete')"
            @click.stop="$emit('delete-entity', item)"
            class="text-rose-500 hover:text-rose-700 p-1 rounded transition-colors"
            title="حذف الجهة"
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
  entities: {
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

defineEmits(['edit-entity', 'delete-entity', 'page-change'])

const authStore = useAuthStore()

const tableHeaders = [
  { key: 'entity_info', label: 'الجهة' },
  { key: 'region', label: 'المنطقة' },
  { key: 'status', label: 'الحالة', cellClass: 'text-center' },
  { key: 'created_at', label: 'تاريخ التسجيل' },
  { key: 'actions', label: '', cellClass: 'w-24 text-left' },
]

// دالة التنسيق المساعدة للتاريخ
const formatDate = (dateString) => {
  if (!dateString) return 'غير محدد'
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}
</script>
