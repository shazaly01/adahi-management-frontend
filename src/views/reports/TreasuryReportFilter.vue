<template>
  <div class="bg-surface-section p-5 rounded-xl border border-surface-border shadow-sm mb-6">
    <div class="grid grid-cols-1 md:grid-cols-4 items-end gap-4">
      <div class="md:col-span-1">
        <TreasuriesDropdown
          id="report-treasury-id"
          label="الخزينة"
          v-model="filters.treasury_id"
          required
        />
      </div>

      <div>
        <AppInput
          id="from-date"
          label="من تاريخ"
          v-model="filters.from_date"
          type="date"
          required
        />
      </div>

      <div>
        <AppInput id="to-date" label="إلى تاريخ" v-model="filters.to_date" type="date" required />
      </div>

      <AppButton @click="handleSearch" :disabled="!isValid || loading" class="w-full">
        <span v-if="loading">جاري المعالجة...</span>
        <span v-else>عرض التقرير</span>
      </AppButton>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'

const props = defineProps({
  loading: Boolean,
})

const emit = defineEmits(['search'])

const filters = reactive({
  treasury_id: null,
  from_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0], // أول يوم في الشهر
  to_date: new Date().toISOString().split('T')[0], // اليوم
})

const isValid = computed(() => {
  return filters.treasury_id && filters.from_date && filters.to_date
})

const handleSearch = () => {
  if (isValid.value) {
    emit('search', { ...filters })
  }
}
</script>
