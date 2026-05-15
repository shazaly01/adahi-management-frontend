<template>
  <div class="flex flex-wrap items-end gap-4">
    <!-- حقل البحث النصي -->
    <div class="w-full md:w-72">
      <label class="block text-sm font-medium text-text-secondary mb-1">البحث السريع</label>
      <div class="relative">
        <span
          class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          :value="modelValue.search"
          @input="updateFilter('search', $event.target.value)"
          type="text"
          placeholder="اسم المخزن، الكود..."
          class="block w-full pr-10 pl-3 py-2 text-sm bg-surface-section border border-surface-border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-text-primary"
        />
      </div>
    </div>

    <!-- فلتر الحالة باستخدام AppDropdown الذي زودتني به -->
    <div class="w-full md:w-48">
      <AppDropdown
        id="status-filter"
        label="حالة المخزن"
        :model-value="modelValue.status"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="كل الحالات"
        @update:model-value="updateFilter('status', $event)"
      />
    </div>

    <!-- زر لإعادة ضبط الفلاتر (اختياري ولكنه مفيد) -->
    <button
      @click="resetFilters"
      class="pb-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
    >
      تفريغ الفلاتر
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ search: '', status: null }),
  },
})

const emit = defineEmits(['update:modelValue', 'search'])

// خيارات الفلترة (يمكنك جلبها من API لاحقاً)
const statusOptions = ref([
  { label: 'نشط', value: 'active' },
  { label: 'متوقف', value: 'inactive' },
  { label: 'ممتلئ', value: 'full' },
])

let timeout = null

const updateFilter = (key, value) => {
  const newFilters = { ...props.modelValue, [key]: value }
  emit('update:modelValue', newFilters)

  // Debounce للبحث
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    emit('search')
  }, 500)
}

const resetFilters = () => {
  emit('update:modelValue', { search: '', status: null })
  emit('search')
}
</script>
