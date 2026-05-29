import useAppData from './hooks/useAppData'
import { isOnline } from './utils'
import ConfirmModal    from './components/ui/ConfirmModal'
import Toast           from './components/ui/Toast'
import Sidebar         from './components/layout/Sidebar'
import TopBar          from './components/layout/TopBar'
import BranchSelector  from './components/layout/BranchSelector'
import MobileBottomNav  from './components/layout/MobileBottomNav'
import CommandPalette   from './components/ui/CommandPalette'
import LoginPage       from './pages/LoginPage'
import Dashboard       from './pages/Dashboard'
import SalesAnalytics  from './pages/SalesAnalytics'
import OrderPage       from './pages/OrderPage'
import OperationPage   from './pages/OperationPage'
import OrdersPage      from './pages/OrdersPage'
import CashPage        from './pages/CashPage'
import OperationsTable from './pages/OperationsTable'
import EmployeesPage   from './pages/EmployeesPage'
import PayrollPage     from './pages/PayrollPage'
import PayrollArchive  from './pages/PayrollArchive'
import CategoriesPage  from './pages/CategoriesPage'
import BranchesPage    from './pages/BranchesPage'
import UsersPage       from './pages/UsersPage'
import ChatPage        from './pages/ChatPage'
import ProfilePage     from './pages/ProfilePage'
import { useState, useEffect } from 'react'
import './index.css'

export default function App() {
  const d = useAppData()
  const [cmdOpen, setCmdOpen] = useState(false)

  // Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(v => !v)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (!d.user) {
    return <LoginPage
      tr={d.tr} toast={d.toast} loginVal={d.loginVal} setLoginVal={d.setLoginVal}
      password={d.password} setPassword={d.setPassword}
      remember={d.remember} setRemember={d.setRemember}
      showPass={d.showPass} setShowPass={d.setShowPass}
      loginReady={d.loginReady} loading={d.loading} signIn={d.signIn} />
  }

  const markAllRead = d.markAllRead

  return (
    <div className={`app ${d.theme}`}>
      <Toast message={d.toast?.msg || (typeof d.toast === 'string' ? d.toast : '')}
             type={d.toast?.type || 'success'}
             onClose={d.clearToast} />
      <ConfirmModal modal={d.confirmModal} close={d.closeConfirm} />
      {d.mobileMenu && <div className="sidebarOverlay" onClick={() => d.setMobileMenu(false)} />}

      <Sidebar
        user={d.user} page={d.page} can={d.can} tr={d.tr}
        unreadCount={d.unreadCount} changePage={d.changePage}
        logout={d.logout} mobileMenu={d.mobileMenu} setMobileMenu={d.setMobileMenu} />

      <main className="main">
        <button className="mobileMenuBtn" onClick={() => d.setMobileMenu(true)}><span/><span/><span/></button>

        <TopBar
          page={d.page} tr={d.tr} period={d.period} setPeriod={d.setPeriod}
          lang={d.lang} setLang={d.setLang} theme={d.theme} setTheme={d.setTheme}
          isAdmin={d.isAdmin} loading={d.loading}
          notifications={d.notifications} notificationCount={d.notificationCount}
          notificationKey={d.notificationKey} showNotifications={d.showNotifications}
          openNotifications={d.openNotifications} changePage={d.changePage}
          markAllRead={markAllRead} setNotificationsSeenKey={() => {}}
          exportAllData={d.exportAllData} loadAll={d.loadAll}
          onOpenSearch={() => setCmdOpen(true)} />

        {!['branches','categories','users','profile','chat'].includes(d.page) && (
          <BranchSelector allowedBranches={d.allowedBranches} branch={d.branch} setBranch={d.setBranch} tr={d.tr} />
        )}

        {d.loading && <div className="loaderLine" />}

        {/* Push notification permission banner */}
        {!d.pushGranted && !d.pushDismissed && (
          <div className="pushBanner">
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.85} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span>Yangi xabarlar uchun bildirishnomalarni yoqing</span>
            <button className="primary" style={{ padding:'8px 14px', fontSize:12 }} onClick={d.requestPush}>Yoqish</button>
            <button className="secondary" style={{ padding:'8px 12px', fontSize:12 }} onClick={d.dismissPush}>Keyinroq</button>
          </div>
        )}

        <div className="pageContent" key={d.page}>

        {d.page === 'dashboard'      && <Dashboard tr={d.tr} stats={d.stats} operations={d.operations} selectedBranchIds={d.selectedBranchIds} period={d.period} loading={d.loading} />}
        {d.page === 'salesAnalytics' && <SalesAnalytics tr={d.tr} data={d.salesStats} orders={d.orders} selectedBranchIds={d.selectedBranchIds} />}

        {d.page === 'order' && (
          <OrderPage tr={d.tr} isAdmin={d.isAdmin} order={d.order} setOrder={d.setOrder}
            calcCash={d.calcCash} saveOrder={d.saveOrder} editOrder={d.editOrder} />
        )}

        {d.page === 'operation' && (
          <OperationPage tr={d.tr} isAdmin={d.isAdmin} op={d.op} setOp={d.setOp}
            categories={d.categories} catName={d.catName}
            saveOperation={d.saveOperation} editOp={d.editOp} />
        )}

        {d.page === 'orderReports' && (
          <OrdersPage tr={d.tr} rows={d.visibleOrders} isAdmin={d.isAdmin}
            edit={r => { d.setEditOrder(r); d.setOrder({ ...r, date: r.order_date }); d.changePage('order') }}
            del={r => d.deleteRow('shift_orders', r)}
            exportCSV={() => d.exportOrders(d.visibleOrders)}
            importCSV={d.importOrdersCSV}
            downloadTemplate={d.downloadOrdersTemplate}
            printPDF={() => window.print()} />
        )}

        {d.page === 'cash' && (
          <CashPage tr={d.tr} rows={d.visibleCashFiltered} approve={d.approveCash} isAdmin={d.isAdmin}
            editRow={d.editCashRow} setEditRow={d.setEditCashRow}
            editForm={d.editCashForm} setEditForm={d.setEditCashForm}
            saveCashEdit={d.saveCashEdit} delCash={d.deleteCashRow}
            dateFilter={d.cashDateFilter} setDateFilter={d.setCashDateFilter} />
        )}

        {d.page === 'history' && (
          <OperationsTable tr={d.tr} rows={d.visibleOps} catName={d.catName} isAdmin={d.isAdmin}
            selectedIds={d.selectedOperationIds} setSelectedIds={d.setSelectedOperationIds}
            bulkDelete={d.deleteManyOperations}
            edit={r => { d.setEditOp(r); d.setOp({ ...r, date: r.created_at?.slice(0,10) }); d.changePage('operation') }}
            del={r => d.deleteRow('operations', r)} />
        )}

        {d.page === 'reports' && (
          <OperationsTable title={d.tr.reports}
            tr={d.tr} rows={d.filteredReportOps} catName={d.catName} isAdmin={d.isAdmin}
            selectedIds={d.selectedOperationIds} setSelectedIds={d.setSelectedOperationIds}
            bulkDelete={d.deleteManyOperations}
            exportCSV={() => d.exportOperations(d.filteredReportOps)}
            importCSV={d.importOperationsCSV} downloadTemplate={d.downloadOperationsTemplate}
            printPDF={() => window.print()}
            showFilters filterOpen={d.reportFilterOpen} setFilterOpen={d.setReportFilterOpen}
            reportFilter={d.reportFilter} setReportFilter={d.setReportFilter}
            categories={d.categories}
            edit={r => { d.setEditOp(r); d.setOp({ ...r, date: r.created_at?.slice(0,10) }); d.changePage('operation') }}
            del={r => d.deleteRow('operations', r)} />
        )}

        {d.page === 'employees' && (
          <EmployeesPage tr={d.tr}
            employees={d.employees.filter(e => d.selectedBranchIds.includes(e.branch_id) && e.active !== false)}
            form={d.employeeForm} setForm={d.setEmployeeForm}
            save={d.saveEmployee} del={d.deleteEmployee}
            editEmp={d.editEmployee} setEditEmp={d.setEditEmployee}
            editForm={d.employeeEditForm} setEditForm={d.setEmployeeEditForm}
            saveEdit={d.updateEmployee} />
        )}

        {d.page === 'payroll' && (
          <PayrollPage tr={d.tr} payroll={d.payroll} setPayroll={d.setPayroll}
            calc={d.calcPayrollRow} save={d.savePayroll} exportCSV={d.exportPayrollCurrent} />
        )}

        {d.page === 'payrollArchive' && (
          <PayrollArchive tr={d.tr}
            runs={d.payrollRuns.filter(r => d.selectedBranchIds.includes(r.branch_id))}
            items={d.payrollItems} />
        )}

        {d.page === 'categories' && d.isAdmin && (
          <CategoriesPage tr={d.tr} categories={d.categories}
            newCat={d.newCat} setNewCat={d.setNewCat} save={d.saveCategory}
            editCat={d.editCat} cancelEdit={d.cancelEditCategory}
            startEdit={d.startEditCategory} del={d.deleteCategory}
            selectedIds={d.selectedCategoryIds} setSelectedIds={d.setSelectedCategoryIds}
            bulkDelete={d.deleteManyCategories} />
        )}

        {d.page === 'branches' && d.isAdmin && (
          <BranchesPage tr={d.tr} branches={d.allBranches}
            saveBranch={d.saveBranch}
            deleteBranch={d.deleteBranch}
            toggleBranch={d.toggleBranch} />
        )}

        {d.page === 'users' && d.isAdmin && (
          <UsersPage tr={d.tr} users={d.users} branches={d.branches}
            newUser={d.newUser} setNewUser={d.setNewUser}
            save={d.saveUser} edit={d.editUserFn} deactivate={d.deactivateUser} />
        )}

        {d.page === 'chat' && (
          <ChatPage tr={d.tr}
            users={d.users.filter(u => u.id !== d.user.id && u.active !== false)}
            messages={d.messages} me={d.user}
            chatUser={d.chatUser} setChatUser={d.setChatUser}
            chatText={d.chatText} setChatText={d.setChatText}
            send={d.sendMessage} sendMedia={d.sendMediaMessage}
            replyTo={d.replyTo} setReplyTo={d.setReplyTo}
            deleteMessage={d.deleteMessage}
            typingUsers={d.typingUsers} broadcastTyping={d.broadcastTyping}
            markChatRead={d.markChatRead} isOnline={isOnline} />
        )}

        {d.page === 'profile' && (
          <ProfilePage tr={d.tr} profile={d.profile} setProfile={d.setProfile}
            lang={d.lang} setLang={d.setLang} theme={d.theme} setTheme={d.setTheme}
            save={d.saveProfile} uploadAvatar={d.uploadAvatar} changePassword={d.changePassword}
            isAdmin={d.isAdmin} company={d.company}
            saveCompany={d.saveCompanySettings} testTelegram={d.testTelegram}
            deleteCompany={d.deleteTelegramSettings}
            branches={d.branches}
            branchTelegrams={d.branchTelegrams}
            saveBranchTelegram={d.saveBranchTelegram}
            deleteBranchTelegram={d.deleteBranchTelegram}
            testBranchTelegram={d.testBranchTelegram} />
        )}

        </div>{/* end pageContent */}
      </main>

      <MobileBottomNav
        page={d.page}
        changePage={d.changePage}
        can={d.can}
        unreadCount={d.unreadCount} />

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        changePage={p => { d.changePage(p); setCmdOpen(false) }}
        can={d.can}
        tr={d.tr} />
    </div>
  )
}