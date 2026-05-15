<template>
  <div class="space-y-6">
    <!-- رأس الصفحة مع زر التحديث -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">لوحة القيادة (Dashboard)</h1>
        <p class="text-sm text-text-muted mt-1">
          نظرة عامة على الإحصائيات، الأرصدة، والحركات المالية.
        </p>
      </div>
      <button
        @click="fetchStats"
        :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-200"
      >
        <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin text-primary': loading }" />
        <span class="font-medium text-sm">تحديث البيانات</span>
      </button>
    </div>

    <!-- مؤشر التحميل -->
    <div v-if="loading && !stats" class="flex justify-center items-center py-20">
      <div
        class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- محتوى اللوحة -->
    <div v-else-if="stats" class="space-y-8">
      <!-- ========================================== -->
      <!-- 1. البطاقات العلوية (المؤشرات الرئيسية) -->
      <!-- ========================================== -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- إجمالي المستفيدين -->
        <div
          class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg shadow-blue-500/30"
        >
          <div class="relative z-10 flex flex-col h-full justify-between">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-blue-100 text-sm font-medium mb-1">المستفيدون المسجلون</p>
                <h3 class="text-3xl font-bold font-mono">
                  {{ stats.general.total_beneficiaries }}
                </h3>
              </div>
              <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UsersIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <!-- شكل زخرفي -->
          <div
            class="absolute -bottom-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"
          ></div>
        </div>

        <!-- إجمالي الأضاحي الموزعة -->
        <div
          class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-6 text-white shadow-lg shadow-emerald-500/30"
        >
          <div class="relative z-10 flex flex-col h-full justify-between">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-emerald-50 text-sm font-medium mb-1">إجمالي الأضاحي الموزعة</p>
                <h3 class="text-3xl font-bold font-mono">
                  {{ stats.general.total_distributions }}
                </h3>
              </div>
              <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <HeartIcon class="w-6 h-6 text-white" />
              </div>
            </div>
            <div class="mt-4 text-xs flex gap-3 text-emerald-50">
              <span
                >مجاني:
                <strong class="font-mono text-white">{{
                  stats.general.distributions_by_type.free
                }}</strong></span
              >
              <span
                >كاش:
                <strong class="font-mono text-white">{{
                  stats.general.distributions_by_type.cash
                }}</strong></span
              >
              <span
                >أقساط:
                <strong class="font-mono text-white">{{
                  stats.general.distributions_by_type.installments
                }}</strong></span
              >
            </div>
          </div>
        </div>

        <!-- المبالغ المحصلة -->
        <div
          class="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                المبالغ المحصلة (كاش + دفعات)
              </p>
              <h3 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {{ formatCurrency(stats.financial.collected) }}
              </h3>
            </div>
            <div
              class="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"
            >
              <BanknotesIcon class="w-6 h-6" />
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
              <div
                class="bg-emerald-500 h-1.5 rounded-full"
                :style="`width: ${calculatePercentage(stats.financial.collected, stats.financial.expected)}%`"
              ></div>
            </div>
            <p class="text-xs text-gray-400 mt-2">
              من أصل المتوقع: {{ formatCurrency(stats.financial.expected) }}
            </p>
          </div>
        </div>

        <!-- المديونيات المتبقية -->
        <div
          class="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                المديونيات (أقساط غير مسددة)
              </p>
              <h3 class="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                {{ formatCurrency(stats.financial.debts) }}
              </h3>
            </div>
            <div
              class="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg"
            >
              <CreditCardIcon class="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- 2. القسم الأوسط (المخزون) -->
      <!-- ========================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- رصيد المخزن الرئيسي -->
        <div
          class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm"
        >
          <div
            class="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-slate-700 pb-4"
          >
            <ArchiveBoxIcon class="w-6 h-6 text-primary" />
            <h2 class="text-lg font-bold text-text-primary">رصيد المخزن الرئيسي (جاهز للتسليم)</h2>
          </div>

          <div
            v-if="stats.inventory.main_store.length > 0"
            class="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div
              v-for="item in stats.inventory.main_store"
              :key="item.id"
              class="p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center"
            >
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{{
                item.type_name
              }}</span>
              <span
                class="text-2xl font-bold text-text-primary font-mono"
                :class="{ 'text-rose-500': item.quantity <= 0 }"
                >{{ item.quantity }}</span
              >
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            لا توجد أرصدة في المخزن الرئيسي حالياً.
          </div>
        </div>

        <!-- عهد الموزعين المتبقية -->
        <div
          class="bg-gradient-to-b from-amber-50 to-white dark:from-slate-800 dark:to-slate-800 rounded-2xl p-6 border border-amber-100 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center"
        >
          <div
            class="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400"
          >
            <TruckIcon class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-bold text-text-primary mb-1">عُهد طرف الموزعين</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            أضاحي تم تسليمها ولم توزع للمستفيدين بعد
          </p>
          <span class="text-4xl font-bold font-mono text-amber-600 dark:text-amber-400">{{
            stats.inventory.distributors_total
          }}</span>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- 3. القسم السفلي (أحدث الحركات) -->
      <!-- ========================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- آخر التوزيعات -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col"
        >
          <div
            class="p-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50"
          >
            <h2 class="text-base font-bold text-text-primary flex items-center gap-2">
              <GiftIcon class="w-5 h-5 text-emerald-500" />
              أحدث عمليات التوزيع
            </h2>
          </div>
          <div class="p-0 overflow-x-auto flex-1">
            <table class="w-full text-sm text-right">
              <thead
                class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/50"
              >
                <tr>
                  <th class="px-4 py-3 font-medium">المستفيد</th>
                  <th class="px-4 py-3 font-medium">النوع</th>
                  <th class="px-4 py-3 font-medium text-center">الدفع</th>
                  <th class="px-4 py-3 font-medium text-left">التاريخ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
                <tr
                  v-for="dist in stats.recent_activities.distributions"
                  :key="dist.id"
                  class="hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <td class="px-4 py-3 font-medium text-text-primary">
                    {{ dist.beneficiary_name }}
                  </td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ dist.type_name }}</td>
                  <td class="px-4 py-3 text-center">
                    <span
                      v-if="dist.payment_method === 'free'"
                      class="px-2 py-0.5 text-[10px] rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
                      >مجاني</span
                    >
                    <span
                      v-else-if="dist.payment_method === 'cash'"
                      class="px-2 py-0.5 text-[10px] rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400"
                      >كاش</span
                    >
                    <span
                      v-else
                      class="px-2 py-0.5 text-[10px] rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
                      >أقساط</span
                    >
                  </td>
                  <td class="px-4 py-3 text-left text-xs text-gray-500 font-mono dir-ltr">
                    {{ formatDateTime(dist.created_at) }}
                  </td>
                </tr>
                <tr v-if="!stats.recent_activities.distributions.length">
                  <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                    لا توجد عمليات توزيع حديثة
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- آخر الدفعات المحصلة -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col"
        >
          <div
            class="p-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50"
          >
            <h2 class="text-base font-bold text-text-primary flex items-center gap-2">
              <BanknotesIcon class="w-5 h-5 text-blue-500" />
              أحدث إيصالات السداد (أقساط)
            </h2>
          </div>
          <div class="p-0 overflow-x-auto flex-1">
            <table class="w-full text-sm text-right">
              <thead
                class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/50"
              >
                <tr>
                  <th class="px-4 py-3 font-medium">المستفيد</th>
                  <th class="px-4 py-3 font-medium">الإيصال</th>
                  <th class="px-4 py-3 font-medium">المبلغ</th>
                  <th class="px-4 py-3 font-medium text-left">التاريخ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
                <tr
                  v-for="payment in stats.recent_activities.payments"
                  :key="payment.id"
                  class="hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <td class="px-4 py-3 font-medium text-text-primary">
                    {{ payment.beneficiary_name }}
                  </td>
                  <td class="px-4 py-3 text-gray-500 font-mono text-xs">
                    #{{ payment.receipt_number || payment.id }}
                  </td>
                  <td class="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {{ formatCurrency(payment.amount) }}
                  </td>
                  <td class="px-4 py-3 text-left text-xs text-gray-500 font-mono dir-ltr">
                    {{ formatDateTime(payment.created_at) }}
                  </td>
                </tr>
                <tr v-if="!stats.recent_activities.payments.length">
                  <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                    لا توجد دفعات حديثة
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import dashboardService from '@/services/dashboardService'

// استيراد الأيقونات من Heroicons
import {
  UsersIcon,
  HeartIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  TruckIcon,
  GiftIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()

const stats = ref(null)
const loading = ref(false)

const fetchStats = async () => {
  loading.value = true
  try {
    const response = await dashboardService.getStats()
    stats.value = response.data
  } catch (error) {
    console.error('Dashboard Error:', error)
    toast.error('حدث خطأ أثناء جلب إحصائيات لوحة التحكم.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})

// === دوال التنسيق المساعدة ===

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 ج.س'
  return (
    new Intl.NumberFormat('ar-SD', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value) + ' ج.س'
  )
}

const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0
  const percentage = (part / total) * 100
  return Math.min(percentage, 100).toFixed(1)
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return dateString.split(' ')[1] + ' ' + dateString.split(' ')[0]
}
</script>

<style scoped>
.dir-ltr {
  direction: ltr;
}
</style>
