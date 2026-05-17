<!-- src\views\distributionEntities\DistributionEntityForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <!-- تنبيه يظهر فقط في حالة التعديل -->
    <div
      v-if="isEditMode"
      class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-md"
    >
      <p class="text-sm text-amber-800 dark:text-amber-200">
        <span class="font-bold">ملاحظة:</span> أنت تقوم الآن بتعديل بيانات جهة توزيع مسجلة مسبقاً.
      </p>
    </div>

    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- اسم الجهة -->
        <div>
          <AppInput
            id="entity-name"
            label="اسم الجهة"
            v-model="form.name"
            type="text"
            placeholder="ادخل اسم جهة التوزيع"
            required
          />
          <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">يجب إدخال اسم الجهة</p>
        </div>

        <!-- المنطقة -->
        <div>
          <AppInput
            id="region"
            label="المنطقة (اختياري)"
            v-model="form.region"
            type="text"
            placeholder="ادخل اسم المنطقة أو المدينة"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- حالة التفعيل -->
        <div>
          <AppDropdown
            id="is-active"
            label="حالة التفعيل"
            v-model="form.is_active"
            :options="statusOptions"
            placeholder="اختر حالة الجهة"
            required
          />
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة الجهة' }}</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'

// استيراد المكونات الأساسية
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

// خيارات حالة التفعيل للتوافق مع AppDropdown
const statusOptions = [
  { id: true, name: 'نشط' },
  { id: false, name: 'غير نشط' },
]

// إدارة الأخطاء يدوياً
const errors = reactive({
  name: false,
})

const isEditMode = computed(() => !!props.initialData && !!props.initialData.id)

const createFreshForm = () => ({
  id: null,
  name: '',
  region: '',
  is_active: true,
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        region: newData.region || '',
        is_active: newData.is_active !== undefined ? newData.is_active : true,
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // إعادة تعيين الأخطاء
  errors.name = false

  let hasError = false

  // التحقق من الاسم دائماً
  if (!form.value.name || form.value.name.trim() === '') {
    errors.name = true
    hasError = true
  }

  if (hasError) return

  // تجهيز البيانات للإرسال
  const payload = { ...form.value }

  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
