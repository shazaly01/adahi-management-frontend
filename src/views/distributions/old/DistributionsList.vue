<!--src\views\distributions\DistributionsList.vue--->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة عمليات التوزيع</h1>
    </div>

    <!-- قسم الإضافة (يظهر فقط لمن لديه صلاحية) -->
    <div
      v-if="authStore.can('distribution.create')"
      class="mb-8 bg-surface-section p-6 rounded-xl border border-surface-border"
    >
      <h2 class="text-xl font-bold mb-5 text-text-primary">تنفيذ عملية توزيع جديدة</h2>
      <DistributionForm
        :key="formKey"
        :is-saving="isCreating"
        @submit="handleCreate"
        @cancel="cancelCreate"
      />
    </div>

    <!-- قسم البحث -->
    <div
      class="mb-6 bg-surface-section p-4 rounded-xl border border-surface-border flex items-center gap-4"
    >
      <div class="w-full md:w-1/3">
        <AppInput
          id="search-distributions"
          v-model="searchQuery"
          placeholder="ابحث برقم الإيصال أو اسم المستفيد..."
          @input="onSearch"
        />
      </div>
    </div>

    <!-- جدول عرض البيانات -->
    <DistributionsTable
      :distributions="distributions"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-distribution="openEditModal"
    />

    <!-- نافذة التعديل المنبثقة (لتحديث المرفقات فقط إن لزم الأمر) -->
    <DistributionModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :distribution="selectedDistribution"
      :is-saving="isEditing"
      @save="handleEdit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد الـ Stores
import { useAuthStore } from '@/stores/authStore'
import { useDistributionStore } from '@/stores/distributionStore'

// استيراد المكونات الأساسية
import AppInput from '@/components/ui/AppInput.vue'

// استيراد مكونات الشاشة (سيتم إنشاؤها لاحقاً)
import DistributionsTable from './DistributionsTable.vue'
import DistributionModal from './DistributionModal.vue'
import DistributionForm from './old/DistributionForm.vue'

// تهيئة الـ Stores
const authStore = useAuthStore()
const distributionStore = useDistributionStore()

const { distributions, loading, pagination } = storeToRefs(distributionStore)
const toast = useToast()

// === إدارة البحث وجلب البيانات ===
const searchQuery = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = async (page = 1) => {
  await distributionStore.fetchDistributions(page, searchQuery.value)
}

onMounted(() => {
  handlePageChange()
})

// === إدارة الإضافة ===
const isCreating = ref(false)
const formKey = ref(0)

const handleCreate = async (formData) => {
  isCreating.value = true
  try {
    // formData هنا تأتي كـ FormData object لأننا نتعامل مع رفع ملفات
    await distributionStore.createDistribution(formData)
    toast.success('تم تنفيذ عملية التوزيع بنجاح.')
    formKey.value++ // إعادة تعيين الفورم بالكامل بعد النجاح
    await handlePageChange(1)
  } catch (error) {
    // الأخطاء قد تأتي من الباك إند (مثل: المستفيد استلم مسبقاً، أو الرصيد لا يكفي)
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء التوزيع.'
    toast.error(errorMessage)
  } finally {
    isCreating.value = false
  }
}

const cancelCreate = () => {
  formKey.value++
}

// === إدارة التعديل ===
const isModalOpen = ref(false)
const selectedDistribution = ref(null)
const isEditing = ref(false)

const openEditModal = (distribution) => {
  if (!authStore.can('distribution.update')) {
    toast.error('ليس لديك الصلاحية لتعديل بيانات التوزيع.')
    return
  }
  selectedDistribution.value = { ...distribution }
  isModalOpen.value = true
}

const handleEdit = async (formData) => {
  isEditing.value = true
  try {
    // استخراج المعرف من كائن الـ FormData
    const id = formData.get('id')
    await distributionStore.updateDistribution(id, formData)
    toast.success('تم تحديث مرفقات التوزيع بنجاح.')
    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ التعديلات.'
    toast.error(errorMessage)
  } finally {
    isEditing.value = false
  }
}
</script>
