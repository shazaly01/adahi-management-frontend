<template>
  <div>
    <!-- رأس الصفحة: العنوان وزر الإضافة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة عمليات التوريد</h1>
      <AppButton v-if="authStore.can('supply.create')" @click="openSupplyModal()">
        تسجيل توريد جديد
      </AppButton>
    </div>

    <!-- قسم الفلاتر والبحث -->
    <AppCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-full md:w-1/3">
          <AppInput
            id="search-supplies"
            v-model="searchQuery"
            placeholder="ابحث باسم المورد أو رقم الإيصال..."
            @input="onSearch"
          />
        </div>
      </div>
    </AppCard>

    <!-- جدول عرض البيانات -->
    <AppCard>
      <SuppliesTable
        :supplies="supplies"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @edit-supply="openSupplyModal"
      />
    </AppCard>

    <!-- نافذة الإضافة والتعديل الموحدة -->
    <SupplyModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :supply="selectedSupply"
      :is-saving="isSaving"
      @save="handleSaveSupply"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// الـ Stores
import { useAuthStore } from '@/stores/authStore'
import { useSupplyStore } from '@/stores/supplyStore'

// المكونات العامة (UI)
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'

// مكونات الشاشة
import SuppliesTable from './SuppliesTable.vue'
import SupplyModal from './SupplyModal.vue'

const authStore = useAuthStore()
const supplyStore = useSupplyStore()
const { supplies, loading, pagination } = storeToRefs(supplyStore)
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
  await supplyStore.fetchSupplies(page, searchQuery.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات التوريد.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// === منطق النافذة المنبثقة (Modal) ===
const isModalOpen = ref(false)
const selectedSupply = ref(null)
const isSaving = ref(false)

const openSupplyModal = (supply = null) => {
  if (supply && !authStore.can('supply.update')) {
    toast.info('لا تملك صلاحية تعديل بيانات هذه العملية.')
    return
  }
  selectedSupply.value = supply
  isModalOpen.value = true
}

const handleSaveSupply = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      // 1. تحديث عملية توريد قائمة
      await supplyStore.updateSupply(formData.id, formData)
      toast.success('تم تعديل بيانات عملية التوريد بنجاح.')
    } else {
      // 2. تسجيل عملية توريد جديدة
      await supplyStore.createSupply(formData)
      toast.success('تم تسجيل التوريد وإضافة الكميات للمخزن بنجاح.')
    }

    // === الإغلاق التلقائي بعد النجاح مباشرة ===
    isModalOpen.value = false

    // 3. التحديث الصارم للبيانات لضمان المزامنة اللحظية مع المخزون
    const targetPage = formData.id ? pagination.value.current_page : 1
    await handlePageChange(targetPage)
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات التوريد.'
    toast.error(message)
  } finally {
    isSaving.value = false
  }
}
</script>
