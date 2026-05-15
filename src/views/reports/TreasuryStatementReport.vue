<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-text-primary">كشف حساب الخزينة</h1>
      <AppButton v-if="reportData" variant="secondary">طباعة التقرير</AppButton>
    </div>

    <TreasuryReportFilter :loading="loading" @search="fetchReport" />

    <div v-if="reportData" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-surface-section p-4 rounded-xl border border-surface-border text-center">
          <p class="text-xs text-text-muted mb-1">الرصيد الافتتاحي</p>
          <p class="font-mono font-bold text-lg">
            {{ formatCurrency(reportData.info.opening_balance) }}
          </p>
        </div>
        <div class="bg-surface-section p-4 rounded-xl border border-surface-border text-center">
          <p class="text-xs text-text-muted mb-1">إجمالي الإيداعات</p>
          <p class="font-mono font-bold text-lg text-emerald-600">
            +{{ formatCurrency(reportData.info.total_in) }}
          </p>
        </div>
        <div class="bg-surface-section p-4 rounded-xl border border-surface-border text-center">
          <p class="text-xs text-text-muted mb-1">إجمالي السحوبات</p>
          <p class="font-mono font-bold text-lg text-rose-600">
            -{{ formatCurrency(reportData.info.total_out) }}
          </p>
        </div>
        <div
          class="bg-surface-section p-4 rounded-xl border border-surface-border text-center ring-2 ring-primary/20"
        >
          <p class="text-xs text-text-muted mb-1">الرصيد الختامي</p>
          <p class="font-mono font-bold text-lg text-primary">
            {{ formatCurrency(reportData.info.closing_balance) }}
          </p>
        </div>
      </div>

      <div class="bg-surface-section rounded-xl border border-surface-border">
        <div class="p-4 border-b border-surface-border flex justify-between items-center">
          <h3 class="font-bold">تفاصيل حركات الفترة</h3>
          <span class="text-xs text-text-muted">
            {{ reportData.info.period.from }} إلى {{ reportData.info.period.to }}
          </span>
        </div>

        <AppTable :headers="tableHeaders" :items="reportData.transactions" :is-loading="false">
          <template #cell-type="{ item }">
            <span
              :class="item.transaction_type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'"
              class="text-xs font-bold"
            >
              {{ item.transaction_type === 'deposit' ? 'إيداع' : 'سحب' }}
            </span>
          </template>

          <template #cell-amount="{ item }">
            <span class="font-mono font-bold">
              {{ formatCurrency(item.amount) }}
            </span>
          </template>
        </AppTable>
      </div>
    </div>

    <div
      v-else-if="!loading"
      class="bg-surface-section p-12 text-center rounded-xl border border-dashed border-surface-border"
    >
      <p class="text-text-muted">اختر الخزينة والفترة الزمنية لعرض كشف الحساب.</p>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/reportStore'
import { useToast } from 'vue-toastification'
import AppButton from '@/components/ui/AppButton.vue'
import AppTable from '@/components/ui/AppTable.vue'
import TreasuryReportFilter from './TreasuryReportFilter.vue'

const toast = useToast()
const reportStore = useReportStore()
const { treasuryStatementData: reportData, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'transaction_date', label: 'التاريخ' },
  { key: 'TransactionNo', label: 'رقم الحركة' },
  { key: 'type', label: 'النوع' },
  { key: 'amount', label: 'المبلغ' },
  { key: 'notes', label: 'البيان/الملاحظات' },
]

const fetchReport = async (filters) => {
  try {
    await reportStore.fetchTreasuryStatement(filters)
  } catch (error) {
    toast.error('فشل جلب كشف حساب الخزينة.')
  }
}

const formatCurrency = (value) => {
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' د.ل'
}
</script>
