<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="formattedAssistances"
      :loading="loading"
      :required="required"
      option-label="displayText"
      placeholder="ربط بمساعدة مالية (اختياري)"
    />
    <p v-if="error" class="text-sm text-rose-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFinancialAssistanceStore } from '@/stores/financialAssistanceStore'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المساعدة المالية المعتمدة' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const financialStore = useFinancialAssistanceStore()
const { assistances, loading } = storeToRefs(financialStore)
const error = ref(null)

// تخصيص النص المعروض في القائمة ليكون أكثر وضوحاً
const formattedAssistances = computed(() => {
  return assistances.value.map((item) => ({
    ...item,
    displayText: `مساعدة #${item.id} - ${item.beneficiary?.name} (${item.approved_amount} د.ل)`,
  }))
})

onMounted(async () => {
  if (assistances.value.length === 0) {
    try {
      await financialStore.fetchAssistances(1, '')
    } catch (err) {
      error.value = 'فشل تحميل قائمة المساعدات.'
    }
  }
})
</script>
