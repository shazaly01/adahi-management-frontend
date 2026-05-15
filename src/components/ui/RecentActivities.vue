<template>
  <div
    class="bg-surface-section rounded-2xl border border-surface-border overflow-hidden shadow-sm"
  >
    <div class="p-5 border-b border-surface-border">
      <h3 class="font-bold text-text-primary">آخر العمليات المالية</h3>
    </div>
    <div class="divide-y divide-surface-border">
      <div
        v-for="act in activities"
        :key="act.id"
        class="p-4 flex items-center justify-between hover:bg-surface-ground/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div
            :class="
              act.type === 'deposit' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'
            "
            class="p-2 rounded-lg"
          >
            <ArrowUpIcon v-if="act.type === 'deposit'" class="w-4 h-4" />
            <ArrowDownIcon v-else class="w-4 h-4" />
          </div>
          <div>
            <p class="text-sm font-bold text-text-primary">
              {{ act.type === 'deposit' ? 'إيداع في' : 'سحب من' }} {{ act.treasury }}
            </p>
            <p class="text-xs text-text-muted">بواسطة: {{ act.user }} • {{ act.date }}</p>
          </div>
        </div>
        <div class="text-left">
          <p
            :class="act.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'"
            class="font-mono font-bold"
          >
            {{ act.type === 'deposit' ? '+' : '-' }}{{ Number(act.amount).toLocaleString() }}
          </p>
        </div>
      </div>

      <div v-if="activities.length === 0" class="p-8 text-center text-text-muted">
        لا توجد نشاطات مؤخراً
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/20/solid'

defineProps({
  activities: { type: Array, default: () => [] },
})
</script>
