<!--src\views\inventory\InventoryMovementsList.vue-->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">سجل حركات المخزون (دفتر الأستاذ)</h1>
    </div>

    <!-- تنبيه توضيحي لعدم القابلية للتعديل -->
    <div class="mb-6 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-md">
      <p class="text-sm text-blue-800 dark:text-blue-200">
        <span class="font-bold">معيار التدقيق (Audit Trail):</span> هذا السجل محمي برمجياً ضد
        الإضافة اليدوية أو التعديل أو الحذف. يعكس هذا الدفتر الحركات الفعلية المؤتمتة لضمان النزاهة
        المحاسبية والمخزنية.
      </p>
    </div>

    <!-- قسم البحث والفلترة -->
    <div
      class="mb-6 bg-surface-section p-4 rounded-xl border border-surface-border flex items-center gap-4"
    >
      <div class="w-full md:w-1/3">
        <AppInput
          id="search-movements"
          v-model="searchQuery"
          placeholder="ابحث باسم المسؤول أو المرجع..."
          @input="onSearch"
        />
      </div>

      <!-- فلتر نوع الحركة -->
      <div class="w-full md:w-1/4">
        <select
          v-model="movementTypeFilter"
          @change="onSearch"
          class="w-full rounded-md border border-surface-border bg-surface-base text-text-primary px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        >
          <option value="">جميع أنواع الحركات</option>
          <option value="in">وارد (+)</option>
          <option value="out">صادر (-)</option>
        </select>
      </div>
    </div>

    <!-- جدول عرض البيانات -->
    <InventoryMovementsTable
      :movements="movements"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// استيراد الـ Store (نفترض إنشاءه مسبقاً بنفس النمط)
import { useInventoryMovementStore } from '@/stores/inventoryMovementStore'

// استيراد المكونات الأساسية
import AppInput from '@/components/ui/AppInput.vue'

// استيراد مكون الجدول
import InventoryMovementsTable from './InventoryMovementsTable.vue'

// تهيئة الـ Store
const movementStore = useInventoryMovementStore()
const { movements, loading, pagination } = storeToRefs(movementStore)

// === إدارة البحث وجلب البيانات ===
const searchQuery = ref('')
const movementTypeFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = async (page = 1) => {
  // دمج البحث والفلتر
  const query =
    searchQuery.value + (movementTypeFilter.value ? `&type=${movementTypeFilter.value}` : '')
  await movementStore.fetchMovements(page, query)
}

onMounted(() => {
  handlePageChange()
})
</script>
