<template>
  <div>
    <!-- رأس الصفحة: العنوان وزر الإضافة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة المستفيدين</h1>
      <AppButton v-if="authStore.can('beneficiary.create')" @click="openBeneficiaryModal()">
        إضافة مستفيد جديد
      </AppButton>
    </div>

    <!-- قسم الفلاتر والبحث -->
    <AppCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-full md:w-1/3">
          <AppInput
            id="search-beneficiaries"
            v-model="searchQuery"
            placeholder="ابحث بالاسم أو الرقم الوطني..."
            @input="onSearch"
          />
        </div>
      </div>
    </AppCard>

    <!-- جدول عرض البيانات -->
    <AppCard>
      <BeneficiariesTable
        :beneficiaries="beneficiaries"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @edit-beneficiary="openBeneficiaryModal"
        @delete-beneficiary="openDeleteDialog"
      />
    </AppCard>

    <!-- نافذة الإضافة والتعديل الموحدة -->
    <BeneficiaryModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :beneficiary="selectedBeneficiary"
      :is-saving="isSaving"
      @save="handleSaveBeneficiary"
    />

    <!-- حوار تأكيد الحذف (Panda UI) -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المستفيد"
      :message="`هل أنت متأكد من رغبتك في حذف المستفيد '${beneficiaryToDelete?.full_name}'؟`"
      @confirmed="deleteSelectedBeneficiary"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// الـ Stores
import { useAuthStore } from '@/stores/authStore'
import { useBeneficiaryStore } from '@/stores/beneficiaryStore'

// المكونات العامة (UI)
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// مكونات الشاشة
import BeneficiariesTable from './BeneficiariesTable.vue'
import BeneficiaryModal from './BeneficiaryModal.vue'

const authStore = useAuthStore()
const beneficiaryStore = useBeneficiaryStore()
const { beneficiaries, loading, pagination } = storeToRefs(beneficiaryStore)
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
  await beneficiaryStore.fetchBeneficiaries(page, searchQuery.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات المستفيدين.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// === منطق النافذة المنبثقة (Modal) ===
const isModalOpen = ref(false)
const selectedBeneficiary = ref(null)
const isSaving = ref(false)

const openBeneficiaryModal = (beneficiary = null) => {
  if (beneficiary && !authStore.can('beneficiary.update')) {
    toast.info('لا تملك صلاحية تعديل بيانات هذا المستفيد.')
    return
  }
  selectedBeneficiary.value = beneficiary
  isModalOpen.value = true
}

const handleSaveBeneficiary = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      // 1. تحديث مستفيد موجود
      await beneficiaryStore.updateBeneficiary(formData.id, formData)
      toast.success(`تم تحديث بيانات المستفيد بنجاح.`)
    } else {
      // 2. إضافة مستفيد جديد
      await beneficiaryStore.createBeneficiary(formData)
      toast.success(`تم إضافة المستفيد بنجاح.`)
    }

    // === الإغلاق التلقائي بعد النجاح مباشرة ===
    isModalOpen.value = false

    // 3. التحديث الصارم للبيانات (إعادة الجلب)
    const targetPage = formData.id ? pagination.value.current_page : 1
    await handlePageChange(targetPage)
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.'
    toast.error(message)
  } finally {
    isSaving.value = false
  }
}

// === منطق الحذف ===
const isDeleteDialogOpen = ref(false)
const beneficiaryToDelete = ref(null)

const openDeleteDialog = (beneficiary) => {
  if (!authStore.can('beneficiary.delete')) {
    toast.error('ليس لديك الصلاحية لحذف المستفيدين.')
    return
  }
  beneficiaryToDelete.value = beneficiary
  isDeleteDialogOpen.value = true
}

const deleteSelectedBeneficiary = async () => {
  if (beneficiaryToDelete.value) {
    try {
      await beneficiaryStore.deleteBeneficiary(beneficiaryToDelete.value.id)
      toast.success('تم حذف المستفيد بنجاح.')

      // تحديث ذكي لترقيم الصفحات بعد الحذف
      const page =
        beneficiaries.value.length === 1 && pagination.value.current_page > 1
          ? pagination.value.current_page - 1
          : pagination.value.current_page

      await handlePageChange(page)
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء محاولة الحذف.')
    } finally {
      beneficiaryToDelete.value = null
    }
  }
}
</script>
