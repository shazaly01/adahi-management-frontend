<template>
  <div>
    <!-- رأس الصفحة: العنوان وزر الإضافة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة أنواع الأضاحي</h1>
      <AppButton v-if="authStore.can('sacrifice_type.create')" @click="openTypeModal()">
        إضافة نوع جديد
      </AppButton>
    </div>

    <!-- قسم الفلاتر والبحث -->
    <AppCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-full md:w-1/3">
          <AppInput
            id="search-sacrifice-types"
            v-model="searchQuery"
            placeholder="ابحث باسم النوع أو الوصف..."
            @input="onSearch"
          />
        </div>
      </div>
    </AppCard>

    <!-- جدول عرض البيانات -->
    <AppCard>
      <SacrificeTypesTable
        :sacrifice-types="sacrificeTypes"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @edit-type="openTypeModal"
        @delete-type="openDeleteDialog"
      />
    </AppCard>

    <!-- نافذة الإضافة والتعديل الموحدة -->
    <SacrificeTypeModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :sacrifice-type="selectedType"
      :is-saving="isSaving"
      @save="handleSaveType"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف نوع الأضحية"
      :message="`هل أنت متأكد من رغبتك في حذف نوع الأضحية '${typeToDelete?.name}'؟`"
      @confirmed="deleteSelectedType"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// الـ Stores
import { useAuthStore } from '@/stores/authStore'
import { useSacrificeTypeStore } from '@/stores/sacrificeTypeStore'

// المكونات العامة (UI)
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// مكونات الشاشة
import SacrificeTypesTable from './SacrificeTypesTable.vue'
import SacrificeTypeModal from './SacrificeTypeModal.vue'

const authStore = useAuthStore()
const sacrificeTypeStore = useSacrificeTypeStore()
const { sacrificeTypes, loading, pagination } = storeToRefs(sacrificeTypeStore)
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
  await sacrificeTypeStore.fetchSacrificeTypes(page, searchQuery.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب البيانات.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// === منطق النافذة المنبثقة (Modal) ===
const isModalOpen = ref(false)
const selectedType = ref(null)
const isSaving = ref(false)

const openTypeModal = (type = null) => {
  if (type && !authStore.can('sacrifice_type.update')) {
    toast.info('لا تملك صلاحية تعديل هذا النوع.')
    return
  }
  selectedType.value = type
  isModalOpen.value = true
}

const handleSaveType = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      // 1. تحديث
      await sacrificeTypeStore.updateSacrificeType(formData.id, formData)
      toast.success(`تم تحديث '${formData.name}' بنجاح.`)
    } else {
      // 2. إضافة
      await sacrificeTypeStore.createSacrificeType(formData)
      toast.success(`تم إضافة '${formData.name}' بنجاح.`)
    }

    // الإغلاق الفوري بعد نجاح العملية
    isModalOpen.value = false

    // 3. تحديث القائمة فوراً لضمان مزامنة البيانات
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
const typeToDelete = ref(null)

const openDeleteDialog = (type) => {
  if (!authStore.can('sacrifice_type.delete')) {
    toast.error('لا تملك صلاحية الحذف.')
    return
  }
  typeToDelete.value = type
  isDeleteDialogOpen.value = true
}

const deleteSelectedType = async () => {
  if (typeToDelete.value) {
    try {
      await sacrificeTypeStore.deleteSacrificeType(typeToDelete.value.id)
      toast.success('تم الحذف بنجاح.')

      // تحديث ذكي للصفحة بعد الحذف
      const page =
        sacrificeTypes.value.length === 1 && pagination.value.current_page > 1
          ? pagination.value.current_page - 1
          : pagination.value.current_page

      await handlePageChange(page)
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل الحذف.')
    } finally {
      typeToDelete.value = null
    }
  }
}
</script>
