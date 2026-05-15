<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="suppliers"
      :is-loading="loading"
      :row-clickable="false"
    >
      <template #cell-name="{ item }">
        <span class="font-bold text-text-primary">{{ item.name }}</span>
      </template>

      <!-- عمود بيانات التواصل -->
      <template #cell-contact_info="{ item }">
        <div class="flex flex-col gap-1">
          <span v-if="item.phone" class="text-sm font-semibold text-primary" title="رقم الهاتف">
            <span dir="ltr">{{ item.phone }}</span>
          </span>
          <span v-else class="text-xs text-gray-400">لا يوجد رقم هاتف</span>

          <span
            v-if="item.address"
            class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs"
            :title="item.address"
          >
            {{ item.address }}
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

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-3">
          <button
            v-if="authStore.can('supplier.update')"
            @click.stop="$emit('edit-supplier', item)"
            class="text-primary hover:text-primary-dark p-1 rounded transition-colors"
            title="تعديل بيانات المورد"
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
            v-if="authStore.can('supplier.delete')"
            @click.stop="$emit('delete-supplier', item)"
            class="text-danger hover:text-red-700 p-1 rounded transition-colors"
            title="حذف المورد"
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
  suppliers: {
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

defineEmits(['edit-supplier', 'delete-supplier', 'page-change'])

const authStore = useAuthStore()

const tableHeaders = [
  { key: 'name', label: 'اسم المورد' },
  { key: 'contact_info', label: 'بيانات التواصل' },
  { key: 'status', label: 'الحالة' },
  { key: 'actions', label: '', cellClass: 'w-24' },
]
</script>
