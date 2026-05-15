<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-text-primary">ملخص أرصدة الخزائن</h1>
      <AppButton v-if="reportData" variant="secondary">طباعة</AppButton>
    </div>

    <div v-if="reportData" class="space-y-6">
      <div
        class="bg-gradient-to-r from-primary-dark to-primary-light p-6 rounded-2xl text-white shadow-lg"
      >
        <p class="text-white/80 text-sm mb-2">إجمالي السيولة النقدية المتوفرة</p>
        <h2 class="text-4xl font-black font-mono">
          {{ Number(reportData.info.total_funds_available).toLocaleString() }}
          <span class="text-lg">د.ل</span>
        </h2>
        <p class="mt-4 text-xs text-white/60">تاريخ التحديث: {{ reportData.info.generated_at }}</p>
      </div>

      <AppTable :headers="headers" :items="reportData.data" :is-loading="loading">
        <template #cell-balance="{ item }">
          <span class="font-mono font-bold text-emerald-600">
            {{ Number(item.balance).toLocaleString() }} د.ل
          </span>
        </template>
      </AppTable>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/reportStore'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const reportStore = useReportStore()
const { globalBalancesData: reportData, loading } = storeToRefs(reportStore)

const headers = [
  { key: 'name', label: 'اسم الخزينة' },
  { key: 'balance', label: 'الرصيد الحالي' },
]

onMounted(() => reportStore.fetchGlobalBalances())
</script>
