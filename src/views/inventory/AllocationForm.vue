<template>
  <form @submit.prevent="handleSubmit">
    <!-- تنبيه وضع التعديل -->
    <div
      v-if="isEditMode"
      class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-md"
    >
      <p class="text-sm text-amber-800 dark:text-amber-200">
        <span class="font-bold">ملاحظة مخزنية:</span> أنت في وضع التعديل. لحماية أرصدة الجهات
        والمخازن، يُسمح فقط بتحديث الملاحظات. لتعديل الكميات أو المخزن يجب عمل حركة تسوية أو إرجاع.
      </p>
    </div>

    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- المخزن المصدر -->
        <div>
          <AppDropdown
            id="warehouse-id"
            label="المخزن المصدر (تصرف منه العهدة)"
            v-model="form.warehouse_id"
            :options="warehousesList"
            placeholder="اختر المخزن"
            :disabled="isEditMode"
            required
          />
          <p v-if="errors.warehouse_id" class="text-rose-500 text-xs mt-1 font-bold">
            يجب تحديد المخزن المصدر
          </p>
        </div>

        <!-- جهة التوزيع المستلمة -->
        <div>
          <AppDropdown
            id="distribution-entity-id"
            label="جهة التوزيع (المستلم)"
            v-model="form.distribution_entity_id"
            :options="entitiesList"
            placeholder="اختر الجهة"
            :disabled="isEditMode"
            required
          />
          <p v-if="errors.distribution_entity_id" class="text-rose-500 text-xs mt-1 font-bold">
            يجب تحديد جهة التوزيع المستلمة للعهدة
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- نوع الأضحية -->
        <div>
          <AppDropdown
            id="sacrifice-type-id"
            label="نوع الأضحية"
            v-model="form.sacrifice_type_id"
            :options="sacrificeTypesList"
            placeholder="اختر نوع الأضحية"
            :disabled="isEditMode"
            required
          />
          <p v-if="errors.sacrifice_type_id" class="text-rose-500 text-xs mt-1 font-bold">
            يجب تحديد نوع الأضحية
          </p>
        </div>

        <!-- الكمية المسلمة -->
        <div>
          <AppInput
            id="quantity"
            label="الكمية المسلمة (عدد الرؤوس)"
            v-model.number="form.quantity"
            type="number"
            min="1"
            placeholder="ادخل الكمية"
            :disabled="isEditMode"
            required
          />
          <p v-if="errors.quantity" class="text-rose-500 text-xs mt-1 font-bold">
            الكمية يجب أن تكون 1 على الأقل
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- القيمة المالية التقديرية -->
        <div>
          <AppInput
            id="value"
            label="القيمة المالية التقديرية (ج.س)"
            v-model.number="form.value"
            type="number"
            min="0"
            placeholder="اختياري (لأغراض محاسبية)"
            :disabled="isEditMode"
          />
        </div>
      </div>

      <!-- الملاحظات -->
      <div>
        <label class="block text-sm font-medium text-text-primary mb-1" for="notes">
          الملاحظات
        </label>
        <textarea
          id="notes"
          v-model="form.notes"
          rows="3"
          class="w-full rounded-md border border-surface-border bg-surface-base text-text-primary px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          placeholder="أي ملاحظات حول التسليم أو حالة العهدة..."
        ></textarea>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ الملاحظات' : 'اعتماد تسليم العهدة' }}</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// استيراد الـ Stores المحدثة
import { useSacrificeTypeStore } from '@/stores/sacrificeTypeStore'
import { useDistributionEntityStore } from '@/stores/distributionEntityStore'
import { useWarehouseStore } from '@/stores/warehouseStore'

// استيراد مكونات UI
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

// تهيئة المخازن
const sacrificeTypeStore = useSacrificeTypeStore()
const entityStore = useDistributionEntityStore()
const warehouseStore = useWarehouseStore()

const { sacrificeTypes } = storeToRefs(sacrificeTypeStore)
const { distributionEntities } = storeToRefs(entityStore)
const { warehouses } = storeToRefs(warehouseStore)

// تحضير خيارات القوائم المنسدلة (تم توحيد الـ IDs لتكون أرقاماً)
const sacrificeTypesList = computed(() => {
  return sacrificeTypes.value.map((type) => ({ id: Number(type.id), name: type.name }))
})

const entitiesList = computed(() => {
  return distributionEntities.value
    .filter((e) => e.is_active)
    .map((entity) => ({ id: Number(entity.id), name: entity.name }))
})

const warehousesList = computed(() => {
  return warehouses.value
    .filter((w) => w.is_active)
    .map((warehouse) => ({ id: Number(warehouse.id), name: warehouse.name }))
})

onMounted(async () => {
  if (sacrificeTypes.value.length === 0) {
    await sacrificeTypeStore.fetchSacrificeTypes(1, '')
  }
  if (distributionEntities.value.length === 0) {
    await entityStore.fetchEntities(1, '')
  }
  if (warehouses.value.length === 0) {
    await warehouseStore.fetchWarehouses(1, '')
  }
})

// إدارة الأخطاء
const errors = reactive({
  warehouse_id: false,
  distribution_entity_id: false,
  sacrifice_type_id: false,
  quantity: false,
})

const isEditMode = computed(() => !!props.initialData && !!props.initialData.id)

const createFreshForm = () => ({
  id: null,
  warehouse_id: '',
  distribution_entity_id: '',
  sacrifice_type_id: '',
  quantity: 1,
  value: null,
  notes: '',
})

const form = ref(createFreshForm())

// مراقبة بيانات التعديل وتوحيد أنواع البيانات
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        warehouse_id: newData.warehouse_id ? Number(newData.warehouse_id) : '',
        distribution_entity_id: newData.distribution_entity_id
          ? Number(newData.distribution_entity_id)
          : '',
        sacrifice_type_id: newData.sacrifice_type_id ? Number(newData.sacrifice_type_id) : '',
        quantity: newData.quantity ? Number(newData.quantity) : 1,
        value: newData.value ? Number(newData.value) : null,
        notes: newData.notes || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // إعادة تعيين الأخطاء
  Object.keys(errors).forEach((key) => (errors[key] = false))

  let hasError = false

  if (!isEditMode.value) {
    if (!form.value.warehouse_id) {
      errors.warehouse_id = true
      hasError = true
    }
    if (!form.value.distribution_entity_id) {
      errors.distribution_entity_id = true
      hasError = true
    }
    if (!form.value.sacrifice_type_id) {
      errors.sacrifice_type_id = true
      hasError = true
    }
    if (!form.value.quantity || form.value.quantity < 1) {
      errors.quantity = true
      hasError = true
    }
  }

  if (hasError) return

  const payload = { ...form.value }

  if (isEditMode.value) {
    emit('submit', {
      id: payload.id,
      notes: payload.notes,
    })
  } else {
    emit('submit', payload)
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
