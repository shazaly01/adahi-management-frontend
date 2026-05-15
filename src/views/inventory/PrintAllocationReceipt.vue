<template>
  <div
    class="print-wrapper min-h-screen bg-gray-100 font-sans flex flex-col items-center py-8 print:py-0 print:bg-white"
    dir="rtl"
  >
    <div
      class="no-print w-full max-w-[21cm] bg-white shadow-md p-4 mb-8 rounded-xl flex justify-between items-center"
    >
      <div>
        <h2 class="text-xl font-bold text-emerald-700">معاينة أمر الصرف / العُهدة</h2>
        <p class="text-sm text-gray-500 mt-1">المقاس: A5 عرضي (Landscape) - مطابقة تامة للألوان</p>
      </div>
      <div class="flex gap-4">
        <button
          @click="window.close()"
          class="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
        >
          إغلاق
        </button>
        <button
          @click="executePrint"
          :disabled="loading || error"
          class="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
        >
          طباعة الإيصال الملون
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col justify-center items-center h-[50vh] no-print">
      <div
        class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600 mb-4"
      ></div>
      <p class="text-xl font-bold text-emerald-800">جاري تجهيز أمر الصرف...</p>
    </div>

    <div
      v-else-if="error"
      class="flex flex-col justify-center items-center h-[50vh] no-print text-red-600"
    >
      <p class="text-2xl font-bold mb-2">عذراً، حدث خطأ!</p>
      <p class="text-lg">{{ error }}</p>
    </div>

    <div v-else class="receipt-card relative bg-white overflow-hidden shadow-2xl">
      <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-600 to-teal-500">
        <svg
          class="absolute bottom-0 w-full h-12 text-white"
          preserveAspectRatio="none"
          viewBox="0 0 1440 54"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 22L120 16.7C240 11.3 480 0.7 720 0.7C960 0.7 1200 11.3 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
          />
        </svg>
      </div>

      <div class="relative z-10 flex justify-between items-center px-8 pt-8 pb-4">
        <div class="flex items-center gap-5">
          <div class="bg-white p-2 rounded-xl shadow-sm">
            <img src="/MainLogo.png" alt="شعار المؤسسة" class="h-16 w-auto object-contain" />
          </div>
          <div>
            <h1 class="text-3xl font-black text-white tracking-tight drop-shadow-md">
              إيصال تسليم عُهدة
            </h1>
            <p class="text-sm font-bold text-emerald-50 mt-1 drop-shadow-sm">
              أمر صرف مخزني للجهات
            </p>
          </div>
        </div>
        <div class="text-left mt-2">
          <div
            class="inline-block bg-white/90 backdrop-blur-sm border border-emerald-100 shadow-md rounded-xl px-5 py-2"
          >
            <p class="text-xs text-emerald-600 font-bold mb-1">الرقم المرجعي</p>
            <p class="text-xl font-black text-emerald-900 font-mono">
              ALLC-#{{ formatId(receipt.id) }}
            </p>
          </div>
        </div>
      </div>

      <div class="px-8 py-6 grid grid-cols-12 gap-6 relative z-10">
        <div class="col-span-7 space-y-4">
          <div class="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 shadow-inner h-full">
            <div class="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 class="text-lg font-bold text-gray-800">أطراف التسليم</h3>
            </div>

            <div class="space-y-4">
              <div>
                <span class="text-sm text-gray-500 font-bold block mb-1"
                  >الجهة المستلمة (المندوب):</span
                >
                <span
                  class="text-xl font-black text-emerald-800 bg-emerald-100/50 px-3 py-1 rounded-lg inline-block w-full"
                >
                  {{ receipt.distribution_entity?.name }}
                </span>
              </div>
              <div>
                <span class="text-sm text-gray-500 font-bold block mb-1"
                  >المستودع المُصدر (المنصرف منه):</span
                >
                <span class="text-lg font-bold text-gray-700">
                  {{ receipt.warehouse?.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-5 space-y-4">
          <div class="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm h-full">
            <div class="flex items-center gap-2 mb-4 border-b border-emerald-200 pb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 class="text-lg font-bold text-emerald-900">بيانات الأضاحي</h3>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-emerald-700 font-bold">نوع الأضحية:</span>
                <span class="font-black text-gray-900">{{ receipt.sacrifice_type?.name }}</span>
              </div>
              <div
                class="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-100"
              >
                <span class="text-emerald-700 font-bold">الكمية المُسلمة:</span>
                <span class="font-black text-2xl text-emerald-600">{{ receipt.quantity }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-emerald-700 font-bold">تاريخ التسليم:</span>
                <span class="font-bold text-gray-800" dir="ltr">{{
                  formatDate(receipt.created_at)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12" v-if="receipt.notes">
          <div class="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start gap-3">
            <span class="text-amber-500 mt-1">📌</span>
            <div>
              <span class="text-xs font-bold text-amber-800 block">ملاحظات العُهدة:</span>
              <span class="text-sm font-semibold text-amber-900">{{ receipt.notes }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="px-10 pb-8 mt-auto relative z-10">
        <div
          class="flex justify-between items-end border-t-2 border-dashed border-gray-300 pt-8 mt-4"
        >
          <div class="text-center w-48">
            <p class="font-bold text-emerald-900 bg-emerald-50 py-1 rounded-md mb-8">
              توقيع الجهة المستلمة
            </p>
            <p class="border-b-2 border-gray-400"></p>
            <p class="text-xs text-gray-500 mt-2">الاسم / التوقيع</p>
          </div>

          <div class="text-center opacity-40">
            <div
              class="w-24 h-24 border-4 border-double border-gray-400 rounded-full mx-auto flex items-center justify-center"
            >
              <span class="text-sm font-bold text-gray-400 rotate-[-15deg]">ختم<br />المستودع</span>
            </div>
          </div>

          <div class="text-center w-48">
            <p class="font-bold text-emerald-900 bg-emerald-50 py-1 rounded-md mb-8">
              توقيع أمين المخزن
            </p>
            <p class="border-b-2 border-gray-400"></p>
            <p class="text-xs text-gray-500 mt-2">الاسم / التوقيع</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import allocationService from '@/services/allocationService'

const route = useRoute()
const receipt = ref({})
const loading = ref(true)
const error = ref(null)

// تنسيق رقم الـ ID ليكون مثلا 0005
const formatId = (id) => {
  if (!id) return ''
  return String(id).padStart(4, '0')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const executePrint = () => {
  window.print()
}

const fetchReceiptData = async () => {
  try {
    const id = route.params.id
    if (!id) throw new Error('لم يتم تمرير رقم العُهدة.')

    // استدعاء دالة الباك إند التي أنشأناها مسبقاً لجلب بيانات إيصال التسليم مع علاقاته
    const response = await allocationService.getReceipt(id)
    receipt.value = response.data?.data || response.data

    // الانتظار لتنفيذ رسومات الـ CSS بوضوح
    setTimeout(() => {
      executePrint()
    }, 800)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'فشل تحميل بيانات العُهدة'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReceiptData()
})
</script>

<style scoped>
/* إعدادات الشاشة للمعاينة (ورقة A5 بالعرض) */
.receipt-card {
  width: 21cm;
  height: 14.85cm;
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
}

/* ====================================================
   إعدادات الطباعة (للاحتفاظ بالألوان والتموجات 100%)
==================================================== */
@media print {
  @page {
    size: A5 landscape; /* مقاس A5 بالعرض */
    margin: 0;
  }

  /* السر هنا: إجبار المتصفح على رسم كل الألوان والخلفيات */
  html,
  body,
  .print-wrapper {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background-color: transparent !important;
  }

  .no-print {
    display: none !important;
  }

  /* إزالة أي هوامش أو حدود من الورقة نفسها لتأخذ مساحة الورقة الكاملة */
  .receipt-card {
    width: 21cm !important;
    height: 14.85cm !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    margin: 0 !important;
    page-break-inside: avoid !important;
  }
}
</style>
