<template>
  <div class="space-y-5">
    <h3 class="text-lg font-bold text-indigo-700 dark:text-indigo-400 border-b pb-2">
      1. بيانات المستفيد
    </h3>

    <div v-if="!isConfirmed" class="flex flex-wrap gap-3 items-end">
      <div class="flex-grow">
        <AppInput
          id="search-query"
          label="البحث السريع (رقم وطني أو هاتف)"
          v-model="searchQuery"
          placeholder="ادخل الرقم ثم اضغط Enter..."
          @keyup.enter="searchBeneficiary"
          :disabled="isLoading"
          required
          dir="ltr"
        >
          <template #label-append>
            <span
              v-if="searchStatus"
              class="text-xs transition-colors duration-300"
              :class="searchStatus.color"
            >
              {{ searchStatus.text }}
            </span>
          </template>
        </AppInput>
      </div>
      <AppButton @click="searchBeneficiary" :disabled="isLoading || !searchQuery" class="mb-1">
        <span v-if="isLoading">جاري...</span>
        <span v-else>بحث</span>
      </AppButton>
      <button
        type="button"
        @click="skipSearchAndAdd"
        class="mb-1 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 font-bold rounded-lg transition-colors border border-rose-200 dark:border-rose-800"
      >
        + مستفيد / جهة جديدة
      </button>
    </div>

    <div
      v-if="showDetails"
      class="bg-indigo-50 dark:bg-gray-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-4 transition-all"
    >
      <div
        v-if="isNew"
        class="text-sm font-bold text-rose-600 mb-2 flex justify-between items-center"
      >
        <span>* مستفيد جديد: يرجى إكمال البيانات واعتمادها.</span>
        <button
          v-if="!isConfirmed"
          type="button"
          @click="resetSection"
          class="text-xs text-indigo-500 hover:text-indigo-700 font-bold underline"
        >
          إلغاء
        </button>
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
          label="اسم المستفيد / الجهة"
          v-model="form.name"
          placeholder="أدخل الاسم بالكامل"
          :disabled="!isNew || isConfirmed"
          @keyup.enter="focusNext('beneficiary-national-id')"
          required
        />

        <AppInput
          id="beneficiary-national-id"
          label="الرقم الوطني (اختياري للجهات)"
          v-model="form.national_id"
          placeholder="12 رقم - اتركه فارغاً للجهات"
          :disabled="!isNew || isConfirmed"
          @keyup.enter="focusNext('beneficiary-phone')"
          dir="ltr"
        >
          <template #label-append>
            <span
              v-if="nidStatus"
              class="text-xs transition-colors duration-300"
              :class="nidStatus.color"
            >
              {{ nidStatus.text }}
            </span>
          </template>
        </AppInput>

        <AppInput
          id="beneficiary-phone"
          label="رقم الهاتف"
          v-model="form.phone"
          placeholder="مثال: 0912345678"
          :disabled="!isNew || isConfirmed"
          @keyup.enter="focusNext('beneficiary-job')"
          required
          dir="ltr"
        >
          <template #label-append>
            <span
              v-if="phoneStatus"
              class="text-xs transition-colors duration-300"
              :class="phoneStatus.color"
            >
              {{ phoneStatus.text }}
            </span>
          </template>
        </AppInput>

        <AppInput
          id="beneficiary-job"
          label="رقم العمل / الوظيفة (اختياري)"
          v-model="form.job_number"
          placeholder="رقم العمل إن وجد"
          :disabled="!isNew || isConfirmed"
          @keyup.enter="saveNewBeneficiary"
          dir="ltr"
        />
      </div>

      <div v-if="isNew && !isConfirmed" class="flex justify-end mt-4">
        <AppButton type="button" @click="saveNewBeneficiary" :disabled="isLoading">
          <span v-if="isLoading">جاري الحفظ...</span>
          <span v-else>اعتماد البيانات (Enter)</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
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

// === العدادات الذكية (اللوجيك الليبي) ===

// 1. عداد حقل البحث (يتعرف تلقائياً على ما تكتبه)
const searchStatus = computed(() => {
  const val = searchQuery.value.trim()
  if (!val) return null

  const isNum = /^\d+$/.test(val)
  if (!isNum) return { text: 'نص / اسم', color: 'text-indigo-500 font-bold' }

  let target = 12
  let typeLabel = 'وطني'

  // القاعدة: إذا بدأ بـ 0 فهو هاتف (10 أرقام)، وإذا بدأ بـ 1 أو 2 فهو وطني (12 رقم)
  if (val.startsWith('0')) {
    target = 10
    typeLabel = 'هاتف'
  } else if (val.startsWith('1') || val.startsWith('2')) {
    target = 12
    typeLabel = 'وطني'
  }

  const len = val.length
  if (len === target)
    return { text: `${len}/${target} ✔ ${typeLabel}`, color: 'text-emerald-600 font-bold' }
  if (len > target)
    return { text: `${len}/${target} ✖ ${typeLabel}`, color: 'text-rose-600 font-bold' }
  return { text: `${len}/${target} ${typeLabel}`, color: 'text-amber-500 font-bold' }
})

// 2. عداد الرقم الوطني (12 رقم)
const nidStatus = computed(() => {
  const val = form.national_id ? String(form.national_id).trim() : ''
  if (!val) return null

  const len = val.length
  const target = 12
  if (len === target) return { text: `${len}/${target} ✔`, color: 'text-emerald-600 font-bold' }
  if (len > target) return { text: `${len}/${target} ✖`, color: 'text-rose-600 font-bold' }
  return { text: `${len}/${target}`, color: 'text-amber-500 font-bold' }
})

// 3. عداد رقم الهاتف (10 أرقام)
const phoneStatus = computed(() => {
  const val = form.phone ? String(form.phone).trim() : ''
  if (!val) return null

  const len = val.length
  const target = 10
  if (len === target) return { text: `${len}/${target} ✔`, color: 'text-emerald-600 font-bold' }
  if (len > target) return { text: `${len}/${target} ✖`, color: 'text-rose-600 font-bold' }
  return { text: `${len}/${target}`, color: 'text-amber-500 font-bold' }
})

// دالة التركيز للتنقل السريع بالكيبورد
const focusNext = (elementId) => {
  const el = document.getElementById(elementId)
  if (el) {
    if (el.tagName === 'INPUT') {
      el.focus()
    } else {
      const internalInput = el.querySelector('input')
      if (internalInput) internalInput.focus()
    }
  }
}

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

// دالة التخطي والإضافة المباشرة
const skipSearchAndAdd = () => {
  searchQuery.value = ''
  handleNewBeneficiary(true)
}

const handleNewBeneficiary = (isDirectAdd = false) => {
  isNew.value = true
  isConfirmed.value = false
  showDetails.value = true

  form.id = null
  form.name = ''
  form.national_id = ''
  form.phone = ''
  form.job_number = ''

  if (!isDirectAdd) {
    const query = searchQuery.value.trim()
    const isNumeric = /^\d+$/.test(query)

    if (isNumeric) {
      // تفريق ذكي بناءً على بداية الرقم
      if (query.startsWith('0')) {
        form.phone = query
      } else {
        // إذا بدأ بـ 1 أو 2 أو أي رقم آخر، نضعه في الرقم الوطني
        form.national_id = query
      }
    } else {
      form.name = query
    }
  }

  nextTick(() => {
    if (!form.name) focusNext('beneficiary-name')
    else if (!form.national_id) focusNext('beneficiary-national-id')
    else if (!form.phone) focusNext('beneficiary-phone')
    else focusNext('beneficiary-job')
  })
}

const saveNewBeneficiary = async () => {
  if (!form.name || !form.phone) {
    toast.error('يرجى إدخال الاسم ورقم الهاتف على الأقل.')
    return
  }

  const payload = { ...form }
  if (payload.national_id === '') {
    payload.national_id = null
  }

  isLoading.value = true
  try {
    const response = await beneficiaryService.create(payload)
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

  nextTick(() => {
    focusNext('search-query')
  })
}

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

  emit('beneficiary-confirmed', form.id)
}

defineExpose({
  resetSection,
  loadExistingBeneficiary,
})
</script>
