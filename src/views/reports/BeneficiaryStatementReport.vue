<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-text-primary">كشف حساب مستفيد</h1>
      <AppButton v-if="reportData" variant="secondary" @click="handlePrint">
        طباعة التقرير
      </AppButton>
    </div>

    <BeneficiaryReportFilter :loading="loading" @search="fetchReport" />

    <div v-if="reportData" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface-section p-4 rounded-xl border border-surface-border">
          <p class="text-xs text-text-muted mb-1">الاسم بالكامل</p>
          <p class="font-bold text-lg">{{ reportData.beneficiary_info.name }}</p>
        </div>
        <div class="bg-surface-section p-4 rounded-xl border border-surface-border">
          <p class="text-xs text-text-muted mb-1">الرقم الوطني</p>
          <p class="font-mono font-bold text-lg">{{ reportData.beneficiary_info.national_id }}</p>
        </div>
        <div class="bg-surface-section p-4 rounded-xl border border-surface-border">
          <p class="text-xs text-text-muted mb-1">إجمالي المساعدات المالية</p>
          <p class="font-bold text-lg text-emerald-600">
            {{ Number(reportData.beneficiary_info.total_financial_received).toLocaleString() }} د.ل
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-primary flex items-center gap-2">
            <span class="w-2 h-6 bg-primary rounded-full"></span>
            المساعدات المالية
          </h3>
          <AppTable
            :headers="financialHeaders"
            :items="reportData.financial_history"
            :is-loading="false"
          >
            <template #cell-amount="{ item }">
              <span class="font-bold">{{ Number(item.amount).toLocaleString() }} د.ل</span>
            </template>
          </AppTable>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-bold text-primary flex items-center gap-2">
            <span class="w-2 h-6 bg-primary rounded-full"></span>
            المساعدات العينية
          </h3>
          <AppTable
            :headers="inKindHeaders"
            :items="reportData.in_kind_history"
            :is-loading="false"
          >
            <template #cell-items="{ item }">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="desc in item.items"
                  :key="desc"
                  class="bg-surface-border px-2 py-0.5 rounded text-[10px]"
                >
                  {{ desc }}
                </span>
              </div>
            </template>
          </AppTable>
        </div>
      </div>
    </div>

    <div
      v-else-if="!loading"
      class="bg-surface-section p-12 text-center rounded-xl border border-dashed border-surface-border"
    >
      <p class="text-text-muted">يرجى اختيار مستفيد لعرض كشف الحساب الخاص به.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/reportStore'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppTable from '@/components/ui/AppTable.vue'
import BeneficiaryReportFilter from './BeneficiaryReportFilter.vue'

const router = useRouter()
const toast = useToast()
const reportStore = useReportStore()
const { beneficiaryStatementData: reportData, loading } = storeToRefs(reportStore)

const financialHeaders = [
  { key: 'date', label: 'التاريخ' },
  { key: 'type', label: 'النوع' },
  { key: 'amount', label: 'المبلغ' },
]

const inKindHeaders = [
  { key: 'date', label: 'التاريخ' },
  { key: 'reasons', label: 'السبب' },
  { key: 'items', label: 'الأصناف' },
]

const currentBeneficiaryId = ref(null)

const fetchReport = async (id) => {
  currentBeneficiaryId.value = id
  try {
    await reportStore.fetchBeneficiaryStatement({ beneficiary_id: id })
  } catch (error) {
    toast.error('فشل جلب بيانات التقرير.')
  }
}

const handlePrint = () => {
  router.push({
    name: 'PrintBeneficiaryStatement',
    query: { beneficiary_id: currentBeneficiaryId.value },
  })
}
</script>
