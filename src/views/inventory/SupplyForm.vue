<!--src\views\inventory\SupplyForm.vue-->
<template>
  <form @submit.prevent="handleSubmit">
    <!-- تنبيه يظهر فقط في حالة التعديل -->
    <div
      v-if="isEditMode"
      class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-md"
    >
      <p class="text-sm text-amber-800 dark:text-amber-200">
        <span class="font-bold">ملاحظة محاسبية:</span> أنت في وضع التعديل. يُسمح فقط بتحديث
        الملاحظات وملاحظة الوزن للحفاظ على سلامة الرصيد المخزني.
      </p>
    </div>

    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- المخزن المستلم (إضافة جديدة) -->
        <div>
          <AppDropdown
            id="warehouse-id"
            label="المخزن المستلم (تدخل إليه الأضاحي)"
            v-model="form.warehouse_id"
            :options="warehousesList"
            placeholder="اختر المخزن"
            :disabled="isEditMode"
            required
          />
          <p v-if="errors.warehouse_id" class="text-rose-500 text-xs mt-1 font-bold">
            يجب تحديد المخزن المستلم
          </p>
        </div>

        <!-- المورد (تحديث ليكون Dropdown بدلاً من نص) -->
        <div>
          <AppDropdown
            id="supplier-id"
            label="المورد"
            v-model="form.supplier_id"
            :options="suppliersList"
            placeholder="اختر المورد"
            :disabled="isEditMode"
            required
          />
          <p v-if="errors.supplier_id" class="text-rose-500 text-xs mt-1 font-bold">
            يجب تحديد المورد
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

        <!-- الكمية الموردة -->
        <div>
          <AppInput
            id="quantity"
            label="الكمية (عدد الرؤوس)"
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
        <!-- التكلفة الإجمالية -->
        <div>
          <AppInput
            id="total-value"
            label="إجمالي التكلفة (ج.س)"
            v-model.number="form.total_value"
            type="number"
            min="0"
            placeholder="ادخل التكلفة الإجمالية"
            :disabled="isEditMode"
          />
        </div>

        <!-- ملاحظة الوزن -->
        <div>
          <AppInput
            id="weight-note"
            label="ملاحظة الوزن"
            v-model="form.weight_note"
            placeholder="ملاحظات متعلقة بوزن الأضاحي (اختياري)"
          />
        </div>
      </div>

      <!-- الملاحظات (قابلة للتعديل دائماً) -->
      <div>
        <label class="block text-sm font-medium text-text-primary mb-1" for="notes">
          الملاحظات
        </label>
        <textarea
          id="notes"
          v-model="form.notes"
          rows="3"
          class="w-full rounded-md border border-surface-border bg-surface-base text-text-primary px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          placeholder="أي ملاحظات حول حالة التوريد أو السداد..."
        ></textarea>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'اعتماد التوريد' }}</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// استيراد الـ Stores
import { useSacrificeTypeStore } from '@/stores/sacrificeTypeStore'
import { useSupplierStore } from '@/stores/supplierStore'
import { useWarehouseStore } from '@/stores/warehouseStore'

// استيراد المكونات الأساسية
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

// تهيئة المخازن وجلب البيانات
const sacrificeTypeStore = useSacrificeTypeStore()
const supplierStore = useSupplierStore()
const warehouseStore = useWarehouseStore()

const { sacrificeTypes } = storeToRefs(sacrificeTypeStore)
const { suppliers } = storeToRefs(supplierStore)
const { warehouses } = storeToRefs(warehouseStore)

// تحضير الخيارات لتناسب مكون AppDropdown (تم توحيد المعرفات كأرقام)
const sacrificeTypesList = computed(() => {
  return sacrificeTypes.value.map((type) => ({ id: Number(type.id), name: type.name }))
})

const suppliersList = computed(() => {
  // تصفية الموردين النشطين فقط
  return suppliers.value
    .filter((s) => s.is_active)
    .map((supplier) => ({ id: Number(supplier.id), name: supplier.name }))
})

const warehousesList = computed(() => {
  // تصفية المخازن النشطة فقط
  return warehouses.value
    .filter((w) => w.is_active)
    .map((warehouse) => ({ id: Number(warehouse.id), name: warehouse.name }))
})

onMounted(async () => {
  // جلب البيانات إذا كانت القوائم فارغة
  if (sacrificeTypes.value.length === 0) {
    await sacrificeTypeStore.fetchSacrificeTypes(1, '')
  }
  if (suppliers.value.length === 0) {
    await supplierStore.fetchSuppliers(1, '')
  }
  if (warehouses.value.length === 0) {
    await warehouseStore.fetchWarehouses(1, '')
  }
})

// إدارة الأخطاء يدوياً
const errors = reactive({
  warehouse_id: false,
  supplier_id: false,
  sacrifice_type_id: false,
  quantity: false,
})

const isEditMode = computed(() => !!props.initialData && !!props.initialData.id)

const createFreshForm = () => ({
  id: null,
  warehouse_id: '',
  supplier_id: '',
  sacrifice_type_id: '',
  quantity: null,
  total_value: null,
  weight_note: '',
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
        supplier_id: newData.supplier_id ? Number(newData.supplier_id) : '',
        sacrifice_type_id: newData.sacrifice_type_id ? Number(newData.sacrifice_type_id) : '',
        quantity: newData.quantity ? Number(newData.quantity) : null,
        total_value: newData.total_value ? Number(newData.total_value) : null,
        weight_note: newData.weight_note || '',
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
  errors.warehouse_id = false
  errors.supplier_id = false
  errors.sacrifice_type_id = false
  errors.quantity = false

  let hasError = false

  // التحقق يتم فقط في حالة الإضافة
  if (!isEditMode.value) {
    if (!form.value.warehouse_id) {
      errors.warehouse_id = true
      hasError = true
    }
    if (!form.value.supplier_id) {
      errors.supplier_id = true
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

  // تجهيز البيانات للإرسال
  const payload = { ...form.value }

  // في حالة التعديل، نرسل فقط الحقول المسموح بتعديلها لتخفيف الطلب
  if (isEditMode.value) {
    emit('submit', {
      id: payload.id,
      notes: payload.notes,
      weight_note: payload.weight_note,
    })
  } else {
    emit('submit', payload)
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
