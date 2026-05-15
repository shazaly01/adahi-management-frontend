<!-- src/views/inventory/EntityStocksList.vue -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">أرصدة جهات التوزيع (الدفتر المخزني)</h1>
    </div>

    <!-- تنبيه توضيحي لطبيعة الشاشة -->
    <div class="mb-6 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-md">
      <p class="text-sm text-blue-800 dark:text-blue-200">
        <span class="font-bold">معلومة نظامية:</span> هذه الشاشة مخصصة للعرض والمطابقة فقط. يتم
        تحديث الأرصدة تلقائياً بناءً على العمليات المركزية (تحويل العُهد، وعمليات التوزيع
        للمستفيدين).
      </p>
    </div>

    <!-- قسم البحث -->
    <div
      class="mb-6 bg-surface-section p-4 rounded-xl border border-surface-border flex items-center gap-4"
    >
      <div class="w-full md:w-1/3">
        <AppInput
          id="search-stocks"
          v-model="searchQuery"
          placeholder="ابحث باسم الجهة أو نوع الأضحية..."
          @input="onSearch"
        />
      </div>
    </div>

    <!-- جدول عرض البيانات -->
    <EntityStocksTable
      :entity-stocks="entityStocks"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// استيراد الـ Store الجديد
import { useEntityStockStore } from '@/stores/entityStockStore'

// استيراد المكونات الأساسية
import AppInput from '@/components/ui/AppInput.vue'

// استيراد مكون الجدول الجديد
import EntityStocksTable from './EntityStocksTable.vue'

// تهيئة الـ Store
const entityStockStore = useEntityStockStore()
const { entityStocks, loading, pagination } = storeToRefs(entityStockStore)

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
  // استخدام الدالة الجديدة المحدثة في الـ Store
  await entityStockStore.fetchEntityStocks(page, searchQuery.value)
}

onMounted(() => {
  handlePageChange()
})
</script>
