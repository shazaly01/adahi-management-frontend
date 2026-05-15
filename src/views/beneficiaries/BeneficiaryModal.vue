<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
    @click.self="close"
  >
    <!-- حاوية النافذة المنبثقة بتنسيق Indigo/Glossy الموحد -->
    <div
      class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 scale-95"
      :class="{ 'scale-100': isOpen }"
    >
      <!-- رأس النافذة (Header) -->
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

      <!-- محتوى النافذة (Form) -->
      <BeneficiaryForm
        :initial-data="beneficiaryData"
        :is-saving="isSaving"
        @submit="handleFormSubmit"
        @cancel="close"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BeneficiaryForm from './BeneficiaryForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  beneficiary: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

// --- الحالة الداخلية (Internal State) لضمان مزامنة البيانات واستقرار العرض ---
const isOpen = ref(props.modelValue)
const beneficiaryData = ref(props.beneficiary)

// --- العنوان الديناميكي ---
const title = computed(() =>
  props.beneficiary && props.beneficiary.id ? 'تعديل بيانات المستفيد' : 'إضافة مستفيد جديد',
)

// --- مراقبة التغييرات (Watchers) لضمان استجابة النافذة للمؤثرات الخارجية ---

// مراقبة حالة الفتح والإغلاق القادمة من المكون الأب
watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)

// مراقبة بيانات المستفيد الممررة (عند الضغط على تعديل في الجدول)
watch(
  () => props.beneficiary,
  (val) => {
    beneficiaryData.value = val
  },
  { deep: true },
)

// --- الدوال الإجرائية ---

const close = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = (formData) => {
  // تمرير البيانات المكتملة إلى المكون الأب (BeneficiariesList) للمعالجة
  emit('save', formData)
}
</script>
