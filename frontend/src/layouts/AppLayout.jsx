import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from '../routing';
import { Activity, Bell, BookOpen, Calendar, CalendarDays, ChartNoAxesCombined, ChevronDown, ClipboardCheck, ClipboardList, Clock, Command, FileText, FolderOpen, LogOut, Menu, Moon, PenTool, PlayCircle, Settings, ShieldAlert, Sun, UserRound, Users, UsersRound, Video, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import i18n from '../i18n';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/UI';
import clubLogo from '../img/logo.jpg';

const iconMap = { dashboard: Command, editor: PenTool, plans: FileText, library: FolderOpen, squad: UsersRound, players: Users, matchday: Calendar, microcycle: Clock, gamemodel: BookOpen, animations: PlayCircle, video: Video, training: CalendarDays, attendance: ClipboardCheck, reports: ChartNoAxesCombined, discipline: ShieldAlert, announcements: Bell, users: ClipboardList, activity: Activity, account: Settings };
const navFor = (role) => {
  const safeRole = ['admin', 'coach', 'captain', 'player'].includes(role) ? role : 'player';
  if (role === 'admin') {
    return [
      ['dashboard', `/${safeRole}/dashboard`],
      ['editor', '/editor'],
      ['plans', '/plans'],
      ['library', '/library'],
      ['squad', '/squads'],
      ['matchday', '/matchday'],
      ['microcycle', '/microcycle'],
      ['gamemodel', '/gamemodel'],
      ['animations', '/animations'],
      ['video', '/video'],
      ['players', '/players'],
      ['training', '/training'],
      ['attendance', '/attendance'],
      ['reports', '/reports'],
      ['discipline', '/discipline'],
      ['announcements', '/announcements'],
      ['users', '/users'],
      ['activity', '/activity'],
      ['account', '/account'],
    ];
  }
  if (role === 'coach') {
    return [
      ['dashboard', `/${safeRole}/dashboard`],
      ['players', '/players'],
      ['squad', '/squads'],
      ['training', '/training'],
      ['attendance', '/attendance'],
      ['reports', '/reports'],
      ['discipline', '/discipline'],
      ['announcements', '/announcements'],
    ];
  }
  if (role === 'captain') {
    return [
      ['dashboard', `/${safeRole}/dashboard`],
      ['squad', '/squads'],
      ['training', '/training'],
      ['attendance', '/attendance'],
      ['reports', '/reports'],
      ['announcements', '/announcements'],
    ];
  }
  return [
    ['dashboard', `/${safeRole}/dashboard`],
    ['training', '/training'],
    ['attendance', '/attendance'],
    ['announcements', '/announcements'],
  ];
};
const roleKey = { admin: 'roleAdmin', coach: 'roleCoach', captain: 'roleCaptain', player: 'rolePlayer' };

function ProfileEditor({ user, onSave, onClose }) {
  const { t } = useTranslation();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const profile = new FormData();
    profile.append('name', name);
    profile.append('email', email);
    if (avatar) {
      profile.append('avatar', avatar);
    }
    if (password) {
      profile.append('current_password', currentPassword);
      profile.append('password', password);
      profile.append('password_confirmation', passwordConfirmation);
    }
    try { await onSave(profile); onClose(); }
    catch (requestError) { setError(requestError.response?.data?.message || Object.values(requestError.response?.data?.errors || {})[0]?.[0] || t('error')); }
    finally { setBusy(false); }
  }

  return <Modal title={t('editProfile')} onClose={onClose} wide>
    <form className="profile-form" onSubmit={submit} encType="multipart/form-data">
      <div className="profile-avatar-section">
        <img className="profile-avatar-preview" src={avatarPreview || (user?.avatar ? `/storage/${user.avatar}` : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0d6efd&color=fff&size=128`} alt="Profile avatar"/>
        <label className="avatar-upload-label">
          <input type="file" accept="image/*" onChange={handleAvatarChange} hidden/>
          <UserRound size={16}/>{t('uploadAvatar') || 'Upload avatar'}
        </label>
      </div>
      <label className="field"><span>{t('name')}</span><input autoComplete="name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)}/></label>
      <label className="field"><span>{t('email')}</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)}/></label>
      <div className="profile-password-heading">{t('changePassword')}</div>
      <label className="field"><span>{t('currentPassword')}</span><input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)}/></label>
      <label className="field"><span>{t('newPassword')}</span><input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)}/></label>
      <label className="field"><span>{t('confirmPassword')}</span><input type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)}/></label>
      {error && <div className="error-notice">{error}</div>}
      <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>{t('cancel')}</button><button className="button button-primary" disabled={busy}>{busy ? t('saving') : t('save')}</button></div>
    </form>
  </Modal>;
}

export default function AppLayout() {
  const { t } = useTranslation(); const { user, logout, updateProfile } = useAuth(); const location = useLocation(); const [mobileOpen, setMobileOpen] = useState(false); const [profileOpen, setProfileOpen] = useState(false); const [theme, setTheme] = useState(() => localStorage.getItem('genz-theme') || 'dark');
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('genz-theme', theme); return () => { delete document.documentElement.dataset.theme; }; }, [theme]);
  const title = navFor(user?.role).find(([, path]) => path === location.pathname)?.[0] || 'dashboard';
  const toggleLanguage = () => { const next = i18n.language === 'en' ? 'km' : 'en'; i18n.changeLanguage(next); localStorage.setItem('genz-language', next); };
  return <div className="app-shell">
    {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''} role-${user?.role}`}>
      <div className="brand"><img className="brand-emblem" src={clubLogo} alt="GEN Z FC logo"/><div><b>{t('club')}</b><small>{t('subtitle')}</small></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
      <div className="club-switch"><img className="club-mini" src={clubLogo} alt=""/><div><b>GEN Z FC</b><small>Phnom Penh · Cambodia</small></div><ChevronDown size={15}/></div>
      <div className="nav-label">MAIN MENU</div>
      <nav className="side-nav">{navFor(user?.role).map(([key, path]) => { const Icon = iconMap[key]; return <NavLink key={key} to={path} end={path === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Icon size={18}/><span>{t(key)}</span>{key === 'announcements' && <i className="nav-dot"/>}</NavLink>; })}</nav>
      <div className="sidebar-bottom"><div className="season-card"><div className="season-top"><span className="season-ball">✦</span><span>SEASON 2025/26</span><span className="season-live">LIVE</span></div><div className="season-progress"><span/></div><small>Building a stronger team, every day.</small></div><div className="account-controls"><button className="profile-button" onClick={() => setProfileOpen(true)} title={t('editProfile')}><img className="avatar avatar-round" src={user?.avatar ? `/storage/${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0d6efd&color=fff&size=40`} alt="Profile"/><div className="profile-meta"><b>{user?.name}</b><small>{t(roleKey[user?.role] || 'rolePlayer')}</small></div><UserRound size={16}/></button><button className="account-logout" onClick={() => logout()} title={t('signOut')} aria-label={t('signOut')}><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="menu-toggle" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><span className="breadcrumb">GEN Z FC <span>/</span> <b>{t(title)}</b></span></div><div className="top-actions"><label className="top-search"><span>⌕</span><input placeholder={t('search')}/><kbd>⌘ K</kbd></label><button className="icon-button language-button" onClick={toggleLanguage} aria-label={t('language')}><span className="language-globe">◎</span>{i18n.language === 'en' ? 'EN' : 'ខ្មែរ'}</button><button className="icon-button theme-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={theme === 'dark' ? t('lightMode') : t('darkMode')} aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button><button className="icon-button notification-button" title={t('announcements')} onClick={() => { window.location.href = '/announcements'; }}><Bell size={17}/><i/></button><div className="top-avatar" onClick={() => setProfileOpen(true)} style={{ cursor: 'pointer' }} title={t('editProfile')}><img src={user?.avatar ? `/storage/${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0d6efd&color=fff&size=40`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}/></div></div></header>
      <div className="page-content"><Outlet /></div>
    </main>
    {profileOpen && <ProfileEditor user={user} onSave={updateProfile} onClose={() => setProfileOpen(false)}/>}
  </div>;
}
