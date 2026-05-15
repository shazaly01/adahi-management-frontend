<!--src\components\forms\AreasDropdown.vue-->
<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="flatAreas"
      :loading="loading"
      :required="required"
      option-label="full_path"
      option-value="id"
      placeholder="ابحث عن المحافظة، المدينة، أو الحي..."
    />
    <p v-if="error" class="text-sm text-rose-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAreaStore } from '@/stores/areaStore'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المنطقة السكنية' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const areaStore = useAreaStore()
const { areas, loading } = storeToRefs(areaStore)
const error = ref(null)

// دالة ذكية لتحويل "الشجرة" المتداخلة إلى "قائمة" مسطحة لكي تعمل مع Dropdown
const flatAreas = computed(() => {
  const flatten = (nodes) => {
    let result = []
    nodes.forEach((node) => {
      // إضافة المنطقة الحالية
      result.push(node)
      // إذا كان لديها أبناء، قم بتسطيحهم وإضافتهم أيضاً
      if (node.children && node.children.length > 0) {
        result = result.concat(flatten(node.children))
      }
    })
    return result
  }

  return flatten(areas.value)
})

onMounted(async () => {
  if (areas.value.length === 0) {
    try {
      await areaStore.fetchAreas()
    } catch (err) {
      error.value = 'فشل تحميل قائمة المناطق.'
    }
  }
})
</script>
