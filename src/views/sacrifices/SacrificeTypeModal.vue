<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
    @click.self="close"
  >
    <!-- حاوية النافذة المنبثقة بتنسيق متناسق -->
    <div
      class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 scale-95"
      :class="{ 'scale-100': isOpen }"
    >
      <!-- رأس النافذة -->
      <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
        <h3 class="text-lg font-semibold text-text-primary">
          {{ title }}
        </h3>
        <button
          @click="close"
          class="text-text-muted hover:text-text-primary text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <!-- نموذج البيانات -->
      <SacrificeTypeForm
        :initial-data="typeData"
        :is-saving="isSaving"
        @submit="handleFormSubmit"
        @cancel="close"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SacrificeTypeForm from './SacrificeTypeForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  sacrificeType: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

// مزامنة الحالة الداخلية لضمان استقرار العرض (كما في مرجع UserModal)
const isOpen = ref(props.modelValue)
const typeData = ref(props.sacrificeType)

// العنوان الديناميكي
const title = computed(() =>
  props.sacrificeType && props.sacrificeType.id
    ? 'تعديل بيانات نوع الأضحية'
    : 'إضافة نوع أضحية جديد',
)

// مراقبة التغييرات لضمان فتح/إغلاق النافذة وتحديث البيانات فوراً
watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)

watch(
  () => props.sacrificeType,
  (val) => {
    typeData.value = val
  },
  { deep: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>
