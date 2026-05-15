<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-5">
      <!-- اسم المخزن -->
      <div>
        <AppInput
          id="warehouse-name"
          label="اسم المخزن"
          v-model="form.name"
          placeholder="مثال: مخزن حي النصر"
          :error="errors.name"
          @input="errors.name = false"
          required
        />
        <p v-if="errors.name" class="text-rose-500 text-xs mt-1 font-bold">اسم المخزن مطلوب</p>
      </div>

      <!-- الموقع -->
      <div>
        <AppInput
          id="warehouse-location"
          label="موقع المخزن"
          v-model="form.location"
          placeholder="العنوان أو الإحداثيات (اختياري)"
        />
      </div>

      <!-- حقل التفعيل بتصميم Indigo -->
      <div
        class="flex items-center p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30 transition-all"
      >
        <div class="relative flex items-start">
          <div class="flex items-center h-5">
            <input
              id="warehouse-active"
              type="checkbox"
              v-model="form.is_active"
              class="w-5 h-5 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
            />
          </div>
          <div class="mr-3 text-sm">
            <label
              for="warehouse-active"
              class="font-bold text-indigo-900 dark:text-indigo-300 cursor-pointer"
            >
              تفعيل المخزن
            </label>
            <p class="text-indigo-700/70 dark:text-indigo-400/60 text-xs">
              يسمح هذا الخيار بالقيام بعمليات الاستلام والتوريد لهذا المخزن.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- أزرار التحكم -->
    <div class="mt-8 flex justify-end gap-3 pt-5 border-t border-surface-border">
      <AppButton type="button" variant="secondary" @click="handleCancel" class="!px-6">
        إلغاء
      </AppButton>

      <AppButton type="submit" :disabled="isSaving" class="!px-8 shadow-lg shadow-indigo-500/20">
        <div class="flex items-center gap-2">
          <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{{ isSaving ? 'جاري الحفظ...' : form.id ? 'تحديث البيانات' : 'حفظ المخزن' }}</span>
        </div>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const errors = reactive({ name: false })

const createFreshForm = () => ({
  id: null,
  name: '',
  location: '',
  is_active: true,
})

const form = ref(createFreshForm())

// مراقبة البيانات الأولية (تحديث النموذج عند الفتح/التغيير)
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        location: newData.location || '',
        is_active: newData.is_active !== undefined ? Boolean(Number(newData.is_active)) : true,
      }
    } else {
      form.value = createFreshForm()
    }
    // تصفير الأخطاء عند تغير البيانات
    errors.name = false
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  if (!form.value.name || form.value.name.trim() === '') {
    errors.name = true
    return
  }
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
