<template>
  <div class="print-portrait-container bg-white text-black p-8 font-sans" dir="rtl">
    <div class="flex justify-between items-center border-b-2 border-gray-900 pb-4 mb-8">
      <div class="flex items-center gap-4">
        <img src="/MainLogo2.png" alt="Logo" class="w-16 h-16 object-contain" />
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">إدارة المساعدات</h1>
          <p class="text-lg font-bold text-gray-600">{{ reportTitle }}</p>
        </div>
      </div>
      <div class="text-left text-sm font-medium text-gray-500 border-r-2 border-gray-200 pr-4">
        <p>تاريخ السند: {{ currentDate }}</p>
        <p>وقت الاستخراج: {{ currentTime }}</p>
        <p class="mt-1 font-bold text-black text-xs">
          رقم السند: #{{ printData?.assistance?.id || '---' }}
        </p>
      </div>
    </div>

    <div v-if="printData" class="bg-gray-50 border border-gray-200 rounded p-4 mb-8">
      <h3 class="text-sm font-black text-gray-800 mb-3 border-b border-gray-200 pb-2">
        بيانات المستفيد
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="col-span-2">
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">اسم المستفيد</p>
          <p class="text-base font-black text-gray-900">{{ printData.beneficiary?.name }}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">الرقم الوطني</p>
          <p class="text-sm font-bold text-gray-800 font-mono">
            {{ printData.beneficiary?.national_id || '-' }}
          </p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">رقم الهاتف</p>
          <p class="text-sm font-bold text-gray-800 font-mono" dir="ltr">
            {{ printData.beneficiary?.phone || '-' }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="printData" class="mb-8">
      <div
        v-if="printData.type === 'financial'"
        class="border border-gray-200 rounded p-6 text-center bg-gray-50"
      >
        <p class="text-gray-500 font-bold mb-2">تم صرف مساعدة مالية من نوع:</p>
        <p class="text-xl font-black text-primary mb-6">
          {{ printData.assistance?.type === 'social' ? 'مساعدة اجتماعية' : 'مساعدة علاجية' }}
        </p>

        <p class="text-gray-500 font-bold mb-2">وقدرها:</p>
        <div class="text-4xl font-black text-gray-900 mb-2">
          {{ Number(printData.assistance?.approved_amount || 0).toLocaleString() }}
          <span class="text-xl font-normal text-gray-600">دينار ليبي</span>
        </div>

        <p class="text-sm mt-6 text-gray-600">
          تاريخ الطلب / الاستحقاق:
          <span class="font-bold text-gray-900">{{ printData.assistance?.request_date }}</span>
        </p>
      </div>

      <div v-else-if="printData.type === 'in_kind'" class="border border-gray-200 rounded p-6">
        <div class="flex justify-between items-start mb-6">
          <div>
            <p class="text-gray-500 text-sm font-bold mb-1">تاريخ الصرف</p>
            <p class="font-black text-gray-900">{{ printData.assistance?.request_date }}</p>
          </div>
          <div class="text-left w-1/2">
            <p class="text-gray-500 text-sm font-bold mb-1">أسباب الصرف</p>
            <p class="text-sm font-bold text-gray-900">
              {{ printData.assistance?.reasons || 'لا يوجد تفاصيل إضافية' }}
            </p>
          </div>
        </div>

        <h4 class="font-bold text-gray-800 mb-3 bg-gray-100 p-2 rounded">
          بيانات الأصناف المصروفة:
        </h4>
        <table class="w-full text-right border-collapse table-auto">
          <thead>
            <tr class="bg-gray-800 text-white print:bg-gray-200 print:text-black text-sm">
              <th class="p-2 border border-gray-600 w-12 text-center">#</th>
              <th class="p-2 border border-gray-600">البيان / الوصف</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in printData.assistance?.items"
              :key="index"
              class="border-b border-gray-300"
            >
              <td class="p-2 border border-gray-300 text-center font-bold">{{ index + 1 }}</td>
              <td class="p-2 border border-gray-300">{{ item.description }}</td>
            </tr>
            <tr v-if="!printData.assistance?.items?.length">
              <td colspan="2" class="p-4 text-center text-gray-500">لا توجد أصناف مسجلة.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      class="mt-20 grid grid-cols-3 gap-8 text-center pt-8 border-t-2 border-gray-800 break-inside-avoid"
    >
      <div class="space-y-12">
        <p class="font-bold text-gray-800 text-sm">
          {{ printData?.type === 'financial' ? 'أمين الخزينة' : 'أمين المخزن' }}
        </p>
        <div class="border-b border-gray-400 w-40 mx-auto"></div>
      </div>
      <div class="space-y-12">
        <p class="font-bold text-gray-800 text-sm">توقيع المستفيد (المستلم)</p>
        <div class="border-b border-gray-400 w-40 mx-auto"></div>
      </div>
      <div class="space-y-12">
        <p class="font-bold text-gray-800 text-sm">اعتماد الإدارة</p>
        <div class="border-b border-gray-400 w-40 mx-auto"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const printData = ref(null)

const currentDate = new Date().toLocaleDateString('ar-LY')
const currentTime = new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })

const reportTitle = computed(() => {
  if (!printData.value) return 'سند مساعدة'
  return printData.value.type === 'financial' ? 'سند صرف مساعدة مالية' : 'سند صرف مساعدة عينية'
})

onMounted(() => {
  const savedData = sessionStorage.getItem('printAssistanceData')

  if (savedData) {
    try {
      printData.value = JSON.parse(savedData)

      setTimeout(() => {
        window.print()
      }, 800) // تأخير بسيط لضمان رسم الواجهة
    } catch (e) {
      console.error('خطأ في تحليل بيانات الطباعة', e)
    }
  } else {
    console.warn('لم يتم العثور على بيانات للطباعة')
  }
})
</script>

<style scoped>
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm 10mm;
  }
  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    margin: 0;
  }
}
.print-portrait-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}
table {
  border-spacing: 0;
  width: 100%;
}
tr {
  break-inside: avoid;
  page-break-inside: avoid;
}
.break-inside-avoid {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
