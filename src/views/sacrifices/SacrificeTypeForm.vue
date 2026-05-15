<!--src\views\sacrifices\SacrificeTypeForm.vue-->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <AppInput
        id="sacrifice-type-name"
        label="اسم نوع الأضحية"
        v-model="form.name"
        placeholder="مثال: خروف بلدي، عجل، إلخ..."
        required
      />

      <AppInput
        id="base-price"
        label="السعر الأساسي (ج.س)"
        v-model="form.base_price"
        type="number"
        placeholder="ادخل السعر الأساسي (اختياري - سيتم تعيينه لـ 0 إذا تُرك فارغاً)"
      />

      <div class="flex items-center space-x-2 space-x-reverse">
        <input
          type="checkbox"
          id="is-active"
          v-model="form.is_active"
          class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
        />
        <label for="is-active" class="text-sm font-medium text-text-primary cursor-pointer">
          نوع نشط (متاح للتوريد والتوزيع)
        </label>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ form.id ? 'حفظ التعديلات' : 'إضافة نوع الأضحية' }}</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

// استيراد مكونات UI الأساسية من مشروعك
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

const createFreshForm = () => ({
  id: null,
  name: '',
  base_price: null,
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
        base_price:
          newData.base_price !== null && newData.base_price !== undefined
            ? Number(newData.base_price)
            : null,
        is_active: !!newData.is_active,
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // تعيين السعر إلى 0 في حال كان فارغاً أو null
  const finalPrice = form.value.base_price ? Number(form.value.base_price) : 0

  // إرسال البيانات (تحويل is_active إلى 0/1 ليتناسب مع MySQL/Laravel)
  const payload = {
    ...form.value,
    base_price: finalPrice,
    is_active: form.value.is_active ? 1 : 0,
  }

  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
