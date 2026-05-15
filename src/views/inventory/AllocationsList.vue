<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة تسليم العُهد</h1>
      <AppButton v-if="authStore.can('allocation.create')" @click="openAllocationModal()">
        تسليم عُهدة جديدة
      </AppButton>
    </div>

    <AppCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-full md:w-1/3">
          <AppInput
            id="search-allocations"
            v-model="searchQuery"
            placeholder="ابحث باسم الجهة أو نوع الأضحية..."
            @input="onSearch"
          />
        </div>
      </div>
    </AppCard>

    <AppCard>
      <AllocationsTable
        :allocations="allocations"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @edit-allocation="openAllocationModal"
        @print-allocation="printAllocation"
      />
    </AppCard>

    <AllocationModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :allocation="selectedAllocation"
      :is-saving="isSaving"
      @save="handleSaveAllocation"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router' // <-- تمت إضافة الراوتر للطباعة

// الـ Stores
import { useAuthStore } from '@/stores/authStore'
import { useAllocationStore } from '@/stores/allocationStore'

// المكونات العامة (UI)
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'

// مكونات الشاشة
import AllocationsTable from './AllocationsTable.vue'
import AllocationModal from './AllocationModal.vue'

const authStore = useAuthStore()
const allocationStore = useAllocationStore()
const { allocations, loading, pagination } = storeToRefs(allocationStore)
const toast = useToast()
const router = useRouter() // <-- تهيئة الراوتر

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
  await allocationStore.fetchAllocations(page, searchQuery.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات العُهد.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// === الطباعة ===
const printAllocation = (id) => {
  // فتح شاشة الطباعة في نافذة جديدة مع تمرير الـ ID في المسار
  const routeData = router.resolve({ name: 'AllocationPrint', params: { id } })
  window.open(routeData.href, '_blank')
}

// === منطق النافذة المنبثقة (Modal) ===
const isModalOpen = ref(false)
const selectedAllocation = ref(null)
const isSaving = ref(false)

const openAllocationModal = (allocation = null) => {
  if (allocation && !authStore.can('allocation.update')) {
    toast.info('لا تملك صلاحية تعديل بيانات هذه العُهدة.')
    return
  }
  selectedAllocation.value = allocation
  isModalOpen.value = true
}

const handleSaveAllocation = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      // 1. تحديث عُهدة قائمة (ملاحظات غالباً)
      await allocationStore.updateAllocation(formData.id, formData)
      toast.success('تم تحديث بيانات العُهدة بنجاح.')
    } else {
      // 2. تسجيل تسليم عُهدة جديد
      await allocationStore.createAllocation(formData)
      toast.success('تم تسليم العُهدة بنجاح وتحديث أرصدة المخازن والجهات.')
    }

    // الإغلاق الفوري بعد نجاح العملية
    isModalOpen.value = false

    // 3. التحديث الصارم للبيانات لضمان ظهور العُهدة الجديدة فوراً
    const targetPage = formData.id ? pagination.value.current_page : 1
    await handlePageChange(targetPage)
  } catch (error) {
    const message =
      error.response?.data?.message || 'فشل تسليم العُهدة (تحقق من توفر الرصيد في المخزن).'
    toast.error(message)
  } finally {
    isSaving.value = false
  }
}
</script>
