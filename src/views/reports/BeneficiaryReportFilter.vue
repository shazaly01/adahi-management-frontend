<template>
  <div class="bg-surface-section p-5 rounded-xl border border-surface-border shadow-sm mb-6">
    <div class="flex flex-col md:flex-row items-end gap-4">
      <div class="flex-1 w-full">
        <BeneficiariesDropdown
          id="report-beneficiary-id"
          label="اختر المستفيد"
          v-model="beneficiaryId"
          required
        />
      </div>

      <AppButton
        @click="handleSearch"
        :disabled="!beneficiaryId || loading"
        class="w-full md:w-auto"
      >
        <span v-if="loading">جاري التحميل...</span>
        <span v-else>عرض كشف الحساب</span>
      </AppButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import BeneficiariesDropdown from '@/components/forms/BeneficiariesDropdown.vue'

const props = defineProps({
  loading: Boolean,
})

const emit = defineEmits(['search'])
const beneficiaryId = ref(null)

const handleSearch = () => {
  if (beneficiaryId.value) {
    emit('search', beneficiaryId.value)
  }
}
</script>
