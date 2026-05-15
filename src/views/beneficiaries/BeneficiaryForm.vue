<!--src\views\beneficiaries\BeneficiaryForm.vue--->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <AppInput
        id="beneficiary-name"
        label="اسم المستفيد"
        v-model="form.name"
        placeholder="ادخل اسم المستفيد بالكامل"
        required
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppInput
            id="national-id"
            label="الرقم الوطني"
            v-model="form.national_id"
            placeholder="ادخل الرقم الوطني"
            required
          />
          <p v-if="errors.national_id" class="text-rose-500 text-xs mt-1 font-bold">
            الرقم الوطني مطلوب
          </p>
        </div>

        <div>
          <AppInput
            id="phone"
            label="رقم الهاتف"
            v-model="form.phone"
            placeholder="ادخل رقم الهاتف"
            required
            dir="ltr"
          />
          <p v-if="errors.phone" class="text-rose-500 text-xs mt-1 font-bold">رقم الهاتف مطلوب</p>
        </div>
      </div>

      <!-- حقل رقم العمل تم نقله لسطر منفصل لترتيب الشبكة (Grid) -->
      <AppInput
        id="job-number"
        label="رقم العمل / الوظيفة"
        v-model="form.job_number"
        placeholder="ادخل رقم العمل (اختياري)"
        dir="ltr"
      />
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ بيانات المستفيد</span>
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
  national_id: false,
  phone: false,
})

const createFreshForm = () => ({
  id: null,
  name: '',
  national_id: '',
  phone: '',
  job_number: '',
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        national_id: newData.national_id || '',
        phone: newData.phone || '',
        job_number: newData.job_number || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // تصفير الأخطاء
  errors.national_id = false
  errors.phone = false

  let hasError = false

  if (!form.value.national_id || form.value.national_id.trim() === '') {
    errors.national_id = true
    hasError = true
  }

  if (!form.value.phone || form.value.phone.trim() === '') {
    errors.phone = true
    hasError = true
  }

  if (hasError) return

  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
