<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-text-primary">تحليل المساعدات المالية</h1>
      <AppButton v-if="reportData" variant="secondary">طباعة</AppButton>
    </div>

    <PeriodReportFilter :loading="loading" @search="fetchReport" />

    <div v-if="reportData" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-surface-section p-5 rounded-xl border border-surface-border">
          <p class="text-text-muted text-xs mb-1">إجمالي المبالغ المعتمدة</p>
          <p class="text-2xl font-bold text-emerald-600">
            {{ Number(reportData.info.grand_total).toLocaleString() }} د.ل
          </p>
        </div>
        <div class="bg-surface-section p-5 rounded-xl border border-surface-border">
          <p class="text-text-muted text-xs mb-1">إجمالي الحالات المستفيدة</p>
          <p class="text-2xl font-bold text-primary">{{ reportData.info.total_cases }} حالة</p>
        </div>
      </div>

      <AppTable :headers="headers" :items="reportData.data" :is-loading="loading">
        <template #cell-percentage="{ item }">
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-surface-ground rounded-full overflow-hidden">
              <div class="h-full bg-primary" :style="{ width: item.percentage + '%' }"></div>
            </div>
            <span class="text-xs font-bold">{{ item.percentage }}%</span>
          </div>
        </template>
        <template #cell-amount="{ item }">
          <span class="font-mono">{{ Number(item.amount).toLocaleString() }} د.ل</span>
        </template>
      </AppTable>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/reportStore'
// تم تصحيح المسار هنا بإزالة /shared/
import PeriodReportFilter from './PeriodReportFilter.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const reportStore = useReportStore()
const { financialAidByTypeData: reportData, loading } = storeToRefs(reportStore)

const headers = [
  { key: 'type_name', label: 'نوع المساعدة' },
  { key: 'cases_count', label: 'عدد الحالات' },
  { key: 'amount', label: 'إجمالي المبلغ' },
  { key: 'percentage', label: 'النسبة من الإجمالي', cellClass: 'w-48' },
]

const fetchReport = (filters) => reportStore.fetchFinancialAidByType(filters)
</script>
