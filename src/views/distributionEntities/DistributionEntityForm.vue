<!--src\views\distributionEntities\DistributionEntityForm.vue-->
<template>
  <form @submit.prevent="handleSubmit">
    <!-- تنبيه يظهر فقط في حالة التعديل -->
    <div
      v-if="isEditMode"
      class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-md"
    >
      <p class="text-sm text-amber-800 dark:text-amber-200">
        <span class="font-bold">ملاحظة:</span> أنت في وضع التعديل. لا يمكن تعديل "رقم الجهة"
        لارتباطه بالسجلات المالية والمخزنية.
      </p>
    </div>

    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- رقم الجهة (يُدخل يدوياً عند الإنشاء، معطل عند التعديل) -->
        <div>
          <AppInput
            id="entity-id"
            label="رقم الجهة (المعرف)"
            v-model="form.id"
            type="number"
            placeholder="ادخل رقم الجهة"
            :disabled="isEditMode"
            required
          />
          <p v-if="errors.id" class="text-rose-500 text-xs mt-1 font-bold">يجب إدخال رقم الجهة</p>
        </div>

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
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
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
  id: false,
  name: false,
})

const isEditMode = computed(() => !!props.initialData && !!props.initialData.id)

const createFreshForm = () => ({
  id: '',
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
  errors.id = false
  errors.name = false

  let hasError = false

  // التحقق من المعرف فقط في حالة الإضافة
  if (!isEditMode.value) {
    if (!form.value.id || String(form.value.id).trim() === '') {
      errors.id = true
      hasError = true
    }
  }

  // التحقق من الاسم دائماً
  if (!form.value.name || form.value.name.trim() === '') {
    errors.name = true
    hasError = true
  }

  if (hasError) return

  // تجهيز البيانات للإرسال
  const payload = { ...form.value }

  // تحويل id إلى رقم ليتوافق مع الـ API Validation
  if (!isEditMode.value) {
    payload.id = Number(payload.id)
  }

  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
