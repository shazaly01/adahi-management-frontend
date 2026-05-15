<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
    @click.self="close"
  >
    <!-- حاوية النافذة المنبثقة -->
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
      <WarehouseForm
        :initial-data="warehouseData"
        :is-saving="isSaving"
        @submit="handleFormSubmit"
        @cancel="close"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import WarehouseForm from './WarehouseForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  warehouse: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

// --- الحالة الداخلية (Internal State) لضمان مزامنة البيانات ---
const isOpen = ref(props.modelValue)
const warehouseData = ref(props.warehouse)

// --- العنوان الديناميكي ---
const title = computed(() =>
  props.warehouse && props.warehouse.id ? 'تعديل بيانات المخزن' : 'إضافة مخزن جديد',
)

// --- مراقبة التغييرات (Watchers) لضمان استجابة النافذة ---

// مراقبة حالة الفتح والإغلاق
watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)

// مراقبة بيانات المخزن الممررة (عند الضغط على تعديل في الجدول)
watch(
  () => props.warehouse,
  (val) => {
    warehouseData.value = val
  },
  { deep: true },
)

// --- الدوال الإجرائية ---

const close = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = (formData) => {
  // تمرير البيانات المكتملة من الفورم إلى المكون الأب (WarehousesList)
  emit('save', formData)
}
</script>

<style scoped>
/* إضافة أنيميشن بسيط للظهور السلس */
.bg-surface-section {
  transition:
    transform 0.2s ease-out,
    opacity 0.2s ease-out;
}
</style>
