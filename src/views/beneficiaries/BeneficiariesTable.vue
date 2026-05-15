<!---src/views/beneficiaries/BeneficiariesTable.vue--->
<template>
  <div class="space-y-4">
    <AppTable
      :headers="tableHeaders"
      :items="beneficiaries"
      :is-loading="loading"
      :row-clickable="false"
    >
      <template #cell-name="{ item }">
        <button
          @click.stop="$emit('view-assistances', item)"
          class="text-primary hover:text-primary-dark font-bold underline decoration-transparent hover:decoration-primary transition-all duration-200"
          title="عرض سجل المساعدات"
        >
          {{ item.name }}
        </button>
      </template>

      <!-- تم تحديث العمود ليعرض الرقم الوطني، رقم الهاتف الجديد، ورقم العمل -->
      <template #cell-identity_info="{ item }">
        <div class="flex flex-col gap-1">
          <span class="font-mono text-sm font-bold text-text-primary" title="الرقم الوطني">
            {{ item.national_id }}
          </span>
          <span class="text-xs font-semibold text-primary" title="رقم الهاتف">
            الهاتف: <span dir="ltr">{{ item.phone }}</span>
          </span>
          <span
            v-if="item.job_number"
            class="text-xs text-gray-500 dark:text-gray-400"
            title="رقم العمل / الوظيفة"
          >
            رقم العمل: <span dir="ltr">{{ item.job_number }}</span>
          </span>
        </div>
      </template>

      <!-- عمود جديد لعرض اسم الجهة الموزعة (المستخدم الذي أضافه) -->
      <template #cell-distributor_name="{ item }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-surface-section border border-surface-border text-text-secondary"
        >
          {{ item.distributor_name || 'إدارة النظام' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-3">
          <button
            @click.stop="$emit('add-financial', item)"
            class="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 p-1 rounded transition-colors"
            title="إضافة مساعدة مالية"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </button>

          <button
            @click.stop="$emit('add-in-kind', item)"
            class="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 p-1 rounded transition-colors"
            title="إضافة مساعدة عينية"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              ></path>
            </svg>
          </button>

          <div class="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>

          <button
            v-if="authStore.can('beneficiary.update')"
            @click.stop="$emit('edit-beneficiary', item)"
            class="text-primary hover:text-primary-dark p-1 rounded transition-colors"
            title="تعديل بيانات المستفيد"
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
            v-if="authStore.can('beneficiary.delete')"
            @click.stop="$emit('delete-beneficiary', item)"
            class="text-danger hover:text-red-700 p-1 rounded transition-colors"
            title="حذف المستفيد"
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
  beneficiaries: {
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

defineEmits([
  'edit-beneficiary',
  'delete-beneficiary',
  'page-change',
  'add-financial',
  'add-in-kind',
  'view-assistances',
])

const authStore = useAuthStore()

// تحديث الترويسة لتشمل عمود "الجهة الموزعة"
const tableHeaders = [
  { key: 'name', label: 'اسم المستفيد' },
  { key: 'identity_info', label: 'الهوية والتواصل' },
  { key: 'distributor_name', label: 'الجهة الموزعة' },
  { key: 'actions', label: '', cellClass: 'w-44' },
]
</script>
