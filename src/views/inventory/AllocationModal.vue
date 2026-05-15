<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
    @click.self="close"
  >
    <!-- حاوية النافذة المنبثقة بتصميم Panda UI الموحد -->
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
      <AllocationForm
        :initial-data="allocationData"
        :is-saving="isSaving"
        @submit="handleFormSubmit"
        @cancel="close"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AllocationForm from './AllocationForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  allocation: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

// مزامنة الحالة الداخلية (Internal State) لضمان استقرار العرض
const isOpen = ref(props.modelValue)
const allocationData = ref(props.allocation)

// العنوان الديناميكي بناءً على الحالة (إضافة أو تعديل)
const title = computed(() =>
  props.allocation && props.allocation.id
    ? 'تعديل ملاحظات العُهدة'
    : 'تسليم عُهدة جديدة لجهة توزيع',
)

// مراقبة التغييرات لضمان فتح وإغلاق النافذة وتحديث البيانات فوراً
watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)

watch(
  () => props.allocation,
  (val) => {
    allocationData.value = val
  },
  { deep: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = (formData) => {
  // تمرير البيانات المكتملة إلى المكون الأب لمعالجتها وحفظها
  emit('save', formData)
}
</script>
