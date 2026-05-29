import _logoSrc from '../assets/logo.jpg'
export const BASE         = import.meta.env.VITE_SUPABASE_URL
export const LOGO         = _logoSrc
export const BRANCH_ORDER = ['PROSPEKT','MAKRO',"QO'QON",'ANDIJON']
export const ACCOUNTS     = ['Naqd','Hisob raqam']
export const OP_TYPE      = { INCOME:'Kirim', EXPENSE:'Chiqim' }
export const CASH_ST      = { PENDING:'PENDING', APPROVED:'APPROVED' }
export const SALARY_T     = { HOURLY:'hourly', MONTHLY:'monthly' }
export const TG_FN        = 'send-telegram'
export const SIGN_IN_RPC  = 'sign_in'
export const HASH_RPC     = 'hash_password'
export const PERIOD_PAGES = ['dashboard','salesAnalytics','orderReports','history','reports','cash','payroll','payrollArchive']

export const MODULES = [
  'dashboard','salesAnalytics',
  'orderReports','order',
  'operation',
  'history','reports',
  'cash',
  'employees','payroll','payrollArchive',
  'categories','branches','users',
  'chat','profile'
]

export const ROLE_LABELS = {
  ADMIN:'Admin', RAHBAR:'Rahbar',
  BOSH_MANAGER:'Bosh menejer', FILIAL_MANAGER:'Filial menejer',
  SMENA_MANAGER:'Smena menejer', BUXGALTER:'Buxgalter'
}

export const ROLE_MODULES = {
  ADMIN:          MODULES,
  RAHBAR:         MODULES,
  BOSH_MANAGER:   ['dashboard','salesAnalytics','orderReports','order','operation','history','reports','cash','employees','payroll','payrollArchive','chat','profile'],
  FILIAL_MANAGER: ['dashboard','orderReports','order','operation','history','cash','employees','payroll','chat','profile'],
  SMENA_MANAGER:  ['dashboard','order','operation','history','cash','chat','profile'],
  BUXGALTER:      ['dashboard','salesAnalytics','history','reports','cash','payroll','payrollArchive','chat','profile'],
  // lowercase aliases (future-proof)
  admin:          MODULES,
  manager:        ['dashboard','salesAnalytics','orderReports','order','operation','history','reports','cash','employees','payroll','payrollArchive','chat','profile'],
  accountant:     ['dashboard','salesAnalytics','history','reports','cash','payroll','payrollArchive','chat','profile'],
  cashier:        ['dashboard','order','operation','history','cash','chat','profile']
}

export const TEXT = {
  uz: {
    /* ── Navigation ── */
    dashboard:'Boshqaruv', salesAnalytics:'Savdo tahlili',
    order:'Order kiritish', orderReports:'Order hisoboti',
    operation:'Kirim / Chiqim kiritish',
    history:'Operatsiyalar tarixi',
    reports:'Hisobotlar', cash:'Inkassatsiya',
    employees:'Xodimlar', payroll:'Maosh', payrollArchive:'Maosh arxivi',
    categories:'Toifalar', branches:'Filiallar', users:'Foydalanuvchilar',
    chat:'Chat', profile:'Profil', settings:'Sozlamalar',
    logout:'Chiqish',

    /* ── Actions ── */
    save:'Saqlash', cancel:'Bekor', delete:"O'chirish",
    edit:'Tahrirlash', add:"Qo'shish", create:'Yaratish',
    search:'Qidirish', filter:'Filtr',
    export:'Eksport', exportExcel:'Excel eksport',
    import:'Import', approve:'Tasdiqlash',
    refresh:'Yangilash', actions:'Amallar',
    send:'Yuborish', yes:"Ha", no:"Yo'q",

    /* ── Common fields ── */
    amount:'Summa', date:'Sana', branch:'Filial',
    category:'Toifa', description:'Izoh', note:'Izoh',
    account:'Hisob', type:'Tur', status:'Holati',
    start:'Boshlanish', end:'Tugash',
    fullName:"To'liq ism", role:'Rol', phone:'Telefon', email:'Email',
    login:'Login', password:'Parol',

    /* ── Finance ── */
    income:'Kirim', expense:'Xarajat', outcome:'Chiqim',
    pending:'Kutilmoqda', approved:'Tasdiqlangan',
    total:'Jami', profit:'Foyda', balance:'Balans',
    totalIncome:'Jami kirim', totalExpense:'Jami chiqim', totalOrders:'Buyurtmalar',
    cashBalance:'Naqd balans', bankBalance:'Bank balans',
    expected:'Kutilgan', accepted:'Qabul qilingan', difference:'Farq',
    expectedAmount:'Kutilgan summa', actualAmount:'Haqiqiy summa',
    all:'Barchasi', allBranches:'Barcha filiallar',
    allTypes:'Barcha turlar', allCategories:'Barcha toifalar',
    allAccounts:'Barcha hisoblar',

    /* ── Order form ── */
    shift:'Smena', uzcard:'Uzcard', humo:'Humo',
    rahmat:'Rahmat', rxmt:'RXMT', uzum:'Uzum',
    yandex:'Yandex', gum:'Jvachka',
    cashAmount:'Naqd summa', cardAmount:'Plastik',
    deliveryAmount:'Yetkazib berish', orderCount:'Buyurtmalar soni',

    /* ── Analytics ── */
    totalSales:'Jami savdo', growth:"O'sish",
    trend:'Kunlik trend', branchSales:"Filiallar bo'yicha",
    incomeChart:'Kirimlar', expenseChart:'Chiqimlar',

    /* ── Employees / Payroll ── */
    position:'Lavozim', salaryType:'Maosh turi', salaryRate:'Stavka',
    hourly:'Soatlik', monthly:'Oylik', workDays:'Ish kunlari',
    hireDate:'Ishga qabul sanasi',
    hourlyRate:'Soatlik narx', monthlySalary:'Oylik maosh',
    hoursWorked:'Ishlagan soat', workedHours:'Ishlagan soat',
    extraHours:"Qo'shimcha soat",
    bonus:'Bonus', deduction:'Ushlab qolish',
    tax:'Soliq', lunch:'Tushlik', penalty:'Jarima', advance:'Avans',
    cashPaid:"Naqd to'lov", cardPaid:"Plastik to'lov",
    netAmount:'Sof maosh', remaining:'Qoldiq',
    period:'Davr', periodStart:'Davr boshi', periodEnd:'Davr oxiri',
    archivePayroll:'Arxivlash', payNow:"To'lash",
    totalEmployees:'Xodimlar soni',

    /* ── Users ── */
    active:'Faol', inactive:'Faol emas', deactivate:'Bloklash',
    access:'Kirish huquqlari', modules:'Modullar',
    sum:"so'm", hr:'soat', days:'kun',
    online:'Online', offline:'Offline',

    /* ── Profile ── */
    uploadAvatar:'Rasm yuklash', uploadPhoto:'📷 Rasm yuklash',
    changePassword:"Parolni o'zgartirish",
    oldPass:'Eski parol', newPass:'Yangi parol',
    companyName:'Kompaniya nomi', address:'Manzil',
    botToken:'Bot token', chatId:'Chat ID',
    testTelegram:'Test yuborish',
    tgConnected:'Telegram ulangan', tgNotConnected:'Telegram ulanmagan',

    /* ── Login ── */
    rememberMe:'Eslab qolish', loginBtn:'Tizimga kirish',
    loading:'Yuklanmoqda...', noData:"Ma'lumot yo'q",
    confirmDelete:"O'chirishni tasdiqlaysizmi?",

    /* ── Notifications ── */
    saveOk:'Saqlandi!', deleteOk:"O'chirildi!",
    err:'Xatolik!', approveOk:'Tasdiqlandi!',

    /* ── Chat ── */
    typeMsg:'Xabar yozing...',
    noMessages:"Xabarlar yo'q", selectUser:'Foydalanuvchini tanlang',

    /* ── Validation messages (used in useAppData) ── */
    welcome:'Xush kelibsiz',
    chooseBranch:'Avval filial tanlang',
    categoryRequired:"Kategoriya va summa kiritilishi shart",
    loginRequired:'Login va parol kiriting',
    loginError:'Login yoki parol xato',
    payrollPeriodRequired:"Davr boshi va oxiri kiritilishi shart",
    payrollStartEndError:"Davr boshi oxiridan katta bo'lmasin",
    payrollNoEmployees:"Xodimlar yo'q — avval filial tanlang",
    adminOnly:'Faqat admin uchun ruxsat bor',
    noSelected:'Avval qatorlarni tanlang',
    employeeNameRequired:"Xodim ismi kiritilishi shart",
    userNameRequired:"Ism va login kiritilishi shart",
    passwordRequired:"Parol kiritilishi shart",
    userLoginBusy:"Bu login allaqachon band",
    categoryNameNeeded:"Kategoriya nomi kiritilishi shart",
    categoryUpdated:'Kategoriya yangilandi',
    categoryAdded:"Kategoriya qo'shildi",
    categoryDeleted:"Kategoriya o'chirildi",
    importNoRows:"Import uchun mos qatorlar topilmadi",
    importOrdersNoRows:"Import uchun mos orderlar topilmadi",
    orderTotalRequired:"Jami summa kiritilishi shart",
    telegramSaved:'Telegram sozlamalari saqlandi',
    telegramTest:'Test xabar yuborilmoqda...',
    telegramOk:'Test xabar muvaffaqiyatli yuborildi ✅',
    telegramErr:'Telegram xatosi: ',
    backupAdminOnly:"Backup faqat admin uchun",
    alreadyApproved:'Allaqachon tasdiqlangan',
  },

  ru: {
    /* ── Navigation ── */
    dashboard:'Панель', salesAnalytics:'Аналитика продаж',
    order:'Ввод заказа', orderReports:'Отчёт заказов',
    operation:'Приход / Расход',
    history:'История операций',
    reports:'Отчёты', cash:'Инкассация',
    employees:'Сотрудники', payroll:'Зарплата', payrollArchive:'Архив зарплат',
    categories:'Категории', branches:'Филиалы', users:'Пользователи',
    chat:'Чат', profile:'Профиль', settings:'Настройки',
    logout:'Выход',

    /* ── Actions ── */
    save:'Сохранить', cancel:'Отмена', delete:'Удалить',
    edit:'Редактировать', add:'Добавить', create:'Создать',
    search:'Поиск', filter:'Фильтр',
    export:'Экспорт', exportExcel:'Экспорт Excel',
    import:'Импорт', approve:'Утвердить',
    refresh:'Обновить', actions:'Действия',
    send:'Отправить', yes:'Да', no:'Нет',

    /* ── Common fields ── */
    amount:'Сумма', date:'Дата', branch:'Филиал',
    category:'Категория', description:'Описание', note:'Комментарий',
    account:'Счёт', type:'Тип', status:'Статус',
    start:'Начало', end:'Конец',
    fullName:'Полное имя', role:'Роль', phone:'Телефон', email:'Email',
    login:'Логин', password:'Пароль',

    /* ── Finance ── */
    income:'Доход', expense:'Расход', outcome:'Расход',
    pending:'Ожидание', approved:'Утверждено',
    total:'Итого', profit:'Прибыль', balance:'Баланс',
    totalIncome:'Общий доход', totalExpense:'Общий расход', totalOrders:'Заказы',
    cashBalance:'Наличный баланс', bankBalance:'Банковский баланс',
    expected:'Ожидаемая', accepted:'Принято', difference:'Разница',
    expectedAmount:'Ожидаемая сумма', actualAmount:'Фактическая сумма',
    all:'Все', allBranches:'Все филиалы',
    allTypes:'Все типы', allCategories:'Все категории',
    allAccounts:'Все счета',

    /* ── Order form ── */
    shift:'Смена', uzcard:'Uzcard', humo:'Humo',
    rahmat:'Rahmat', rxmt:'RXMT', uzum:'Uzum',
    yandex:'Yandex', gum:'Жвачка',
    cashAmount:'Наличные', cardAmount:'Карта',
    deliveryAmount:'Доставка', orderCount:'Кол-во заказов',

    /* ── Analytics ── */
    totalSales:'Общие продажи', growth:'Рост',
    trend:'Ежедневный тренд', branchSales:'По филиалам',
    incomeChart:'Доходы', expenseChart:'Расходы',

    /* ── Employees / Payroll ── */
    position:'Должность', salaryType:'Тип зарплаты', salaryRate:'Ставка',
    hourly:'Почасовая', monthly:'Месячная', workDays:'Рабочие дни',
    hireDate:'Дата приёма',
    hourlyRate:'Почасовая ставка', monthlySalary:'Месячная зарплата',
    hoursWorked:'Отработано часов', workedHours:'Отработано часов',
    extraHours:'Доп. часы',
    bonus:'Бонус', deduction:'Вычет',
    tax:'Налог', lunch:'Обед', penalty:'Штраф', advance:'Аванс',
    cashPaid:'Наличная оплата', cardPaid:'Оплата картой',
    netAmount:'Чистая зарплата', remaining:'Остаток',
    period:'Период', periodStart:'Начало', periodEnd:'Конец',
    archivePayroll:'Архивировать', payNow:'Выплатить',
    totalEmployees:'Сотрудников',

    /* ── Users ── */
    active:'Активный', inactive:'Неактивный', deactivate:'Блокировать',
    access:'Доступ', modules:'Модули',
    sum:'сум', hr:'час', days:'дней',
    online:'Онлайн', offline:'Офлайн',

    /* ── Profile ── */
    uploadAvatar:'Загрузить фото', uploadPhoto:'📷 Загрузить фото',
    changePassword:'Изменить пароль',
    oldPass:'Старый пароль', newPass:'Новый пароль',
    companyName:'Название компании', address:'Адрес',
    botToken:'Bot token', chatId:'Chat ID',
    testTelegram:'Тест',
    tgConnected:'Telegram подключён', tgNotConnected:'Telegram не подключён',

    /* ── Login ── */
    rememberMe:'Запомнить', loginBtn:'Войти',
    loading:'Загрузка...', noData:'Нет данных',
    confirmDelete:'Подтвердить удаление?',

    /* ── Notifications ── */
    saveOk:'Сохранено!', deleteOk:'Удалено!',
    err:'Ошибка!', approveOk:'Утверждено!',

    /* ── Chat ── */
    typeMsg:'Написать...',
    noMessages:'Нет сообщений', selectUser:'Выберите пользователя',

    /* ── Validation messages ── */
    welcome:'Добро пожаловать',
    chooseBranch:'Сначала выберите филиал',
    categoryRequired:'Необходимо указать категорию и сумму',
    loginRequired:'Введите логин и пароль',
    loginError:'Неверный логин или пароль',
    payrollPeriodRequired:'Укажите начало и конец периода',
    payrollStartEndError:'Начало не должно быть позже конца',
    payrollNoEmployees:'Нет сотрудников — выберите филиал',
    adminOnly:'Доступно только администратору',
    noSelected:'Сначала выберите записи',
    employeeNameRequired:'Введите имя сотрудника',
    userNameRequired:'Введите имя и логин',
    passwordRequired:'Введите пароль',
    userLoginBusy:'Этот логин уже занят',
    categoryNameNeeded:'Введите название категории',
    categoryUpdated:'Категория обновлена',
    categoryAdded:'Категория добавлена',
    categoryDeleted:'Категория удалена',
    importNoRows:'Подходящие строки для импорта не найдены',
    importOrdersNoRows:'Подходящие заказы для импорта не найдены',
    orderTotalRequired:'Необходимо указать общую сумму',
    telegramSaved:'Настройки Telegram сохранены',
    telegramTest:'Отправка тестового сообщения...',
    telegramOk:'Тестовое сообщение успешно отправлено ✅',
    telegramErr:'Ошибка Telegram: ',
    backupAdminOnly:'Резервная копия только для администратора',
    alreadyApproved:'Уже утверждено',
  },

  cy: {
    /* ── Navigation ── */
    dashboard:'Бошқарув', salesAnalytics:'Савдо таҳлили',
    order:'Ордер киритиш', orderReports:'Ордер ҳисоботи',
    operation:'Кирим / Чиқим киритиш',
    history:'Операциялар тарихи',
    reports:'Ҳисоботлар', cash:'Инкассация',
    employees:'Ходимлар', payroll:'Маош', payrollArchive:'Маош архиви',
    categories:'Тоифалар', branches:'Филиаллар', users:'Фойдаланувчилар',
    chat:'Чат', profile:'Профил', settings:'Созламалар',
    logout:'Чиқиш',

    /* ── Actions ── */
    save:'Сақлаш', cancel:'Бекор', delete:'Ўчириш',
    edit:'Таҳрирлаш', add:'Қўшиш', create:'Яратиш',
    search:'Қидириш', filter:'Филтр',
    export:'Экспорт', exportExcel:'Excel экспорт',
    import:'Импорт', approve:'Тасдиқлаш',
    refresh:'Янгилаш', actions:'Амаллар',
    send:'Юбориш', yes:'Ҳа', no:'Йўқ',

    /* ── Common fields ── */
    amount:'Сумма', date:'Сана', branch:'Филиал',
    category:'Тоифа', description:'Изоҳ', note:'Изоҳ',
    account:'Ҳисоб', type:'Тур', status:'Ҳолати',
    start:'Бошланиш', end:'Тугаш',
    fullName:'Тўлиқ исм', role:'Рол', phone:'Телефон', email:'Email',
    login:'Логин', password:'Парол',

    /* ── Finance ── */
    income:'Кирим', expense:'Харажат', outcome:'Чиқим',
    pending:'Кутилмоқда', approved:'Тасдиқланган',
    total:'Жами', profit:'Фойда', balance:'Баланс',
    totalIncome:'Жами кирим', totalExpense:'Жами чиқим', totalOrders:'Буюртмалар',
    cashBalance:'Нақд баланс', bankBalance:'Банк баланс',
    expected:'Кутилган', accepted:'Қабул қилинган', difference:'Фарқ',
    expectedAmount:'Кутилган сумма', actualAmount:'Ҳақиқий сумма',
    all:'Барчаси', allBranches:'Барча филиаллар',
    allTypes:'Барча турлар', allCategories:'Барча тоифалар',
    allAccounts:'Барча ҳисоблар',

    /* ── Order form ── */
    shift:'Смена', uzcard:'Uzcard', humo:'Humo',
    rahmat:'Rahmat', rxmt:'RXMT', uzum:'Uzum',
    yandex:'Yandex', gum:'Жвачка',
    cashAmount:'Нақд сумма', cardAmount:'Пластик',
    deliveryAmount:'Етказиб бериш', orderCount:'Буюртмалар сони',

    /* ── Analytics ── */
    totalSales:'Жами савдо', growth:'Ўсиш',
    trend:'Кунлик тренд', branchSales:'Филиаллар бўйича',
    incomeChart:'Киримлар', expenseChart:'Чиқимлар',

    /* ── Employees / Payroll ── */
    position:'Лавозим', salaryType:'Маош тури', salaryRate:'Ставка',
    hourly:'Соатлик', monthly:'Ойлик', workDays:'Иш кунлари',
    hireDate:'Ишга қабул санаси',
    hourlyRate:'Соатлик нарх', monthlySalary:'Ойлик маош',
    hoursWorked:'Ишлаган соат', workedHours:'Ишлаган соат',
    extraHours:'Қўшимча соат',
    bonus:'Бонус', deduction:'Ушлаб қолиш',
    tax:'Солиқ', lunch:'Тушлик', penalty:'Жарима', advance:'Аванс',
    cashPaid:'Нақд тўлов', cardPaid:'Пластик тўлов',
    netAmount:'Соф маош', remaining:'Қолдиқ',
    period:'Давр', periodStart:'Давр боши', periodEnd:'Давр охири',
    archivePayroll:'Архивлаш', payNow:'Тўлаш',
    totalEmployees:'Ходимлар сони',

    /* ── Users ── */
    active:'Фаол', inactive:'Фаол эмас', deactivate:'Блоклаш',
    access:'Кириш ҳуқуқлари', modules:'Модуллар',
    sum:'сўм', hr:'соат', days:'кун',
    online:'Онлайн', offline:'Офлайн',

    /* ── Profile ── */
    uploadAvatar:'Расм юклаш', uploadPhoto:'📷 Расм юклаш',
    changePassword:'Паролни ўзгартириш',
    oldPass:'Эски парол', newPass:'Янги парол',
    companyName:'Компания номи', address:'Манзил',
    botToken:'Bot token', chatId:'Chat ID',
    testTelegram:'Тест юбориш',
    tgConnected:'Telegram уланган', tgNotConnected:'Telegram уланмаган',

    /* ── Login ── */
    rememberMe:'Эслаб қолиш', loginBtn:'Тизимга кириш',
    loading:'Юкланмоқда...', noData:'Маълумот йўқ',
    confirmDelete:'Ўчиришни тасдиқлайсизми?',

    /* ── Notifications ── */
    saveOk:'Сақланди!', deleteOk:'Ўчирилди!',
    err:'Хатолик!', approveOk:'Тасдиқланди!',

    /* ── Chat ── */
    typeMsg:'Хабар ёзинг...',
    noMessages:'Хабарлар йўқ', selectUser:'Фойдаланувчини танланг',

    /* ── Validation messages ── */
    welcome:'Хуш келибсиз',
    chooseBranch:'Аввал филиал танланг',
    categoryRequired:'Тоифа ва сумма киритилиши шарт',
    loginRequired:'Логин ва парол киритинг',
    loginError:'Логин ёки парол хато',
    payrollPeriodRequired:'Давр боши ва охири киритилиши шарт',
    payrollStartEndError:'Давр боши охиридан катта бўлмасин',
    payrollNoEmployees:'Ходимлар йўқ — аввал филиал танланг',
    adminOnly:'Фақат админ учун рухсат бор',
    noSelected:'Аввал қаторларни танланг',
    employeeNameRequired:'Ходим исми киритилиши шарт',
    userNameRequired:'Исм ва логин киритилиши шарт',
    passwordRequired:'Парол киритилиши шарт',
    userLoginBusy:'Бу логин аллақачон банд',
    categoryNameNeeded:'Тоифа номи киритилиши шарт',
    categoryUpdated:'Тоифа янгиланди',
    categoryAdded:'Тоифа қўшилди',
    categoryDeleted:'Тоифа ўчирилди',
    importNoRows:'Импорт учун мос қаторлар топилмади',
    importOrdersNoRows:'Импорт учун мос ордерлар топилмади',
    orderTotalRequired:'Жами сумма киритилиши шарт',
    telegramSaved:'Telegram созламалари сақланди',
    telegramTest:'Тест хабар юборилмоқда...',
    telegramOk:'Тест хабар муваффақиятли юборилди ✅',
    telegramErr:'Telegram хатоси: ',
    backupAdminOnly:'Backup фақат админ учун',
    alreadyApproved:'Аллақачон тасдиқланган',
  }
}
