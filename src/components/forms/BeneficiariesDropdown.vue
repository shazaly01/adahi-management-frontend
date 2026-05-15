<!--src\components\forms\BeneficiariesDropdown.vue-->
<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="beneficiaries"
      :loading="loading"
      :required="required"
      option-label="name"
      placeholder="ابحث عن اسم المستفيد..."
    />
    <p v-if="error" class="text-sm text-rose-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBeneficiaryStore } from '@/stores/beneficiaryStore'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المستفيد' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const beneficiaryStore = useBeneficiaryStore()
const { beneficiaries, loading } = storeToRefs(beneficiaryStore)
const error = ref(null)

onMounted(async () => {
  if (beneficiaries.value.length === 0) {
    try {
      await beneficiaryStore.fetchBeneficiaries(1, '', 1000)
    } catch (err) {
      error.value = 'فشل تحميل قائمة المستفيدين.'
    }
  }
})
</script>
