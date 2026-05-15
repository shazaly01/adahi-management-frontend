<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة الموردين</h1>
      <AppButton v-if="authStore.can('supplier.create')" @click="openSupplierModal()">
        إضافة مورد جديد
      </AppButton>
    </div>

    <!-- قسم الفلاتر -->
    <AppCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-full md:w-1/3">
          <AppInput
            id="search-suppliers"
            v-model="searchQuery"
            placeholder="ابحث باسم المورد أو رقم الهاتف..."
            @input="onSearch"
          />
        </div>
        <!-- يمكنك إضافة AppDropdown هنا لاحقاً لتصنيف الموردين -->
      </div>
    </AppCard>

    <!-- جدول عرض الموردين -->
    <AppCard>
      <SuppliersTable
        :suppliers="suppliers"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @edit-supplier="openSupplierModal"
        @delete-supplier="openDeleteDialog"
      />
    </AppCard>

    <!-- نافذة الإضافة والتعديل الموحدة -->
    <SupplierModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :supplier="selectedSupplier"
      :is-saving="isSaving"
      @save="handleSaveSupplier"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المورد"
      :message="`هل أنت متأكد من رغبتك في حذف المورد '${supplierToDelete?.name}'؟`"
      @confirmed="deleteSelectedSupplier"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// الـ Stores
import { useAuthStore } from '@/stores/authStore'
import { useSupplierStore } from '@/stores/supplierStore'

// المكونات العامة
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// المكونات الخاصة بالموردين
import SuppliersTable from './SuppliersTable.vue'
import SupplierModal from './SupplierModal.vue'

const authStore = useAuthStore()
const supplierStore = useSupplierStore()
const { suppliers, loading, pagination } = storeToRefs(supplierStore)
const toast = useToast()

// === إدارة البحث والجلب ===
const searchQuery = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = (page = 1) => {
  supplierStore.fetchSuppliers(page, searchQuery.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الموردين.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// === منطق النافذة المنبثقة (Modal) ===
const isModalOpen = ref(false)
const selectedSupplier = ref(null)
const isSaving = ref(false)

const openSupplierModal = (supplier = null) => {
  if (supplier && !authStore.can('supplier.update')) {
    toast.info('لا تملك صلاحية تعديل بيانات المورد.')
    return
  }
  selectedSupplier.value = supplier
  isModalOpen.value = true
}

const handleSaveSupplier = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      // تعديل
      await supplierStore.updateSupplier(formData.id, formData)
      toast.success('تم التحديث بنجاح')
    } else {
      // إضافة مورد جديد
      await supplierStore.createSupplier(formData)
      toast.success('تمت الإضافة بنجاح')
    }

    // 1. أغلق النافذة أولاً لتعطي شعوراً بالسرعة (Optimistic UI)
    isModalOpen.value = false

    // 2. هُنا السحر: يجب انتظار تحديث القائمة
    // إذا كانت إضافة جديدة، يفضل العودة للصفحة 1 لرؤية المورد الجديد (عادة يظهر في الأول)
    const targetPage = formData.id ? pagination.value.current_page : 1
    await handlePageChange(targetPage)
  } catch (error) {
    toast.error('فشلت العملية')
  } finally {
    isSaving.value = false
  }
}

// === منطق الحذف ===
const isDeleteDialogOpen = ref(false)
const supplierToDelete = ref(null)

const openDeleteDialog = (supplier) => {
  if (!authStore.can('supplier.delete')) {
    toast.error('لا تملك صلاحية حذف الموردين.')
    return
  }
  supplierToDelete.value = supplier
  isDeleteDialogOpen.value = true
}

const deleteSelectedSupplier = async () => {
  if (supplierToDelete.value) {
    try {
      await supplierStore.deleteSupplier(supplierToDelete.value.id)
      toast.success(`تم حذف المورد '${supplierToDelete.value.name}' بنجاح.`)
      await handlePageChange(pagination.value.current_page)
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء محاولة الحذف.')
    } finally {
      supplierToDelete.value = null
    }
  }
}
</script>
