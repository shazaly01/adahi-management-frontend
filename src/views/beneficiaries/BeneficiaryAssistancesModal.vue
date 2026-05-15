<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  >
    <div
      class="bg-surface-section w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
    >
      <div class="flex justify-between items-center p-5 border-b border-surface-border">
        <h2 class="text-xl font-bold text-text-primary">
          سجل المساعدات: <span class="text-primary">{{ beneficiary?.name }}</span>
        </h2>
        <button
          @click="closeModal"
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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

      <div class="p-5 overflow-y-auto flex-1 bg-surface-background">
        <div v-if="loading" class="flex justify-center items-center py-10">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="beneficiaryAssistances">
          <div class="mb-8">
            <h3 class="text-lg font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              المساعدات المالية ({{ beneficiaryAssistances.financial_assistances.length }})
            </h3>

            <div
              v-if="beneficiaryAssistances.financial_assistances.length === 0"
              class="text-gray-500 text-sm italic p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              لا توجد مساعدات مالية مسجلة لهذا المستفيد.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="fin in beneficiaryAssistances.financial_assistances"
                :key="fin.id"
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-surface-border rounded-lg bg-surface-section shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-center gap-4 mb-3 sm:mb-0">
                  <span
                    class="px-3 py-1 text-sm font-bold rounded-full whitespace-nowrap"
                    :class="
                      fin.type === 'social'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    "
                  >
                    {{ fin.type === 'social' ? 'اجتماعية' : 'علاجية' }}
                  </span>

                  <div class="flex flex-col">
                    <span class="text-lg font-bold text-text-primary">
                      {{ Number(fin.approved_amount).toLocaleString() }}
                      <span class="text-sm font-normal text-gray-500">د.ل</span>
                    </span>
                    <span class="text-xs text-gray-500 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      {{ fin.request_date }}
                    </span>
                  </div>
                </div>

                <button
                  @click="handlePrint(fin.id, 'financial')"
                  class="flex items-center gap-2 text-sm text-primary hover:text-white border border-primary hover:bg-primary px-4 py-1.5 rounded-lg transition-colors w-full sm:w-auto justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    ></path>
                  </svg>
                  طباعة السند
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-bold text-amber-600 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                ></path>
              </svg>
              المساعدات العينية ({{ beneficiaryAssistances.in_kind_assistances.length }})
            </h3>

            <div
              v-if="beneficiaryAssistances.in_kind_assistances.length === 0"
              class="text-gray-500 text-sm italic p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              لا توجد مساعدات عينية مسجلة لهذا المستفيد.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="inkind in beneficiaryAssistances.in_kind_assistances"
                :key="inkind.id"
                class="p-4 border border-surface-border rounded-lg bg-surface-section shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b border-surface-border pb-3"
                >
                  <div
                    class="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300"
                  >
                    <svg
                      class="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    التاريخ: {{ inkind.request_date }}
                  </div>

                  <button
                    @click="handlePrint(inkind.id, 'in_kind')"
                    class="flex items-center gap-2 text-sm text-amber-600 hover:text-white border border-amber-600 hover:bg-amber-600 px-4 py-1.5 rounded-lg transition-colors w-full sm:w-auto justify-center"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      ></path>
                    </svg>
                    طباعة السند
                  </button>
                </div>

                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span class="font-bold text-text-primary">سبب المساعدة:</span>
                  {{ inkind.reasons || 'لا يوجد' }}
                </p>

                <div
                  class="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700"
                >
                  <span class="text-xs font-bold text-gray-500 block mb-2"
                    >الأصناف المصروفة ({{ inkind.items.length }} صنف):</span
                  >
                  <ul class="list-disc list-inside text-sm text-text-primary space-y-1">
                    <li v-for="item in inkind.items" :key="item.id">{{ item.description }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-surface-border flex justify-end bg-surface-section">
        <button
          @click="closeModal"
          class="px-5 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
        >
          إغلاق
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useBeneficiaryStore } from '@/stores/beneficiaryStore'
import { useToast } from 'vue-toastification'

const props = defineProps({
  modelValue: Boolean,
  beneficiary: Object,
})

const emit = defineEmits(['update:modelValue'])
const toast = useToast()

const beneficiaryStore = useBeneficiaryStore()
const { loading, beneficiaryAssistances } = storeToRefs(beneficiaryStore)

const closeModal = () => {
  emit('update:modelValue', false)
}

// دالة معالجة الطباعة
const handlePrint = (assistanceId, type) => {
  // 1. العثور على المساعدة المطلوبة من الستور
  let selectedAssistance = null

  if (type === 'financial') {
    selectedAssistance = beneficiaryAssistances.value.financial_assistances.find(
      (a) => a.id === assistanceId,
    )
  } else if (type === 'in_kind') {
    selectedAssistance = beneficiaryAssistances.value.in_kind_assistances.find(
      (a) => a.id === assistanceId,
    )
  }

  if (!selectedAssistance) {
    toast.error('لم يتم العثور على بيانات المساعدة')
    return
  }

  // 2. تجميع البيانات المطلوبة (بيانات المستفيد الأساسية + بيانات المساعدة)
  const dataToPrint = {
    type: type,
    beneficiary: {
      name: props.beneficiary.name,
      national_id: props.beneficiary.national_id,
      phone: props.beneficiary.phone,
    },
    assistance: selectedAssistance,
  }

  // 3. حفظ البيانات في الـ SessionStorage
  sessionStorage.setItem('printAssistanceData', JSON.stringify(dataToPrint))

  // 4. فتح صفحة الطباعة في نافذة جديدة
  window.open('/print/assistance', '_blank')
}
</script>
