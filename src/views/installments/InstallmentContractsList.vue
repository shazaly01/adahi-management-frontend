<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة عقود الأقساط</h1>
    </div>

    <!-- قسم البحث -->
    <div
      class="mb-6 bg-surface-section p-4 rounded-xl border border-surface-border flex items-center gap-4"
    >
      <div class="w-full md:w-1/3">
        <AppInput
          id="search-contracts"
          v-model="searchQuery"
          placeholder="ابحث باسم المستفيد..."
          @input="onSearch"
        />
      </div>

      <!-- فلتر حالة العقد (اختياري للبحث) -->
      <div class="w-full md:w-1/4">
        <select
          v-model="statusFilter"
          @change="onSearch"
          class="w-full rounded-md border border-surface-border bg-surface-base text-text-primary px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        >
          <option value="">جميع الحالات</option>
          <option value="active">سارية (نشطة)</option>
          <option value="completed">مكتملة السداد</option>
        </select>
      </div>
    </div>

    <!-- جدول عرض البيانات -->
    <InstallmentContractsTable
      :contracts="contracts"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @manage-payments="openPaymentsModal"
    />

    <!-- نافذة إدارة الدفعات (تُعرض بداخلها إيصالات السداد وفورم الدفع) -->
    <InstallmentPaymentsModal
      v-if="isPaymentsModalOpen"
      v-model="isPaymentsModalOpen"
      :contract="selectedContract"
      @payment-added="handlePaymentAdded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// استيراد الـ Stores
import { useInstallmentContractStore } from '@/stores/installmentContractStore'

// استيراد المكونات الأساسية
import AppInput from '@/components/ui/AppInput.vue'

// استيراد مكونات الشاشة
import InstallmentContractsTable from './InstallmentContractsTable.vue'
import InstallmentPaymentsModal from './InstallmentPaymentsModal.vue'

// تهيئة الـ Store
const contractStore = useInstallmentContractStore()
const { contracts, loading, pagination } = storeToRefs(contractStore)

// === إدارة البحث وجلب البيانات ===
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = async (page = 1) => {
  // دمج البحث مع الفلتر إذا كان الباك إند يدعم ذلك عبر الـ query params
  const query = searchQuery.value + (statusFilter.value ? `&status=${statusFilter.value}` : '')
  await contractStore.fetchContracts(page, query)
}

onMounted(() => {
  handlePageChange()
})

// === إدارة الدفعات (النافذة المنبثقة) ===
const isPaymentsModalOpen = ref(false)
const selectedContract = ref(null)

const openPaymentsModal = (contract) => {
  selectedContract.value = { ...contract }
  isPaymentsModalOpen.value = true
}

// تحديث الشاشة عند إضافة دفعة جديدة بنجاح لتحديث المبالغ المتبقية
const handlePaymentAdded = async () => {
  await handlePageChange(pagination.value?.current_page || 1)
}
</script>
