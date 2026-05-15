<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="projectTypes"
      :loading="loading"
      :required="required"
      placeholder="اختر نوع المشروع"
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'
// استدعاء الستور الجديد
import { useProjectTypeStore } from '@/stores/projectTypeStore'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'نوع المشروع' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// استخدام الستور
const projectTypeStore = useProjectTypeStore()
const { projectTypes, loading } = storeToRefs(projectTypeStore)
const error = ref(null)

onMounted(async () => {
  // تحميل البيانات فقط إذا كانت القائمة فارغة
  if (projectTypes.value.length === 0) {
    try {
      // نطلب الصفحة 1، ويمكنك لاحقاً تعديل الباك إند لإرجاع كل الأنواع بدون تقسيم صفحات إذا أردت
      await projectTypeStore.fetchProjectTypes(1)
    } catch (err) {
      error.value = 'فشل تحميل أنواع المشاريع.'
    }
  }
})
</script>
