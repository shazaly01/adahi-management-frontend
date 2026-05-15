<template>
  <div>
    <!-- المرحلة 1: التحقق من الرقم الوطني (تظهر فقط في حالة الإضافة الجديدة) -->
    <div v-if="step === 1 && !isEditMode" class="space-y-5">
      <div class="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-md mb-6">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <span class="font-bold">الخطوة الأولى:</span> يرجى إدخال الرقم الوطني للمستفيد للتحقق من
          أهليته وعدم استلامه لأضحية مسبقاً هذا العام.
        </p>
      </div>

      <AppInput
        id="check-national-id"
        label="الرقم الوطني للمستفيد"
        v-model="searchNationalId"
        placeholder="أدخل الرقم الوطني للتحقق..."
        @keyup.enter="verifyBeneficiary"
        required
      />

      <div class="flex justify-end mt-4">
        <AppButton
          type="button"
          @click="verifyBeneficiary"
          :disabled="isChecking"
          :loading="isChecking"
        >
          التحقق من المستفيد
        </AppButton>
      </div>
    </div>

    <!-- المرحلة 2: نموذج التوزيع الفعلي -->
    <form v-else @submit.prevent="handleSubmit">
      <!-- بطاقة معلومات المستفيد (للقراءة فقط) -->
      <div
        class="mb-6 p-4 bg-surface-section border border-surface-border rounded-lg shadow-sm flex items-center justify-between"
      >
        <div>
          <h3 class="font-bold text-text-primary text-lg">{{ verifiedBeneficiary?.name }}</h3>
          <p class="text-sm text-text-muted mt-1 font-mono">
            الرقم الوطني: {{ verifiedBeneficiary?.national_id }}
          </p>
        </div>
        <div class="text-left">
          <span
            class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold"
          >
            مستحق للتوزيع
          </span>
          <p class="text-xs text-text-muted mt-1">
            أفراد الأسرة: {{ verifiedBeneficiary?.family_members_count || 'غير محدد' }}
          </p>
        </div>
      </div>

      <div class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- نوع الأضحية -->
          <div>
            <AppDropdown
              id="sacrifice-type-id"
              label="نوع الأضحية المُسلّمة"
              v-model="form.sacrifice_type_id"
              :options="sacrificeTypesList"
              placeholder="اختر نوع الأضحية"
              :disabled="isEditMode"
              required
            />
            <p v-if="errors.sacrifice_type_id" class="text-rose-500 text-xs mt-1 font-bold">
              يجب تحديد نوع الأضحية
            </p>
          </div>

          <!-- طريقة الدفع -->
          <div>
            <AppDropdown
              id="payment-method"
              label="آلية الاستلام (طريقة الدفع)"
              v-model="form.payment_method"
              :options="paymentMethodOptions"
              placeholder="اختر طريقة الدفع"
              :disabled="isEditMode"
              required
            />
          </div>
        </div>

        <!-- السعر الفعلي وعدد الأشهر (يظهر ديناميكياً) -->
        <div v-if="form.payment_method !== 'free'" class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <AppInput
              id="actual-price"
              label="السعر الفعلي (ج.س)"
              v-model.number="form.actual_price"
              type="number"
              min="1"
              placeholder="أدخل السعر المطلوب دفعه"
              :disabled="isEditMode"
              required
            />
            <p v-if="errors.actual_price" class="text-rose-500 text-xs mt-1 font-bold">
              السعر الفعلي مطلوب لهذه الآلية ويجب أن يكون أكبر من صفر
            </p>
          </div>

          <!-- عدد الأشهر (يظهر فقط في حالة التقسيط) -->
          <div v-if="form.payment_method === 'installments'">
            <AppInput
              id="months-count"
              label="عدد أشهر التقسيط"
              v-model.number="form.months_count"
              type="number"
              min="1"
              placeholder="أدخل عدد الأشهر"
              :disabled="isEditMode"
              required
            />
            <p v-if="errors.months_count" class="text-rose-500 text-xs mt-1 font-bold">
              عدد أشهر التقسيط مطلوب ويجب أن يكون 1 على الأقل
            </p>
          </div>
        </div>

        <!-- قسم المرفقات (إلزامي في حالة الإضافة فقط) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-surface-border">
          <!-- صورة المستفيد -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              صورة المستفيد مع الأضحية <span v-if="!isEditMode" class="text-rose-500">*</span>
            </label>
            <input
              type="file"
              id="beneficiary-image"
              @change="(e) => handleFileUpload(e, 'beneficiary_image')"
              accept="image/jpeg,image/png,image/jpg"
              class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
            />
            <div v-if="form.beneficiary_image" class="mt-2 text-xs text-primary font-bold">
              الملف المحدد: {{ form.beneficiary_image.name }}
            </div>
            <div v-else-if="isEditMode" class="mt-2 text-xs text-amber-600">
              يوجد ملف مسبقاً. ارفع ملفاً جديداً فقط إذا أردت استبداله.
            </div>
            <p v-if="errors.beneficiary_image" class="text-rose-500 text-xs mt-1 font-bold">
              يرجى إرفاق صورة المستفيد
            </p>
          </div>

          <!-- مستند الإثبات -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              صورة مستند الإثبات (الرقم الوطني)
              <span v-if="!isEditMode" class="text-rose-500">*</span>
            </label>
            <input
              type="file"
              id="beneficiary-document"
              @change="(e) => handleFileUpload(e, 'beneficiary_document')"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
            />
            <div v-if="form.beneficiary_document" class="mt-2 text-xs text-primary font-bold">
              الملف المحدد: {{ form.beneficiary_document.name }}
            </div>
            <div v-else-if="isEditMode" class="mt-2 text-xs text-amber-600">
              يوجد ملف مسبقاً. ارفع ملفاً جديداً فقط إذا أردت استبداله.
            </div>
            <p v-if="errors.beneficiary_document" class="text-rose-500 text-xs mt-1 font-bold">
              يرجى إرفاق مستند الإثبات
            </p>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
        <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
        <AppButton type="submit" :disabled="isSaving">
          <span v-if="isSaving">جاري المعالجة...</span>
          <span v-else>{{ isEditMode ? 'تحديث المرفقات' : 'اعتماد وإنهاء التوزيع' }}</span>
        </AppButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد الـ Stores
import { useSacrificeTypeStore } from '@/stores/sacrificeTypeStore'
import { useBeneficiaryStore } from '@/stores/beneficiaryStore'

// مكونات UI
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
const toast = useToast()

// التهيئة والمخازن
const sacrificeTypeStore = useSacrificeTypeStore()
const beneficiaryStore = useBeneficiaryStore()
const { sacrificeTypes } = storeToRefs(sacrificeTypeStore)

// خيارات القوائم
const sacrificeTypesList = computed(() =>
  sacrificeTypes.value.map((type) => ({ id: type.id, name: type.name })),
)
const paymentMethodOptions = [
  { id: 'free', name: 'مجاني (دعم كامل)' },
  { id: 'cash', name: 'دفع نقدي (كاش)' },
  { id: 'installments', name: 'تقسيط' },
]

// حالة المكون
const step = ref(1)
const isEditMode = computed(() => !!props.initialData && !!props.initialData.id)
const searchNationalId = ref('')
const isChecking = ref(false)
const verifiedBeneficiary = ref(null)

// حالة النموذج والأخطاء
const form = ref({
  id: null,
  beneficiary_id: '',
  sacrifice_type_id: '',
  payment_method: 'free',
  actual_price: 0,
  months_count: null, // الحقل الجديد
  beneficiary_image: null,
  beneficiary_document: null,
})

const errors = reactive({
  sacrifice_type_id: false,
  actual_price: false,
  months_count: false, // التحقق من الحقل الجديد
  beneficiary_image: false,
  beneficiary_document: false,
})

onMounted(async () => {
  if (sacrificeTypes.value.length === 0) {
    await sacrificeTypeStore.fetchSacrificeTypes(1, '')
  }
})

// مراقبة وضع التعديل لتخطي المرحلة الأولى
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      step.value = 2
      verifiedBeneficiary.value = newData.beneficiary || {}
      form.value = {
        id: newData.id,
        beneficiary_id: newData.beneficiary_id,
        sacrifice_type_id: newData.sacrifice_type_id,
        payment_method: newData.payment_method || 'free',
        actual_price: newData.actual_price ? Number(newData.actual_price) : 0,
        months_count: newData.months_count ? Number(newData.months_count) : null,
        beneficiary_image: null,
        beneficiary_document: null,
      }
    }
  },
  { immediate: true, deep: true },
)

// مراقبة طريقة الدفع لتصفير السعر وتصفير الأشهر إذا تغيرت الطريقة
watch(
  () => form.value.payment_method,
  (newMethod) => {
    if (newMethod === 'free') {
      form.value.actual_price = 0
      form.value.months_count = null
      errors.actual_price = false
      errors.months_count = false
    } else if (newMethod === 'cash') {
      form.value.months_count = null
      errors.months_count = false
    }
  },
)

// المرحلة 1: التحقق من المستفيد
const verifyBeneficiary = async () => {
  if (!searchNationalId.value) {
    toast.warning('يرجى إدخال الرقم الوطني أولاً.')
    return
  }

  isChecking.value = true
  try {
    const result = await beneficiaryStore.checkNationalId(searchNationalId.value)

    if (!result.exists) {
      toast.error('المستفيد غير مسجل في النظام. يرجى إضافته من شاشة المستفيدين أولاً.')
    } else if (result.has_received) {
      toast.error('عذراً، هذا المستفيد استلم أضحية مسبقاً ولا يحق له استلام أخرى.')
    } else {
      verifiedBeneficiary.value = result.beneficiary
      form.value.beneficiary_id = result.beneficiary.id
      toast.success('تم التحقق. المستفيد مستحق.')
      step.value = 2 // الانتقال للمرحلة الثانية
    }
  } catch (err) {
    // الأخطاء معالجة مسبقاً في Store
  } finally {
    isChecking.value = false
  }
}

// معالجة رفع الملفات
const handleFileUpload = (event, fieldName) => {
  const file = event.target.files[0]
  if (file) {
    form.value[fieldName] = file
    errors[fieldName] = false
  }
}

const handleSubmit = () => {
  // إعادة تعيين الأخطاء
  errors.sacrifice_type_id = false
  errors.actual_price = false
  errors.months_count = false
  errors.beneficiary_image = false
  errors.beneficiary_document = false

  let hasError = false

  // التحقق يتم بشكل أساسي في حالة الإضافة
  if (!isEditMode.value) {
    if (!form.value.sacrifice_type_id) {
      errors.sacrifice_type_id = true
      hasError = true
    }
    if (
      form.value.payment_method !== 'free' &&
      (!form.value.actual_price || form.value.actual_price < 1)
    ) {
      errors.actual_price = true
      hasError = true
    }
    if (
      form.value.payment_method === 'installments' &&
      (!form.value.months_count || form.value.months_count < 1)
    ) {
      errors.months_count = true
      hasError = true
    }
    if (!form.value.beneficiary_image) {
      errors.beneficiary_image = true
      hasError = true
    }
    if (!form.value.beneficiary_document) {
      errors.beneficiary_document = true
      hasError = true
    }
  } else {
    // في وضع التعديل، التأكد من السعر وعدد الأشهر إذا تم تعديلها
    if (
      form.value.payment_method !== 'free' &&
      (!form.value.actual_price || form.value.actual_price < 1)
    ) {
      errors.actual_price = true
      hasError = true
    }
    if (
      form.value.payment_method === 'installments' &&
      (!form.value.months_count || form.value.months_count < 1)
    ) {
      errors.months_count = true
      hasError = true
    }
  }

  if (hasError) return

  const payload = { ...form.value }
  emit('submit', payload)
}

const handleCancel = () => {
  if (step.value === 2 && !isEditMode.value) {
    step.value = 1
    searchNationalId.value = ''
    verifiedBeneficiary.value = null
  } else {
    emit('cancel')
  }
}
</script>
