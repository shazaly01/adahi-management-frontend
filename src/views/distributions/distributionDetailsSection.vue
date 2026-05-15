<template>
  <div class="space-y-5">
    <h3 class="text-lg font-bold text-emerald-700 dark:text-emerald-400 border-b pb-2">
      2. تفاصيل الأضحية والدفع
    </h3>

    <!-- نوع الأضحية (باستخدام AppDropdown المخصص) -->
    <div>
      <AppDropdown
        id="sacrifice-type"
        label="اختر نوع الأضحية"
        v-model="form.sacrifice_type_id"
        :options="sacrificeTypes"
        optionLabel="name"
        optionValue="id"
        placeholder="ابحث واختر نوع الأضحية..."
        :loading="isLoadingTypes"
        :required="true"
        @update:modelValue="handleSacrificeTypeChange"
      />
    </div>

    <!-- طريقة الدفع (أزرار تبديل) -->
    <div class="mt-5">
      <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3"
        >طريقة الدفع</label
      >
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl w-fit">
        <button
          v-for="method in paymentMethods"
          :key="method.value"
          type="button"
          @click="setPaymentMethod(method.value)"
          :class="[
            'px-6 py-2.5 rounded-lg font-bold transition-all text-sm',
            form.payment_method === method.value
              ? 'bg-white dark:bg-gray-700 shadow-md text-emerald-700 dark:text-emerald-400 border border-gray-200 dark:border-gray-700'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
          ]"
        >
          {{ method.label }}
        </button>
      </div>
    </div>

    <!-- الحقول الشرطية (تظهر وتختفي تلقائياً) -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
    >
      <!-- السعر الفعلي (يظهر في الكاش والأقساط) -->
      <div v-if="form.payment_method !== 'free'">
        <AppInput
          id="actual-price"
          label="السعر الفعلي (SDG)"
          v-model="form.actual_price"
          type="number"
          placeholder="أدخل المبلغ بالجنيه السوداني"
          required
          dir="ltr"
        />
      </div>

      <!-- عدد الأشهر (يظهر في الأقساط فقط) -->
      <div v-if="form.payment_method === 'installments'">
        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
          >عدد أشهر الأقساط</label
        >
        <div class="flex items-center gap-2">
          <AppInput
            id="months-count"
            v-model="form.months_count"
            type="number"
            placeholder="مثال: 6"
            class="flex-grow"
            required
            dir="ltr"
          />
          <!-- أزرار اختصار لسرعة الإدخال -->
          <button
            type="button"
            @click="form.months_count = 3"
            class="px-4 py-2 mt-5 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 border border-emerald-200"
          >
            +3
          </button>
          <button
            type="button"
            @click="form.months_count = 6"
            class="px-4 py-2 mt-5 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 border border-emerald-200"
          >
            +6
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  sacrificeTypes: {
    type: Array,
    required: true,
    default: () => [],
  },
  isLoadingTypes: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update'])

const paymentMethods = [
  { label: 'مجاني', value: 'free' },
  { label: 'نقداً (كاش)', value: 'cash' },
  { label: 'أقساط', value: 'installments' },
]

const form = reactive({
  sacrifice_type_id: null,
  payment_method: 'free',
  actual_price: 0,
  months_count: null,
})

let isEditModeLoad = false // قفل لمنع مسح السعر المحفوظ أثناء تحميل بيانات التعديل

// التعبئة التلقائية للسعر عند تغيير نوع الأضحية
const handleSacrificeTypeChange = (newValue) => {
  if (isEditModeLoad) return

  if (newValue && form.payment_method !== 'free') {
    const selectedType = props.sacrificeTypes.find((type) => type.id === newValue)
    if (selectedType && selectedType.base_price !== null && selectedType.base_price !== undefined) {
      form.actual_price = Number(selectedType.base_price)
    }
  }
}

const setPaymentMethod = (method) => {
  form.payment_method = method
  if (method === 'free') {
    form.actual_price = 0
    form.months_count = null
  } else if (method === 'cash') {
    form.months_count = null
    // جلب السعر الأساسي إذا كان السعر الحالي فارغاً
    if (form.actual_price === 0 || form.actual_price === '') {
      if (form.sacrifice_type_id) {
        const selectedType = props.sacrificeTypes.find((type) => type.id === form.sacrifice_type_id)
        form.actual_price = selectedType?.base_price || ''
      } else {
        form.actual_price = ''
      }
    }
  } else {
    // الأقساط
    if (form.actual_price === 0 || form.actual_price === '') {
      if (form.sacrifice_type_id) {
        const selectedType = props.sacrificeTypes.find((type) => type.id === form.sacrifice_type_id)
        form.actual_price = selectedType?.base_price || ''
      } else {
        form.actual_price = ''
      }
    }
    if (!form.months_count) form.months_count = 3
  }
}

// مراقبة التغييرات وإرسالها فوراً للمكون الأب
watch(
  form,
  (newVal) => {
    emit('update', { ...newVal })
  },
  { deep: true },
)

const resetSection = () => {
  form.sacrifice_type_id = null
  form.payment_method = 'free'
  form.actual_price = 0
  form.months_count = null
}

// دالة يتم استدعاؤها من المكون الأب عند الضغط على "تعديل"
const loadExistingDetails = (distributionData) => {
  if (!distributionData) return

  isEditModeLoad = true // تشغيل القفل لتخطي التعبئة التلقائية

  form.sacrifice_type_id = distributionData.sacrifice_type_id
  form.payment_method = distributionData.payment_method || 'free'
  form.actual_price = distributionData.actual_price || 0

  if (distributionData.payment_method === 'installments' && distributionData.installment_contract) {
    form.months_count = distributionData.installment_contract.months_count || 3
  } else {
    form.months_count = null
  }

  // إيقاف القفل بعد فترة قصيرة جداً
  setTimeout(() => {
    isEditModeLoad = false
  }, 100)
}

defineExpose({
  resetSection,
  loadExistingDetails,
})
</script>
