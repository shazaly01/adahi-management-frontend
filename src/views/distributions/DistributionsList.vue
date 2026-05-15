<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <!-- القسم الأيمن (70%): مساحة عمل الإدخال السريع والتعديل -->
    <div class="col-span-1 lg:col-span-8 space-y-6">
      <!-- شريط تنبيه وضع التعديل -->
      <div
        v-if="editingDistributionId"
        class="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-lg flex justify-between items-center shadow-sm"
      >
        <div class="font-bold">
          <span class="text-xl mr-2">✏️</span> أنت الآن في وضع تعديل الإيصال رقم:
          <span class="text-amber-900">#{{ editingReceiptNumber }}</span>
        </div>
        <AppButton
          type="button"
          variant="secondary"
          @click="cancelEdit"
          class="text-sm px-4 py-2 bg-white hover:bg-gray-50 border-amber-200"
        >
          إلغاء التعديل
        </AppButton>
      </div>

      <!-- 1. مكون بيانات المستفيد -->
      <AppCard
        class="border-t-4 border-t-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-none transition-all"
        :class="{ 'ring-2 ring-amber-400': editingDistributionId }"
      >
        <BeneficiarySection
          ref="beneficiarySectionRef"
          @beneficiary-confirmed="handleBeneficiaryConfirmed"
          @beneficiary-reset="handleBeneficiaryReset"
        />
      </AppCard>

      <!-- 2. مكون تفاصيل التوزيع -->
      <AppCard
        class="border-t-4 border-t-emerald-500 shadow-lg shadow-emerald-100 dark:shadow-none transition-all"
        :class="{
          'opacity-50 pointer-events-none': !beneficiaryId,
          'ring-2 ring-amber-400': editingDistributionId,
        }"
      >
        <DistributionDetailsSection
          ref="distributionDetailsSectionRef"
          :sacrificeTypes="sacrificeTypeStore.sacrificeTypes"
          :isLoadingTypes="sacrificeTypeStore.loading"
          @update="handleDistributionUpdate"
        />

        <!-- زر تنفيذ التوزيع النهائي (إضافة أو تعديل) -->
        <div class="mt-8 flex justify-end gap-3">
          <AppButton
            type="button"
            @click="submitDistribution"
            :disabled="isSubmitting || !isFormValid"
            class="w-full md:w-auto px-10 py-4 text-lg font-bold"
          >
            <span v-if="isSubmitting">جاري الحفظ...</span>
            <span v-else-if="editingDistributionId">حفظ التعديلات (F2)</span>
            <span v-else>حفظ وإصدار أمر الصرف (F2)</span>
          </AppButton>
        </div>
      </AppCard>
    </div>

    <!-- القسم الأيسر (30%): سجل العمليات الأخيرة -->
    <div class="col-span-1 lg:col-span-4 h-full">
      <RecentDistributionsTable
        :distributions="recentDistributions"
        @print-single="printSingle"
        @print-bulk="printBulk"
        @edit-item="startEdit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

// المكونات
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import BeneficiarySection from './beneficiarySection.vue'
import DistributionDetailsSection from './distributionDetailsSection.vue'
import RecentDistributionsTable from './recentDistributionsTable.vue'

// Services & Stores
import distributionService from '@/services/distributionService'
import { useSacrificeTypeStore } from '@/stores/sacrificeTypeStore'

const toast = useToast()
const sacrificeTypeStore = useSacrificeTypeStore()
const router = useRouter()

// --- State ---
const beneficiaryId = ref(null)
const distributionDetails = ref({})
const isSubmitting = ref(false)
const recentDistributions = ref([])

// Edit Mode State
const editingDistributionId = ref(null)
const editingReceiptNumber = ref('')

// --- Refs لتصفير وحقن الأبناء ---
const beneficiarySectionRef = ref(null)
const distributionDetailsSectionRef = ref(null)

// --- جلب البيانات الأولية ---
const fetchInitialData = async () => {
  // جلب أنواع الأضاحي للقائمة المنسدلة
  await sacrificeTypeStore.fetchSacrificeTypes(1, '')

  // جلب آخر التوزيعات لعرضها في الجدول الجانبي
  try {
    const res = await distributionService.get(1, '')
    recentDistributions.value = res.data?.data || []
  } catch (error) {
    console.error('فشل جلب التوزيعات السابقة', error)
  }
}

onMounted(() => {
  fetchInitialData()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// --- Handlers ---
const handleBeneficiaryConfirmed = (id) => {
  beneficiaryId.value = id
}

const handleBeneficiaryReset = () => {
  beneficiaryId.value = null
}

const handleDistributionUpdate = (details) => {
  distributionDetails.value = details
}

// Validation
const isFormValid = computed(() => {
  if (!beneficiaryId.value) return false
  if (!distributionDetails.value.sacrifice_type_id) return false
  if (
    distributionDetails.value.payment_method !== 'free' &&
    (!distributionDetails.value.actual_price || distributionDetails.value.actual_price <= 0)
  )
    return false
  if (
    distributionDetails.value.payment_method === 'installments' &&
    (!distributionDetails.value.months_count || distributionDetails.value.months_count < 1)
  )
    return false
  return true
})

// --- الإرسال (إضافة أو تعديل) ---
const submitDistribution = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  try {
    const payload = {
      beneficiary_id: beneficiaryId.value,
      ...distributionDetails.value,
    }

    let response
    let savedRecord

    if (editingDistributionId.value) {
      // وضع التعديل
      response = await distributionService.update(editingDistributionId.value, payload)
      savedRecord = response.data?.data || response.data

      // تحديث السجل في المصفوفة المحلية
      const index = recentDistributions.value.findIndex((d) => d.id === editingDistributionId.value)
      if (index !== -1) recentDistributions.value[index] = savedRecord

      toast.success(`تم تحديث الإيصال رقم #${savedRecord.receipt_number} بنجاح.`)
    } else {
      // وضع الإضافة
      response = await distributionService.create(payload)
      savedRecord = response.data?.data || response.data

      // إضافة السجل الجديد في أعلى القائمة
      recentDistributions.value.unshift(savedRecord)

      toast.success(`تم حفظ الإيصال رقم #${savedRecord.receipt_number} بنجاح!`)
    }

    // تصفير مساحة العمل
    resetWorkspace()
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSubmitting.value = false
  }
}

// --- إدارة وضع التعديل ---
const startEdit = (item) => {
  editingDistributionId.value = item.id
  editingReceiptNumber.value = item.receipt_number

  // حقن بيانات المستفيد في القسم الأول
  if (beneficiarySectionRef.value && item.beneficiary) {
    beneficiarySectionRef.value.loadExistingBeneficiary(item.beneficiary)
  }

  // حقن تفاصيل التوزيع في القسم الثاني
  if (distributionDetailsSectionRef.value) {
    distributionDetailsSectionRef.value.loadExistingDetails(item)
  }
}

const cancelEdit = () => {
  resetWorkspace()
  toast.info('تم إلغاء التعديل.')
}

const resetWorkspace = () => {
  editingDistributionId.value = null
  editingReceiptNumber.value = ''
  beneficiaryId.value = null
  if (beneficiarySectionRef.value) beneficiarySectionRef.value.resetSection()
  if (distributionDetailsSectionRef.value) distributionDetailsSectionRef.value.resetSection()
}

// --- Printing ---
const printSingle = (id) => {
  const routeData = router.resolve({ name: 'DistributionPrint', query: { ids: id } })
  window.open(routeData.href, '_blank')
}

const printBulk = (ids) => {
  const idsString = ids.join(',')
  const routeData = router.resolve({ name: 'DistributionPrint', query: { ids: idsString } })
  window.open(routeData.href, '_blank')
}

// --- Keyboard Shortcuts ---
const handleKeydown = (e) => {
  if (e.key === 'F2') {
    e.preventDefault()
    if (isFormValid.value && !isSubmitting.value) {
      submitDistribution()
    }
  } else if (e.key === 'Escape' && editingDistributionId.value) {
    e.preventDefault()
    cancelEdit()
  }
}
</script>
