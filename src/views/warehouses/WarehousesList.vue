<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة المخازن</h1>
      <AppButton v-if="authStore.can('warehouse.create')" @click="openWarehouseModal()">
        إضافة مخزن
      </AppButton>
    </div>

    <!-- قسم الفلاتر (داخل كارد لتحسين المظهر) -->
    <AppCard class="mb-6">
      <WarehouseFilters v-model="filters" @search="handlePageChange(1)" />
    </AppCard>

    <!-- جدول عرض البيانات -->
    <AppCard>
      <WarehousesTable
        :warehouses="warehouses"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @edit-warehouse="openWarehouseModal"
        @delete-warehouse="openDeleteDialog"
      />
    </AppCard>

    <!-- نافذة الإضافة والتعديل الموحدة -->
    <WarehouseModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :warehouse="selectedWarehouse"
      :is-saving="isSaving"
      @save="handleSaveWarehouse"
    />

    <!-- حوار تأكيد الحذف (باستخدام المكون الموحد كما في المرجع) -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المخزن"
      :message="`هل أنت متأكد من رغبتك في حذف المخزن '${warehouseToDelete?.name}'؟`"
      @confirmed="deleteSelectedWarehouse"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// الـ Stores
import { useAuthStore } from '@/stores/authStore'
import { useWarehouseStore } from '@/stores/warehouseStore'

// المكونات العامة (UI)
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// المكونات الخاصة بالمخازن
import WarehousesTable from './WarehousesTable.vue'
import WarehouseModal from './WarehouseModal.vue'
import WarehouseFilters from './WarehouseFilters.vue'

const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()
const { warehouses, loading, pagination } = storeToRefs(warehouseStore)
const toast = useToast()

// === إدارة الفلاتر والجلب ===
const filters = ref({
  search: '',
  status: null,
})

const handlePageChange = (page = 1) => {
  warehouseStore.fetchWarehouses(page, filters.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات المخازن.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// === منطق النافذة المنبثقة (Modal) ===
const isModalOpen = ref(false)
const selectedWarehouse = ref(null)
const isSaving = ref(false)

const openWarehouseModal = (warehouse = null) => {
  // التحقق من الصلاحية في حال كان التعديل
  if (warehouse && !authStore.can('warehouse.update')) {
    toast.info('لا تملك صلاحية تعديل بيانات المخزن.')
    return
  }

  selectedWarehouse.value = warehouse
  isModalOpen.value = true
}

const handleSaveWarehouse = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      // 1. تنفيذ التعديل
      await warehouseStore.updateWarehouse(formData.id, formData)
      toast.success(`تم تعديل المخزن '${formData.name}' بنجاح.`)
    } else {
      // 2. تنفيذ الإضافة
      await warehouseStore.createWarehouse(formData)
      toast.success(`تمت إضافة المخزن '${formData.name}' بنجاح.`)
    }

    // === السر هنا: الإغلاق الفوري بعد نجاح الطلب ===
    isModalOpen.value = false

    // 3. تحديث البيانات في الجدول (يتم في الخلفية بعد إغلاق النافذة)
    await handlePageChange(pagination.value?.current_page || 1)
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.'
    toast.error(message)
  } finally {
    isSaving.value = false
  }
} 

// === منطق الحذف ===
const isDeleteDialogOpen = ref(false)
const warehouseToDelete = ref(null)

const openDeleteDialog = (warehouse) => {
  if (!authStore.can('warehouse.delete')) {
    toast.error('لا تملك صلاحية حذف المخازن.')
    return
  }
  warehouseToDelete.value = warehouse
  isDeleteDialogOpen.value = true
}

const deleteSelectedWarehouse = async () => {
  if (warehouseToDelete.value) {
    try {
      await warehouseStore.deleteWarehouse(warehouseToDelete.value.id)
      toast.success(`تم حذف المخزن '${warehouseToDelete.value.name}' بنجاح.`)
      // تحديث الجدول
      await handlePageChange(pagination.value.current_page)
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء محاولة الحذف.'
      toast.error(message)
    } finally {
      warehouseToDelete.value = null
    }
  }
}
</script>
