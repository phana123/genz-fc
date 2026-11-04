import { X } from 'lucide-react';
import { useTranslation } from '../i18n';

export function PageTitle({ eyebrow, title, subtitle, action }) { return <div className="page-title-row"><div><div className="eyebrow">{eyebrow || 'GEN Z FC · CLUB OPERATIONS'}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>; }
export function Panel({ title, subtitle, action, children, className = '' }) { return <section className={`panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>; }
export function EmptyState({ children }) { const { t } = useTranslation(); return <div className="empty-state"><div className="empty-mark">✦</div><b>{children || t('noData')}</b></div>; }
export function Modal({ title, onClose, children, wide = false }) { const { t } = useTranslation(); return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className={`modal ${wide ? 'modal-wide' : ''}`}><div className="modal-head"><div><span className="modal-kicker">GEN Z FC</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label={t('close')}><X size={18}/></button></div>{children}</section></div>; }
export function Field({ label, children, className = '' }) { return <label className={`field ${className}`}><span>{label}</span>{children}</label>; }
export function StatusBadge({ status }) { const { t } = useTranslation(); return <span className={`status-badge status-${status}`}>{t(status) || status}</span>; }
export function Button({ children, kind = 'primary', ...props }) { return <button className={`button button-${kind}`} {...props}>{children}</button>; }
export function ErrorNotice({ error }) { if (!error) return null; const msg = error.response?.data?.message || Object.values(error.response?.data?.errors || {})[0]?.[0] || error.message; return <div className="error-notice">{msg}</div>; }
export function formatDate(value, options = {}) { return value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', ...options }).format(new Date(value)) : '—'; }
export function formatTime(value) { return value ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : '—'; }
