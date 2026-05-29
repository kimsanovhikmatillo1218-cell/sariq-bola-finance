/* ─── Premium SVG Icon Set — 24×24 viewBox, stroke-based ─── */
const S = ({ children, size = 18, className = '', style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
    stroke="currentColor" strokeWidth={1.85} strokeLinecap="round" strokeLinejoin="round"
    className={className} style={{ flexShrink: 0, display:'block', ...style }} aria-hidden="true">
    {children}
  </svg>
)

/* ════════════════════════════════════════════════════════
   THEME
════════════════════════════════════════════════════════ */
export const IconSun = ({ size = 18 }) => (
  <S size={size}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </S>
)
export const IconMoon = ({ size = 18 }) => (
  <S size={size}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </S>
)

/* ════════════════════════════════════════════════════════
   NAVIGATION — each one distinct and expressive
════════════════════════════════════════════════════════ */

/* Dashboard — house with detail */
export const IconHome = ({ size = 18 }) => (
  <S size={size}>
    <path d="M3 12L12 4l9 8" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />
  </S>
)

/* Sales analytics — rising bar chart */
export const IconBarChart = ({ size = 18 }) => (
  <S size={size}>
    <rect x="3"  y="12" width="4" height="9"  rx="1" />
    <rect x="10" y="7"  width="4" height="14" rx="1" />
    <rect x="17" y="3"  width="4" height="18" rx="1" />
  </S>
)

/* Order reports — clipboard with tick */
export const IconClipboard = ({ size = 18 }) => (
  <S size={size}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
    <polyline points="9 12 11 14 15 10" />
  </S>
)

/* Orders — shopping bag */
export const IconShoppingBag = ({ size = 18 }) => (
  <S size={size}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </S>
)

/* Operations — two arrows (income/expense) */
export const IconArrowUpDown = ({ size = 18 }) => (
  <S size={size}>
    <path d="M8 3l-5 5 5 5" />
    <path d="M3 8h13a5 5 0 0 1 0 10H9" />
    <path d="M16 14l5 5-5 5" />
  </S>
)

/* History — clock with arrow */
export const IconHistory = ({ size = 18 }) => (
  <S size={size}>
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <polyline points="12 7 12 12 15 14" />
  </S>
)

/* Reports — document with lines */
export const IconFileText = ({ size = 18 }) => (
  <S size={size}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </S>
)

/* Cash — banknote */
export const IconCash = ({ size = 18 }) => (
  <S size={size}>
    <rect x="2" y="6" width="20" height="12" rx="2.5" />
    <circle cx="12" cy="12" r="2.8" />
    <path d="M6 12h.01M18 12h.01" strokeWidth={2.5} />
  </S>
)

/* Wallet */
export const IconWallet = ({ size = 18 }) => (
  <S size={size}>
    <path d="M20 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
    <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
    <circle cx="17" cy="13" r="1.5" fill="currentColor" stroke="none" />
  </S>
)

/* Employees */
export const IconUsers = ({ size = 18 }) => (
  <S size={size}>
    <path d="M16 11c1.66 0 2.99 1.34 2.99 3S17.66 17 16 17" />
    <path d="M18 20c0-1.86-1.56-3.37-3.5-3.37" strokeDasharray="0" />
    <path d="M1 20v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 20v-1a5 5 0 0 0-3-4.59" />
  </S>
)

/* Payroll — coin/dollar */
export const IconDollarSign = ({ size = 18 }) => (
  <S size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6v12" />
    <path d="M15 9.5a3 3 0 0 0-3-1.5 3 3 0 0 0 0 6 3 3 0 0 1 0 6 3 3 0 0 1-3-1.5" />
  </S>
)

/* Payroll archive — box/archive */
export const IconArchive = ({ size = 18 }) => (
  <S size={size}>
    <path d="M21 8v13H3V8" />
    <path d="M23 3H1v5h22V3z" />
    <path d="M10 12h4" />
  </S>
)

/* Categories — tag/label */
export const IconTag = ({ size = 18 }) => (
  <S size={size}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
  </S>
)

/* Branches — hierarchy / network */
export const IconBranch = ({ size = 18 }) => (
  <S size={size}>
    <rect x="8" y="2" width="8" height="5" rx="1.5" />
    <rect x="1" y="16" width="7" height="5" rx="1.5" />
    <rect x="16" y="16" width="7" height="5" rx="1.5" />
    <path d="M12 7v4M12 11H4.5v4M12 11h7.5v4" />
  </S>
)

/* Users admin — person + gear */
export const IconUserCog = ({ size = 18 }) => (
  <S size={size}>
    <circle cx="9" cy="6" r="4" />
    <path d="M1 20v-1a8 8 0 0 1 12-6.93" />
    <circle cx="19" cy="17" r="2" />
    <path d="M19 13v1m0 6v1m-3-3h1m5 0h1M17 15l.7.7m2.6 2.6.7.7M17 19l.7-.7m2.6-2.6.7-.7" strokeWidth={1.6} />
  </S>
)

/* Chat — message bubbles */
export const IconChat = ({ size = 18 }) => (
  <S size={size}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth={2.4} />
  </S>
)

/* Profile/Settings — sliders */
export const IconSettings = ({ size = 18 }) => (
  <S size={size}>
    <line x1="4"  y1="6"  x2="20" y2="6"  />
    <line x1="4"  y1="12" x2="20" y2="12" />
    <line x1="4"  y1="18" x2="20" y2="18" />
    <circle cx="8"  cy="6"  r="2.2" fill="var(--card, #fff)" />
    <circle cx="16" cy="12" r="2.2" fill="var(--card, #fff)" />
    <circle cx="10" cy="18" r="2.2" fill="var(--card, #fff)" />
  </S>
)

/* ════════════════════════════════════════════════════════
   ACTIONS
════════════════════════════════════════════════════════ */
export const IconBell = ({ size = 18 }) => (
  <S size={size}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </S>
)
export const IconSave = ({ size = 18 }) => (
  <S size={size}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </S>
)
export const IconRefresh = ({ size = 18 }) => (
  <S size={size}>
    <path d="M23 4v6h-6" />
    <path d="M20.49 15a9 9 0 1 1-.18-6.5" />
  </S>
)
export const IconDownload = ({ size = 18 }) => (
  <S size={size}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </S>
)
export const IconSend = ({ size = 18 }) => (
  <S size={size}>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22l-4-9-9-4 20-7z" />
  </S>
)
export const IconCamera = ({ size = 18 }) => (
  <S size={size}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
    <circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none" />
  </S>
)
export const IconEdit = ({ size = 18 }) => (
  <S size={size}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </S>
)
export const IconTrash = ({ size = 18 }) => (
  <S size={size}>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </S>
)
export const IconCheck = ({ size = 18 }) => (
  <S size={size}><polyline points="20 6 9 17 4 12" /></S>
)
export const IconX = ({ size = 18 }) => (
  <S size={size}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6"  y1="6" x2="18" y2="18" />
  </S>
)
export const IconPlus = ({ size = 18 }) => (
  <S size={size}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5"  y1="12" x2="19" y2="12" />
  </S>
)
export const IconChevronDown = ({ size = 18 }) => (
  <S size={size}><polyline points="6 9 12 15 18 9" /></S>
)
export const IconFilter = ({ size = 18 }) => (
  <S size={size}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </S>
)
export const IconUpload = ({ size = 18 }) => (
  <S size={size}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </S>
)
export const IconPrint = ({ size = 18 }) => (
  <S size={size}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </S>
)
export const IconSearch = ({ size = 18 }) => (
  <S size={size}>
    <circle cx="10.5" cy="10.5" r="7.5" />
    <line x1="21" y1="21" x2="15.8" y2="15.8" />
  </S>
)

/* ════════════════════════════════════════════════════════
   AUTH / PROFILE
════════════════════════════════════════════════════════ */
export const IconUser = ({ size = 18 }) => (
  <S size={size}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </S>
)
export const IconLock = ({ size = 18 }) => (
  <S size={size}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16.5" r="1.4" fill="currentColor" stroke="none" />
  </S>
)
export const IconEye = ({ size = 18 }) => (
  <S size={size}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </S>
)
export const IconEyeOff = ({ size = 18 }) => (
  <S size={size}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </S>
)
export const IconKey = ({ size = 18 }) => (
  <S size={size}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="M21 2l-9.6 9.6" />
    <path d="M15.5 7.5l2 2.5 3-1.5" />
  </S>
)

/* ════════════════════════════════════════════════════════
   MISC / SYSTEM
════════════════════════════════════════════════════════ */
export const IconDatabase = ({ size = 18 }) => (
  <S size={size}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </S>
)
export const IconBuilding = ({ size = 18 }) => (
  <S size={size}>
    <path d="M3 21h18" />
    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    <path d="M9 9h1.5M9 13h1.5M13 9h1.5M13 13h1.5" strokeWidth={2} strokeLinecap="round" />
    <path d="M9 17h6v4H9z" />
  </S>
)
export const IconRobot = ({ size = 18 }) => (
  <S size={size}>
    <rect x="3" y="10" width="18" height="12" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <line x1="12" y1="3" x2="12" y2="7" />
    <circle cx="9"  cy="16" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="16" r="1.2" fill="currentColor" stroke="none" />
    <path d="M9.5 19.5h5" strokeWidth={2} />
    <path d="M1 13h2M21 13h2" />
  </S>
)
export const IconLink = ({ size = 18 }) => (
  <S size={size}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </S>
)
export const IconMessageCircle = ({ size = 18 }) => (
  <S size={size}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </S>
)

/* Trend up — for positive stats */
export const IconTrendUp = ({ size = 18 }) => (
  <S size={size}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </S>
)

/* Percent — for margins */
export const IconPercent = ({ size = 18 }) => (
  <S size={size}>
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </S>
)

/* Calendar */
export const IconCalendar = ({ size = 18 }) => (
  <S size={size}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </S>
)

/* Info circle */
export const IconInfo = ({ size = 18 }) => (
  <S size={size}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8"  x2="12" y2="8.1"  strokeWidth={2.4} />
    <line x1="12" y1="12" x2="12" y2="16" />
  </S>
)

/* Alert triangle */
export const IconAlert = ({ size = 18 }) => (
  <S size={size}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9"  x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.4} />
  </S>
)

/* Package/product */
export const IconPackage = ({ size = 18 }) => (
  <S size={size}>
    <path d="M12 2l10 5.5v9L12 22 2 16.5v-9L12 2z" />
    <polyline points="2 7 12 12 22 7" />
    <line x1="12" y1="12" x2="12" y2="22" />
    <polyline points="7 4.5 12 7 17 4.5" />
  </S>
)

/* Chart line / trend */
export const IconLineChart = ({ size = 18 }) => (
  <S size={size}>
    <polyline points="22 12 18 12 15 20 9 4 6 12 2 12" />
  </S>
)

/* Spinner — for button loading states */
export const IconSpinner = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
    style={{ animation:'spinnerRotate .7s linear infinite', flexShrink:0 }}
    aria-hidden="true">
    <path d="M12 2a10 10 0 0 1 10 10" opacity=".25" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
)

/* Wifi off — offline indicator */
export const IconWifiOff = ({ size = 18 }) => (
  <S size={size}>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    <path d="M1.42 9a16 16 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1.5" fill="currentColor" stroke="none" />
  </S>
)

/* Reply arrow */
export const IconReply = ({ size = 18 }) => (
  <S size={size}>
    <path d="M9 17l-5-5 5-5" />
    <path d="M4 12h11a4 4 0 0 1 4 4v1" />
  </S>
)
