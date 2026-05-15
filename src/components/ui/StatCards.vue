<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div class="stat-card">
      <div class="stat-icon bg-blue-100 text-blue-600">
        <UserGroupIcon class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm text-text-muted">إجمالي المستفيدين</p>
        <h3 class="text-2xl font-bold">{{ stats.total_beneficiaries }}</h3>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon bg-emerald-100 text-emerald-600">
        <BanknotesIcon class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm text-text-muted">إجمالي المساعدات المالية</p>
        <h3 class="text-xl font-bold font-mono">{{ formatCurrency(stats.total_financial_aid) }}</h3>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon bg-purple-100 text-purple-600">
        <ArchiveBoxIcon class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm text-text-muted">طلبات المساعدة العينية</p>
        <h3 class="text-2xl font-bold">{{ stats.total_in_kind_requests }}</h3>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon bg-orange-100 text-orange-600">
        <WalletIcon class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm text-text-muted">إجمالي أرصدة الخزائن</p>
        <h3 class="text-xl font-bold font-mono text-orange-600">
          {{ formatCurrency(stats.current_treasury_balance) }}
        </h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserGroupIcon, BanknotesIcon, ArchiveBoxIcon, WalletIcon } from '@heroicons/vue/24/outline'

defineProps({
  stats: { type: Object, required: true },
})

const formatCurrency = (val) => Number(val).toLocaleString() + ' د.ل'
</script>

<style scoped>
.stat-card {
  @apply bg-surface-section p-6 rounded-2xl border border-surface-border flex items-center gap-4 shadow-sm;
}
.stat-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0;
}
</style>
