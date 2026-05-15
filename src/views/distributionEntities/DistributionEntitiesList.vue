<template>
  <div>
    <!-- رأس الصفحة: العنوان وزر الإضافة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة جهات التوزيع</h1>
      <AppButton v-if="authStore.can('distribution_entity.create')" @click="openEntityModal()">
        تسجيل جهة توزيع
      </AppButton>
    </div>

    <!-- قسم البحث والفلاتر -->
    <AppCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-full md:w-1/3">
          <AppInput
            id="search-entities"
            v-model="searchQuery"
            placeholder="ابحث باسم الجهة أو الرقم..."
            @input="onSearch"
          />
        </div>
      </div>
    </AppCard>

    <!-- جدول عرض البيانات -->
    <AppCard>
      <DistributionEntitiesTable
        :entities="distributionEntities"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @edit-entity="openEntityModal"
        @delete-entity="openDeleteDialog"
      />
    </AppCard>

    <!-- نافذة الإضافة والتعديل الموحدة -->
    <DistributionEntityModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :entity="selectedEntity"
      :is-saving="isSaving"
      @save="handleSaveEntity"
    />

    <!-- حوار تأكيد الحذف (Panda UI) -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف جهة التوزيع"
      :message="`هل أنت متأكد من حذف الجهة '${entityToDelete?.name}'؟ سيتم حذف سجلات المخزون الصفرية المرتبطة بها أيضاً.`"
      @confirmed="deleteSelectedEntity"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// الـ Stores
import { useAuthStore } from '@/stores/authStore'
import { useDistributionEntityStore } from '@/stores/distributionEntityStore'

// المكونات العامة (UI)
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// مكونات الشاشة
import DistributionEntitiesTable from './DistributionEntitiesTable.vue'
import DistributionEntityModal from './DistributionEntityModal.vue'

const authStore = useAuthStore()
const entityStore = useDistributionEntityStore()
const { distributionEntities, loading, pagination } = storeToRefs(entityStore)
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
  await entityStore.fetchEntities(page, searchQuery.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات جهات التوزيع.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// === منطق النافذة المنبثقة (Modal) ===
const isModalOpen = ref(false)
const selectedEntity = ref(null)
const isSaving = ref(false)

const openEntityModal = (entity = null) => {
  if (entity && !authStore.can('distribution_entity.update')) {
    toast.info('لا تملك صلاحية تعديل بيانات هذه الجهة.')
    return
  }
  selectedEntity.value = entity
  isModalOpen.value = true
}

const handleSaveEntity = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      // 1. تحديث بيانات جهة قائمة
      await entityStore.updateEntity(formData.id, formData)
      toast.success(`تم تحديث بيانات '${formData.name}' بنجاح.`)
    } else {
      // 2. تسجيل جهة توزيع جديدة
      await entityStore.createEntity(formData)
      toast.success(`تم تسجيل جهة التوزيع '${formData.name}' وفتح سجلات مخزونها بنجاح.`)
    }

    // === الإغلاق التلقائي بعد النجاح مباشرة ===
    isModalOpen.value = false

    // 3. إعادة جلب البيانات لضمان المزامنة
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
const entityToDelete = ref(null)

const openDeleteDialog = (entity) => {
  if (!authStore.can('distribution_entity.delete')) {
    toast.error('ليس لديك الصلاحية لحذف جهات التوزيع.')
    return
  }
  entityToDelete.value = entity
  isDeleteDialogOpen.value = true
}

const deleteSelectedEntity = async () => {
  if (entityToDelete.value) {
    try {
      await entityStore.deleteEntity(entityToDelete.value.id)
      toast.success('تم حذف جهة التوزيع بنجاح.')

      // تحديث ذكي لترقيم الصفحات
      const page =
        distributionEntities.value.length === 1 && pagination.value.current_page > 1
          ? pagination.value.current_page - 1
          : pagination.value.current_page

      await handlePageChange(page)
    } catch (error) {
      const message =
        error.response?.data?.message || 'لا يمكن حذف هذه الجهة لوجود رصيد أضاحي في عهدتها.'
      toast.error(message)
    } finally {
      entityToDelete.value = null
    }
  }
}
</script>
