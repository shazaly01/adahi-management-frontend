import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// --- استيراد التخطيطات الرئيسية (Layouts) ---
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

// --- استيراد الصفحات الأساسية ---
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

// --- استيراد صفحات النظام القديم (الجمعية الخيرية والمساعدات) ديناميكياً ---
// إدارة النظام والمستخدمين
const UsersList = () => import('@/views/users/UsersList.vue')
const RolesList = () => import('@/views/roles/RolesList.vue')
const BackupsList = () => import('@/views/settings/BackupsList.vue')

// --- استيراد صفحات نظام الأضاحي والمخزون والأقساط (النظام الجديد) ---
const SacrificeTypesList = () => import('@/views/sacrifices/SacrificeTypesList.vue')
const BeneficiariesList = () => import('@/views/beneficiaries/BeneficiariesList.vue')
const SuppliersList = () => import('@/views/suppliers/SuppliersList.vue')
const WarehousesList = () => import('@/views/warehouses/WarehousesList.vue')
const DistributionEntitiesList = () =>
  import('@/views/distributionEntities/DistributionEntitiesList.vue') // الكيان الجديد: جهات التوزيع
const SuppliesList = () => import('@/views/inventory/SuppliesList.vue')
const AllocationsList = () => import('@/views/inventory/AllocationsList.vue')
const DistributionsList = () => import('@/views/distributions/DistributionsList.vue')
const EntityStocksList = () => import('@/views/inventory/EntityStocksList.vue') // الكيان الجديد: الأرصدة (بديل UserStocks)
const InventoryMovementsList = () => import('@/views/inventory/InventoryMovementsList.vue')
const InstallmentContractsList = () => import('@/views/installments/InstallmentContractsList.vue')
const InstallmentPaymentsList = () => import('@/views/installments/InstallmentPaymentsList.vue')

// --- استيراد صفحات التقارير ---
const TreasuryStatementReport = () => import('@/views/reports/TreasuryStatementReport.vue')
const BeneficiaryStatementReport = () => import('@/views/reports/BeneficiaryStatementReport.vue')
const InKindDistributionReport = () => import('@/views/reports/InKindDistributionReport.vue')
const GlobalBalancesReport = () => import('@/views/reports/GlobalBalancesReport.vue')
const FinancialAidByTypeReport = () => import('@/views/reports/FinancialAidByTypeReport.vue')
const MessageCenter = () => import('@/views/messages/MessageCenter.vue')

const routes = [
  // --- المسارات العامة (لا تتطلب مصادقة) ---
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: LoginView },
      // إعادة توجيه المسار الجذري إلى صفحة تسجيل الدخول
      { path: '', redirect: '/login' },
    ],
  },

  {
    path: '/print/assistance',
    name: 'PrintAssistance',
    component: () => import('@/views/reports/PrintAssistance.vue'),
    meta: { requiresAuth: true, layout: 'empty' },
  },

  // ---------------------------------------------------------
  // ---> التعديل هنا: إضافة مسار طباعة إيصالات الأضاحي <---
  // ---------------------------------------------------------
  {
    path: '/print/distributions',
    name: 'DistributionPrint',
    component: () => import('@/views/distributions/PrintReceipts.vue'),
    // نستخدم layout: 'empty' لكي لا تظهر القوائم الجانبية أثناء الطباعة
    meta: { requiresAuth: true, layout: 'empty', permission: 'distribution.view' },
  },

  {
    path: '/print/allocations/:id',
    name: 'AllocationPrint',
    component: () => import('@/views/inventory/PrintAllocationReceipt.vue'),
    meta: { requiresAuth: true, layout: 'empty', permission: 'allocation.view' },
  },
  // --- المسارات المحمية (تتطلب مصادقة) ---
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { permission: 'dashboard.view' },
      },

      // --- مسارات إدارة النظام ---
      {
        path: 'users',
        name: 'UsersList',
        component: UsersList,
        meta: { permission: 'user.view' },
      },
      {
        path: 'roles',
        name: 'RolesList',
        component: RolesList,
        meta: { permission: 'role.view' },
      },
      {
        path: 'settings/backups',
        name: 'BackupsList',
        component: BackupsList,
        meta: { permission: 'backup.view' },
      },

      {
        path: 'messages',
        name: 'MessageCenter',
        component: MessageCenter,
        meta: { permission: 'message.view' },
      },

      // ---------------------------------------------------------------------
      // --- مسارات نظام إدارة الأضاحي والأقساط (الإضافات الجديدة) ---
      // ---------------------------------------------------------------------
      {
        path: 'suppliers',
        name: 'SuppliersList',
        component: SuppliersList,
        meta: { permission: 'supplier.view' },
      },
      {
        path: 'warehouses',
        name: 'WarehousesList',
        component: WarehousesList,
        meta: { permission: 'warehouse.view' },
      },
      {
        path: 'distribution-entities', // مسار جهات التوزيع
        name: 'DistributionEntitiesList',
        component: DistributionEntitiesList,
        meta: { permission: 'distribution_entity.view' },
      },
      {
        path: 'sacrifice-types',
        name: 'SacrificeTypesList',
        component: SacrificeTypesList,
        meta: { permission: 'sacrifice_type.view' },
      },
      {
        path: 'supplies',
        name: 'SuppliesList',
        component: SuppliesList,
        meta: { permission: 'supply.view' },
      },
      {
        path: 'allocations',
        name: 'AllocationsList',
        component: AllocationsList,
        meta: { permission: 'allocation.view' },
      },
      {
        path: 'beneficiaries',
        name: 'BeneficiariesList',
        component: BeneficiariesList,
        meta: { permission: 'beneficiary.view' },
      },
      {
        path: 'distributions',
        name: 'DistributionsList',
        component: DistributionsList,
        meta: { permission: 'distribution.view' },
      },
      {
        path: 'installments/contracts',
        name: 'InstallmentContractsList',
        component: InstallmentContractsList,
        meta: { permission: 'installment_contract.view' },
      },
      {
        path: 'installments/payments',
        name: 'InstallmentPaymentsList',
        component: InstallmentPaymentsList,
        meta: { permission: 'installment_payment.view' },
      },
      {
        path: 'inventory/entity-stocks', // مسار الأرصدة الجديد
        name: 'EntityStocksList',
        component: EntityStocksList,
        // تم إزالة قيد الصلاحية من هنا لأن الجميع يستطيع رؤية الأرصدة كما قررنا
      },
      {
        path: 'inventory/movements',
        name: 'InventoryMovementsList',
        component: InventoryMovementsList,
        meta: { permission: 'inventory.view' },
      },

      // --- مسارات التقارير ---
      {
        path: 'reports/treasury-statement',
        name: 'TreasuryStatementReport',
        component: TreasuryStatementReport,
        meta: { permission: 'treasury.view' },
      },
      {
        path: 'reports/beneficiary-statement',
        name: 'BeneficiaryStatementReport',
        component: BeneficiaryStatementReport,
        meta: { permission: 'beneficiary.view' },
      },
      {
        path: 'reports/in-kind-distribution',
        name: 'InKindDistributionReport',
        component: InKindDistributionReport,
        meta: { permission: 'in_kind_assistance.view' },
      },
      {
        path: 'reports/global-balances',
        name: 'GlobalBalancesReport',
        component: GlobalBalancesReport,
        meta: { permission: 'treasury.view' },
      },
      {
        path: 'reports/financial-aid-by-type',
        name: 'FinancialAidByTypeReport',
        component: FinancialAidByTypeReport,
        meta: { permission: 'financial_assistance.view' },
      },

      // إعادة توجيه المسار الرئيسي للتطبيق إلى لوحة التحكم
      { path: '', redirect: '/app/dashboard' },
    ],
  },

  // مسار للتعامل مع الصفحات غير الموجودة (404 Fallback)
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- حارس التنقل العام (Global Navigation Guard) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { isAuthenticated, can } = authStore

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      authStore.returnUrl = to.fullPath
      next({ name: 'Login' })
    } else {
      const requiredPermission = to.meta.permission
      // إذا كان المسار يطلب صلاحية، نتحقق منها (مسار الأرصدة لن يدخل هنا لأنه بدون صلاحية)
      if (requiredPermission && !can(requiredPermission)) {
        console.warn(
          `Access denied: route "${String(to.name)}" requires permission "${requiredPermission}"`,
        )
        // توجيه المستخدم للوحة التحكم إذا لم تكن لديه الصلاحية
        next({ name: 'Dashboard' })
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
