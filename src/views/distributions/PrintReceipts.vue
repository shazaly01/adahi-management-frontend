<template>
  <div class="print-wrapper min-h-screen bg-gray-100 font-sans" dir="rtl">
    <div
      class="no-print bg-white shadow-md p-4 sticky top-0 z-50 flex justify-between items-center"
    >
      <div>
        <h2 class="text-2xl font-bold text-indigo-700">معاينة الإيصالات (ملون)</h2>
        <p class="text-sm text-gray-500 mt-1">
          يتم عرض الإيصالات بمقاس A5 (إيصالين في كل صفحة A4 - يرجى التأكد من أن إعداد الطباعة
          Portrait)
        </p>
      </div>
      <div class="flex gap-4">
        <button
          @click="window.close()"
          class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
        >
          إغلاق
        </button>
        <button
          @click="executePrint"
          :disabled="loading || error"
          class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
        >
          <span class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                clip-rule="evenodd"
              />
            </svg>
            طباعة ملونة الآن
          </span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col justify-center items-center h-[80vh] no-print">
      <div
        class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"
      ></div>
      <p class="text-xl font-bold text-indigo-800">جاري تجهيز الإيصالات المذهلة...</p>
    </div>

    <div
      v-else-if="error"
      class="flex flex-col justify-center items-center h-[80vh] no-print text-red-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-24 w-24 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-2xl font-bold mb-2">عذراً، حدث خطأ!</p>
      <p class="text-lg">{{ error }}</p>
    </div>

    <div
      v-else
      class="print-container py-8 mx-auto flex flex-col gap-8 items-center print:py-0 print:gap-0"
    >
      <div
        v-for="(receipt, index) in receipts"
        :key="receipt.id"
        class="receipt-card relative bg-white overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-indigo-400"
        >
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

        <div
          class="relative z-10 flex justify-between items-center px-8 pt-8 pb-4 border-b-2 border-indigo-100 print:pt-10"
        >
          <div class="flex items-center gap-4">
            <div class="bg-white p-1 rounded-lg shadow-sm">
              <img src="/MainLogo.png" alt="شعار الشركة" class="h-16 w-auto object-contain" />
            </div>
            <div>
              <h1 class="text-2xl font-black text-indigo-900 tracking-tight drop-shadow-sm">
                إيصال استلام أضحية
              </h1>
              <p class="text-sm font-bold text-indigo-600 mt-1">
                تاريخ الإصدار: {{ formatDate(receipt.created_at) }}
              </p>
            </div>
          </div>
          <div class="text-left">
            <div class="inline-block bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
              <p class="text-xs text-indigo-500 font-bold mb-1">رقم الإيصال</p>
              <p class="text-xl font-black text-indigo-700 font-mono">
                #{{ receipt.receipt_number }}
              </p>
            </div>
          </div>
        </div>

        <div class="px-8 py-6 grid grid-cols-2 gap-8 relative z-10">
          <div class="space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-6 bg-indigo-500 rounded-full"></div>
              <h3 class="text-lg font-bold text-gray-800">بيانات المستفيد</h3>
            </div>

            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner space-y-3">
              <div class="flex justify-between border-b border-gray-200 pb-2">
                <span class="text-gray-500 font-bold">الاسم الرباعي:</span>
                <span class="font-black text-gray-900">{{ receipt.beneficiary?.name }}</span>
              </div>
              <div
                class="flex justify-between border-b border-gray-200 pb-2"
                v-if="receipt.beneficiary?.national_id"
              >
                <span class="text-gray-500 font-bold">الرقم الوطني:</span>
                <span class="font-bold text-gray-900">{{ receipt.beneficiary.national_id }}</span>
              </div>
              <div class="flex justify-between pb-2" v-if="receipt.beneficiary?.phone">
                <span class="text-gray-500 font-bold">رقم الهاتف:</span>
                <span class="font-bold text-gray-900" dir="ltr">{{
                  receipt.beneficiary.phone
                }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-6 bg-emerald-500 rounded-full"></div>
              <h3 class="text-lg font-bold text-gray-800">بيانات الصرف</h3>
            </div>

            <div
              class="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-inner space-y-3"
            >
              <div class="flex justify-between border-b border-emerald-100 pb-2">
                <span class="text-gray-600 font-bold">نوع الأضحية:</span>
                <span class="font-black text-emerald-700 bg-white px-2 py-0.5 rounded shadow-sm">{{
                  receipt.sacrifice_type?.name
                }}</span>
              </div>
              <div class="flex justify-between border-b border-emerald-100 pb-2">
                <span class="text-gray-600 font-bold">طريقة الدفع:</span>
                <span class="font-bold text-gray-900">{{
                  getPaymentMethodLabel(receipt.payment_method)
                }}</span>
              </div>
              <div class="flex justify-between pb-2">
                <span class="text-gray-600 font-bold">المبلغ المطلوب:</span>
                <span class="font-black text-gray-900 text-lg">
                  {{ receipt.payment_method === 'free' ? '0' : receipt.actual_price }}
                  <span class="text-sm text-gray-500">ج.س</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="receipt.installment_contract" class="px-8 pb-4 relative z-10">
          <div
            class="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 flex justify-between items-center shadow-sm"
          >
            <div>
              <span class="text-sm text-indigo-800 font-bold block mb-1">إجمالي مبلغ التقسيط</span>
              <span class="text-xl font-black text-indigo-900"
                >{{ receipt.installment_contract.total_amount }} ج.س</span
              >
            </div>
            <div class="w-px h-10 bg-indigo-200"></div>
            <div>
              <span class="text-sm text-indigo-800 font-bold block mb-1">المُسدد مقدماً</span>
              <span class="text-xl font-black text-emerald-600"
                >{{ receipt.installment_contract.paid_amount }} ج.س</span
              >
            </div>
            <div class="w-px h-10 bg-indigo-200"></div>
            <div>
              <span class="text-sm text-indigo-800 font-bold block mb-1">حالة العقد</span>
              <span class="text-lg font-bold text-indigo-900 bg-white px-3 py-1 rounded shadow-sm">
                {{
                  receipt.installment_contract.status === 'active' ? 'قيد السداد (نشط)' : 'مكتمل'
                }}
              </span>
            </div>
          </div>
        </div>

        <div class="px-8 pb-8 pt-6 mt-auto relative z-10">
          <div
            class="flex justify-between items-end border-t-2 border-dashed border-gray-300 pt-10"
          >
            <div class="text-center w-48">
              <p class="font-bold text-gray-800 bg-gray-50 py-1 rounded">توقيع المستفيد</p>
              <p class="mt-8 border-b-2 border-gray-400"></p>
            </div>

            <div class="text-center">
              <div
                class="w-24 h-24 border-2 border-indigo-200 rounded-full mx-auto flex items-center justify-center bg-indigo-50/30"
              >
                <span class="text-xs text-indigo-300 font-bold rotate-[-15deg]"
                  >ختم<br />المؤسسة</span
                >
              </div>
            </div>

            <div class="text-center w-48">
              <p class="font-bold text-gray-800 bg-gray-50 py-1 rounded">توقيع المنفذ</p>
              <p class="text-sm font-bold text-indigo-600 mt-2 mb-2">
                {{ receipt.distributor?.full_name }}
              </p>
              <p class="border-b-2 border-gray-400"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import distributionService from '@/services/distributionService'

const route = useRoute()
const receipts = ref([])
const loading = ref(true)
const error = ref(null)

const paymentMethodsMap = {
  free: 'توزيع مجاني',
  cash: 'دفع نقدي',
  installments: 'دفع بالأقساط',
}

const getPaymentMethodLabel = (val) => {
  return paymentMethodsMap[val] || val
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

const fetchReceiptsData = async () => {
  try {
    const idsParam = route.query.ids
    if (!idsParam) throw new Error('لم يتم تمرير أرقام إيصالات للطباعة.')

    const idsArray = idsParam.split(',').map((id) => id.trim())

    const response = await distributionService.getReceipts(idsArray)
    receipts.value = response.data?.data || response.data

    // تأخير بسيط لضمان رسم المتصفح للصور والـ CSS بالكامل قبل فتح نافذة الطباعة
    setTimeout(() => {
      executePrint()
    }, 800)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'فشل تحميل بيانات الإيصالات'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReceiptsData()
})
</script>

<style scoped>
/* إعدادات الشاشة للمعاينة الفخمة */
.print-container {
  width: 100%;
  max-width: 21cm; /* عرض ورقة A4 للمحاكاة */
}

.receipt-card {
  width: 100%;
  height: 14.85cm; /* مقاس A5 (نصف طول ورقة A4 تماماً) */
  box-shadow:
    0 20px 25px -5px rgba(79, 70, 229, 0.1),
    0 10px 10px -5px rgba(79, 70, 229, 0.04);
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
}

/* ====================================================
   إعدادات الطباعة الصارمة الملونة (Full Color)
==================================================== */
@media print {
  @page {
    size: A4 portrait;
    margin: 0; /* التخلص من هوامش المتصفح الافتراضية */
  }

  /* إجبار المتصفح على رسم كل الخلفيات والألوان بالكامل */
  html,
  body,
  .print-wrapper,
  .print-container {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background-color: #ffffff !important;
    min-height: auto !important;
  }

  .no-print {
    display: none !important;
  }

  .print-container {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    gap: 0 !important;
  }

  .receipt-card {
    height: 14.85cm !important; /* نصف صفحة A4 بالظبط */
    width: 21cm !important; /* عرض كامل للصفحة */
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
    border-bottom: 2px dashed #999 !important; /* خط فاصل للقص بين الإيصالين */
    page-break-inside: avoid !important;
    margin: 0 !important;
  }

  /* إزالة الخط الفاصل للإيصال الأخير في الورقة لتجنب طباعة صفحة إضافية فارغة */
  .receipt-card:last-child,
  .receipt-card:nth-child(even) {
    border-bottom: none !important;
    page-break-after: always !important;
  }
}
</style>
