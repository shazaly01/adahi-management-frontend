<template>
  <AppDropdown
    :id="id"
    :label="label"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :options="distributionEntities"
    option-label="name"
    option-value="id"
    :placeholder="placeholder"
    :loading="loading"
    :required="required"
  />
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
// تم تعديل المسار هنا ليطابق الاسم الفعلي للملف لديك
import { useDistributionEntityStore } from '@/stores/distributionEntityStore'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, default: 'distribution-entity-dropdown' },
  label: { type: String, default: 'جهة التوزيع' },
  modelValue: { type: [String, Number], default: null },
  placeholder: { type: String, default: 'اختر جهة التوزيع...' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const store = useDistributionEntityStore()
const { distributionEntities, loading } = storeToRefs(store)

onMounted(async () => {
  // جلب البيانات عند فتح المكون إذا لم تكن محملة مسبقاً
  if (distributionEntities.value.length === 0) {
    await store.fetchEntities()
  }
})
</script>
