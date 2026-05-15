<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- المبلغ المحصل -->
        <div class="md:col-span-2">
          <AppInput
            id="payment-amount"
            label="المبلغ المحصل (ج.س)"
            v-model.number="form.amount"
            type="number"
            min="1"
            :max="remainingAmount"
            placeholder="أدخل المبلغ..."
            required
          />
          <p v-if="errors.amount" class="text-rose-500 text-xs mt-1 font-bold">
            المبلغ غير صالح. يجب أن لا يتجاوز المبلغ المتبقي ({{ remainingAmount }} ج.س)
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel" :disabled="isSaving">
        إلغاء
      </AppButton>
      <AppButton type="submit" :disabled="isSaving || isOverLimit">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ الدفعة</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  contractId: {
    type: [Number, String],
    required: true,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  installment_contract_id: props.contractId,
  amount: props.remainingAmount, // افتراضياً نضع المبلغ المتبقي بالكامل كقيمة مساعدة
})

const errors = reactive({
  amount: false,
})

// التحقق الفوري (Computed) لمنع الضغط على زر الحفظ إذا تجاوز المبلغ المتبقي
const isOverLimit = computed(() => {
  return form.value.amount > props.remainingAmount || form.value.amount <= 0
})

watch(
  () => props.contractId,
  (newId) => {
    form.value.installment_contract_id = newId
    form.value.amount = props.remainingAmount
    errors.amount = false
  },
)

const handleSubmit = () => {
  errors.amount = false

  if (isOverLimit.value) {
    errors.amount = true
    return
  }

  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
