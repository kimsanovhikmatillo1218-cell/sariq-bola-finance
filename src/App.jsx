import useAppData from './hooks/useAppData'
import { isOnline } from './utils'
import ConfirmModal    from './components/ui/ConfirmModal'
import Sidebar         from './components/layout/Sidebar'
import TopBar          from './components/layout/TopBar'
import BranchSelector  from './components/layout/BranchSelector'
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
import './index.css'

export default function App() {
  const d = useAppData()

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
      {d.toast && <div className="toast">{d.toast}</div>}
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
          exportAllData={d.exportAllData} loadAll={d.loadAll} />

        {!['branches','categories','users','profile','chat'].includes(d.page) && (
          <BranchSelector allowedBranches={d.allowedBranches} branch={d.branch} setBranch={d.setBranch} tr={d.tr} />
        )}

        {d.loading && <div className="loaderLine" />}

        {d.page === 'dashboard'      && <Dashboard tr={d.tr} stats={d.stats} />}
        {d.page === 'salesAnalytics' && <SalesAnalytics tr={d.tr} data={d.salesStats} />}

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
            send={d.sendMessage} markChatRead={d.markChatRead} isOnline={isOnline} />
        )}

        {d.page === 'profile' && (
          <ProfilePage tr={d.tr} profile={d.profile} setProfile={d.setProfile}
            lang={d.lang} setLang={d.setLang} theme={d.theme} setTheme={d.setTheme}
            save={d.saveProfile} uploadAvatar={d.uploadAvatar}
            isAdmin={d.isAdmin} company={d.company}
            saveCompany={d.saveCompanySettings} testTelegram={d.testTelegram}
            deleteCompany={d.deleteTelegramSettings}
            branches={d.branches}
            branchTelegrams={d.branchTelegrams}
            saveBranchTelegram={d.saveBranchTelegram}
            deleteBranchTelegram={d.deleteBranchTelegram}
            testBranchTelegram={d.testBranchTelegram} />
        )}
      </main>
    </div>
  )
}