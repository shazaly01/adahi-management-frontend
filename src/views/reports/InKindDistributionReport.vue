<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-text-primary">تقرير توزيع المساعدات العينية</h1>
      <AppButton v-if="reportData" variant="secondary">طباعة</AppButton>
    </div>

    <PeriodReportFilter :loading="loading" @search="fetchReport" />

    <div v-if="reportData" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          class="bg-surface-section p-4 rounded-xl border border-surface-border flex justify-between items-center"
        >
          <span class="text-text-muted">أنواع الأصناف الموزعة</span>
          <span class="text-2xl font-bold text-primary">{{
            reportData.info.unique_items_types
          }}</span>
        </div>
        <div
          class="bg-surface-section p-4 rounded-xl border border-surface-border flex justify-between items-center"
        >
          <span class="text-text-muted">إجمالي عدد القطع الموزعة</span>
          <span class="text-2xl font-bold text-primary">{{
            reportData.info.total_items_pieces
          }}</span>
        </div>
      </div>

      <AppTable :headers="headers" :items="reportData.data" :is-loading="loading" />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/reportStore'
// تم تصحيح المسار هنا
import PeriodReportFilter from './PeriodReportFilter.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const reportStore = useReportStore()
const { inKindDistributionData: reportData, loading } = storeToRefs(reportStore)

const headers = [
  { key: 'description', label: 'وصف الصنف' },
  { key: 'total_distributed', label: 'إجمالي الكمية الموزعة', cellClass: 'text-center font-bold' },
]

const fetchReport = (filters) => reportStore.fetchInKindDistribution(filters)
</script>
