<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">سجل إيصالات التحصيل (الدفعات)</h1>
    </div>

    <!-- تنبيه محاسبي -->
    <div class="mb-6 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-md">
      <p class="text-sm text-blue-800 dark:text-blue-200">
        <span class="font-bold">دفتر اليومية:</span> هذه الشاشة تعرض كافة الدفعات المحصلة لجميع عقود
        الأقساط بغرض المراجعة والمطابقة المالية. لإضافة دفعة جديدة، يرجى التوجه لشاشة "عقود
        الأقساط".
      </p>
    </div>

    <!-- قسم البحث -->
    <div
      class="mb-6 bg-surface-section p-4 rounded-xl border border-surface-border flex items-center gap-4"
    >
      <div class="w-full md:w-1/3">
        <AppInput
          id="search-payments"
          v-model="searchQuery"
          placeholder="ابحث برقم الإيصال أو اسم المستفيد..."
          @input="onSearch"
        />
      </div>
    </div>

    <!-- جدول عرض البيانات -->
    <InstallmentPaymentsTable
      :payments="payments"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// استيراد الـ Store
import { useInstallmentPaymentStore } from '@/stores/installmentPaymentStore'

// استيراد المكونات الأساسية
import AppInput from '@/components/ui/AppInput.vue'

// استيراد مكون الجدول
import InstallmentPaymentsTable from './InstallmentPaymentsTable.vue'

// تهيئة الـ Store
const paymentStore = useInstallmentPaymentStore()
const { payments, loading, pagination } = storeToRefs(paymentStore)

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
  await paymentStore.fetchPayments(page, searchQuery.value)
}

onMounted(() => {
  handlePageChange()
})
</script>
