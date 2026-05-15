<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-2xl transform flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
        >
          <!-- رأس النافذة -->
          <div
            class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 shrink-0"
          >
            <h3 class="text-lg font-semibold text-text-primary">
              إدارة دفعات الأقساط - {{ contract?.beneficiary?.name }}
            </h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border"
              aria-label="Close"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="overflow-y-auto pr-1 custom-scrollbar">
            <!-- ملخص حالة العقد -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-surface-base p-4 rounded-lg border border-surface-border text-center">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">إجمالي العقد</p>
                <p class="text-xl font-bold font-mono text-text-primary">
                  {{ formatCurrency(contract?.total_amount) }}
                </p>
              </div>
              <div
                class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/30 text-center"
              >
                <p class="text-sm text-emerald-600 dark:text-emerald-400 mb-1">المدفوع</p>
                <p class="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(contract?.paid_amount) }}
                </p>
              </div>
              <div
                class="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg border border-rose-100 dark:border-rose-800/30 text-center"
              >
                <p class="text-sm text-rose-600 dark:text-rose-400 mb-1">المتبقي</p>
                <p class="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                  {{ formatCurrency(remainingAmount) }}
                </p>
              </div>
            </div>

            <!-- نموذج إضافة دفعة جديدة (يختفي إذا اكتمل السداد) -->
            <div v-if="remainingAmount > 0">
              <h4 class="font-bold text-text-primary mb-4 border-b border-surface-border pb-2">
                تسجيل دفعة جديدة
              </h4>
              <InstallmentPaymentForm
                :contract-id="contract?.id"
                :remaining-amount="remainingAmount"
                :is-saving="isSaving"
                @submit="handlePaymentSubmit"
                @cancel="close"
              />
            </div>

            <!-- رسالة اكتمال السداد -->
            <div
              v-else
              class="bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 p-6 rounded-lg text-center"
            >
              <svg
                class="w-12 h-12 text-emerald-500 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 class="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                هذا العقد مكتمل السداد
              </h3>
              <p class="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                لا توجد مبالغ متبقية لتحصيلها من هذا المستفيد.
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useInstallmentPaymentStore } from '@/stores/installmentPaymentStore'
import InstallmentPaymentForm from './InstallmentPaymentForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  contract: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'payment-added'])
const toast = useToast()
const paymentStore = useInstallmentPaymentStore()
const isSaving = ref(false)

const remainingAmount = computed(() => {
  if (!props.contract) return 0
  const total = Number(props.contract.total_amount) || 0
  const paid = Number(props.contract.paid_amount) || 0
  return Math.max(0, total - paid)
})

const close = () => {
  emit('update:modelValue', false)
}

const handlePaymentSubmit = async (formData) => {
  isSaving.value = true
  try {
    await paymentStore.createPayment(formData)
    toast.success('تم تسجيل الدفعة بنجاح.')
    emit('payment-added') // لإبلاغ الشاشة الرئيسية بتحديث البيانات
    close()
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدفعة.'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 ج.س'
  return (
    new Intl.NumberFormat('ar-SD', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value) + ' ج.س'
  )
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
