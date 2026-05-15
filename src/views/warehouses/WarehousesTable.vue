<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="warehouses"
      :is-loading="loading"
      :row-clickable="false"
    >
      <!-- عمود اسم المخزن -->
      <template #cell-name="{ item }">
        <span class="font-bold text-text-primary">{{ item.name }}</span>
      </template>

      <!-- عمود الموقع -->
      <template #cell-location="{ item }">
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <svg
            class="w-4 h-4 mr-1 text-gray-400"
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
          <span class="truncate max-w-xs" :title="item.location">
            {{ item.location || 'لا يوجد موقع محدد' }}
          </span>
        </div>
      </template>

      <!-- عمود حالة التفعيل -->
      <template #cell-status="{ item }">
        <span
          v-if="item.is_active"
          class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
        >
          نشط
        </span>
        <span
          v-else
          class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50"
        >
          غير نشط
        </span>
      </template>

      <!-- عمود الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-3">
          <button
            v-if="authStore.can('warehouse.update')"
            @click.stop="$emit('edit-warehouse', item)"
            class="text-primary hover:text-primary-dark p-1 rounded transition-colors"
            title="تعديل بيانات المخزن"
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
            v-if="authStore.can('warehouse.delete')"
            @click.stop="$emit('delete-warehouse', item)"
            class="text-danger hover:text-red-700 p-1 rounded transition-colors"
            title="حذف المخزن"
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
  warehouses: {
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

defineEmits(['edit-warehouse', 'delete-warehouse', 'page-change'])

const authStore = useAuthStore()

const tableHeaders = [
  { key: 'name', label: 'اسم المخزن' },
  { key: 'location', label: 'الموقع' },
  { key: 'status', label: 'الحالة' },
  { key: 'actions', label: '', cellClass: 'w-24' },
]
</script>
