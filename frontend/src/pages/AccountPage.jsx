import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';

export default function AccountPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <div className="page-content-inner">
      <div className="page-title-row">
        <div>
          <h1>{t('accountSettings') || 'Account'}</h1>
          <p>{t('accountsSub') || 'Manage your account settings.'}</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-heading">
          <h2>{t('editProfile') || 'Profile'}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
          <img
            src={user?.avatar ? `/storage/${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0d6efd&color=fff&size=80`}
            alt="Profile"
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <b style={{ fontSize: 16 }}>{user?.name}</b>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{user?.email}</div>
            <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>{user?.role}</div>
          </div>
        </div>
        <p style={{ padding: '0 16px 16px', color: 'var(--muted)', fontSize: 11 }}>
          {t('editProfileHint') || 'Use the profile button in the sidebar to edit your profile, avatar, and password.'}
        </p>
      </div>
    </div>
  );
}
