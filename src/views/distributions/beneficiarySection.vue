<template>
  <div class="space-y-5">
    <h3 class="text-lg font-bold text-indigo-700 dark:text-indigo-400 border-b pb-2">
      1. بيانات المستفيد
    </h3>

    <!-- مرحلة البحث الذكي (تختفي عند اختيار مستفيد أو في وضع التعديل) -->
    <div v-if="!isConfirmed" class="flex gap-3 items-end">
      <div class="flex-grow">
        <AppInput
          id="search-national-id"
          label="البحث بالرقم الوطني"
          v-model="searchQuery"
          placeholder="ادخل الرقم الوطني (18 رقم) واضغط Enter"
          @keyup.enter="searchBeneficiary"
          :disabled="isLoading"
          required
          dir="ltr"
        />
      </div>
      <AppButton @click="searchBeneficiary" :disabled="isLoading || !searchQuery" class="mb-1">
        <span v-if="isLoading">جاري...</span>
        <span v-else>بحث سريـع</span>
      </AppButton>
    </div>

    <!-- مرحلة عرض البيانات (مسجل مسبقاً، إدخال جديد، أو وضع تعديل) -->
    <div
      v-if="showDetails"
      class="bg-indigo-50 dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-4 transition-all"
    >
      <div v-if="isNew" class="text-sm font-bold text-rose-600 mb-2">
        * مستفيد جديد: يرجى إكمال البيانات واعتمادها أولاً لربطها بالتوزيع.
      </div>
      <div v-else class="text-sm font-bold text-emerald-600 mb-2 flex justify-between items-center">
        <span>* مستفيد مسجل في النظام.</span>
        <button
          type="button"
          @click="resetSection"
          class="text-xs text-indigo-500 hover:text-indigo-700 font-bold underline"
        >
          إلغاء وتغيير المستفيد
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          id="beneficiary-name"
          label="اسم المستفيد الرباعي"
          v-model="form.name"
          placeholder="أدخل الاسم بالكامل"
          :disabled="!isNew || isConfirmed"
          required
        />
        <AppInput
          id="beneficiary-phone"
          label="رقم الهاتف"
          v-model="form.phone"
          placeholder="أدخل رقم الهاتف"
          :disabled="!isNew || isConfirmed"
          required
          dir="ltr"
        />
        <AppInput
          id="beneficiary-job"
          label="رقم العمل / الوظيفة (اختياري)"
          v-model="form.job_number"
          placeholder="رقم العمل إن وجد"
          :disabled="!isNew || isConfirmed"
          dir="ltr"
        />
      </div>

      <!-- زر الحفظ للمستفيد الجديد فقط -->
      <div v-if="isNew && !isConfirmed" class="flex justify-end mt-4">
        <AppButton type="button" @click="saveNewBeneficiary" :disabled="isLoading">
          <span v-if="isLoading">جاري الحفظ...</span>
          <span v-else>اعتماد بيانات المستفيد</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import beneficiaryService from '@/services/beneficiaryService'

const emit = defineEmits(['beneficiary-confirmed', 'beneficiary-reset'])
const toast = useToast()

const searchQuery = ref('')
const isLoading = ref(false)
const showDetails = ref(false)
const isNew = ref(false)
const isConfirmed = ref(false)

const form = reactive({
  id: null,
  national_id: '',
  name: '',
  phone: '',
  job_number: '',
})

const searchBeneficiary = async () => {
  if (!searchQuery.value.trim()) {
    toast.warning('يرجى إدخال الرقم الوطني أو الهاتف للبحث.')
    return
  }

  isLoading.value = true
  try {
    const response = await beneficiaryService.checkByNationalId(searchQuery.value)
    const data = response.data?.data || response.data

    if (data && data.id) {
      isNew.value = false
      Object.assign(form, data)
      isConfirmed.value = true
      showDetails.value = true
      toast.success('تم جلب بيانات المستفيد بنجاح.')
      emit('beneficiary-confirmed', form.id)
    } else {
      handleNewBeneficiary()
    }
  } catch (error) {
    if (error.response?.status === 404) {
      handleNewBeneficiary()
    } else {
      toast.error('حدث خطأ أثناء البحث.')
    }
  } finally {
    isLoading.value = false
  }
}

const handleNewBeneficiary = () => {
  isNew.value = true
  isConfirmed.value = false
  showDetails.value = true
  form.id = null
  form.national_id = searchQuery.value
  form.name = ''
  form.phone = ''
  form.job_number = ''
}

const saveNewBeneficiary = async () => {
  if (!form.name || !form.phone) {
    toast.error('يرجى إدخال الاسم ورقم الهاتف.')
    return
  }

  isLoading.value = true
  try {
    const response = await beneficiaryService.create(form)
    const newBeneficiary = response.data?.data || response.data

    form.id = newBeneficiary.id
    isNew.value = false
    isConfirmed.value = true
    toast.success('تم حفظ المستفيد الجديد بنجاح.')

    emit('beneficiary-confirmed', form.id)
  } catch (error) {
    toast.error(error.response?.data?.message || 'فشل حفظ المستفيد.')
  } finally {
    isLoading.value = false
  }
}

const resetSection = () => {
  searchQuery.value = ''
  showDetails.value = false
  isNew.value = false
  isConfirmed.value = false
  form.id = null
  form.national_id = ''
  form.name = ''
  form.phone = ''
  form.job_number = ''
  emit('beneficiary-reset')
}

// دالة يتم استدعاؤها من المكون الأب عند الضغط على "تعديل"
const loadExistingBeneficiary = (beneficiaryData) => {
  if (!beneficiaryData) return

  Object.assign(form, {
    id: beneficiaryData.id,
    national_id: beneficiaryData.national_id || '',
    name: beneficiaryData.name || '',
    phone: beneficiaryData.phone || '',
    job_number: beneficiaryData.job_number || '',
  })

  isNew.value = false
  isConfirmed.value = true
  showDetails.value = true

  // تأكيد فوراً للأب
  emit('beneficiary-confirmed', form.id)
}

defineExpose({
  resetSection,
  loadExistingBeneficiary,
})
</script>
