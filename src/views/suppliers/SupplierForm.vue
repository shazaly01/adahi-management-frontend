<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="supplier-name"
          label="اسم المورد"
          v-model="form.name"
          placeholder="ادخل اسم المورد بالكامل"
          required
        />
        <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">اسم المورد مطلوب</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="supplier-phone"
          label="رقم الهاتف"
          v-model="form.phone"
          placeholder="ادخل رقم الهاتف (اختياري)"
          dir="ltr"
        />

        <AppInput
          id="supplier-address"
          label="العنوان"
          v-model="form.address"
          placeholder="ادخل عنوان المورد (اختياري)"
        />
      </div>

      <!-- حقل التفعيل باستخدام Checkbox بتصميم يتناسب مع Tailwind -->
      <div class="flex items-center mt-4">
        <input
          id="supplier-active"
          type="checkbox"
          v-model="form.is_active"
          class="w-5 h-5 text-primary bg-surface-section border-surface-border rounded focus:ring-primary focus:ring-2"
        />
        <label for="supplier-active" class="mr-3 text-sm font-medium text-text-primary">
          تفعيل المورد (يظهر في قوائم التوريد)
        </label>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ بيانات المورد</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

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

const errors = reactive({
  name: false,
})

const createFreshForm = () => ({
  id: null,
  name: '',
  phone: '',
  address: '',
  is_active: true, // افتراضياً يكون نشط
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        phone: newData.phone || '',
        address: newData.address || '',
        // تحويل القيمة إلى Boolean ليتوافق مع الـ Checkbox
        is_active: newData.is_active !== undefined ? Boolean(newData.is_active) : true,
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // تصفير الأخطاء
  errors.name = false

  let hasError = false

  if (!form.value.name || form.value.name.trim() === '') {
    errors.name = true
    hasError = true
  }

  if (hasError) return

  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
