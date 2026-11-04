import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '../i18n';
import api from '../services/api';
import { EmptyState, ErrorNotice, PageTitle, Panel, StatusBadge } from '../components/UI';
import './ReportsPage.css';

// One color per attendance status (used by the stat dots, the bars and the legend)
const STATUS_KEYS = ['present', 'late', 'absent', 'excused'];
const STATUS_COLORS = {
  present: '#34d399',
  late: '#f59e0b',
  absent: '#f43f5e',
  excused: '#7c3aed',
};

export default function ReportsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    api.get('/reports/attendance', { params: { month } })
      .then(r => setData(r.data))
      .catch(setError);
  }, [month]);

  const chart = data
    ? Object.entries(data.summary).map(([key, value]) => ({ key, name: t(key), value }))
    : [];
  const maxValue = Math.max(1, ...chart.map(row => row.value));

  return (
    <div className="page-stack rp">
      <PageTitle
        title={t('reports')}
        subtitle={t('reportsSub')}
        action={
          <label className="date-chip month-picker">
            {t('month')}
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
          </label>
        }
      />
      {error && <ErrorNotice error={error} />}

      <div className="report-stats">
        {STATUS_KEYS.map(key => (
          <div className="report-stat" key={key}>
            <span className="report-mark" style={{ background: STATUS_COLORS[key] }} />
            <span>{t(key)}</span>
            <b>{data?.summary?.[key] ?? '—'}</b>
            <small>{t('totalSessions')}: {data?.sessions ?? 0}</small>
          </div>
        ))}
      </div>

      <div className="dashboard-grid report-grid">
        <Panel
          title={t('monthlyReport')}
          subtitle={`${month} · ${data?.sessions || 0} training sessions`}
          action={<span className="chart-period">MONTHLY <TrendingUp size={14} /></span>}
        >
          <div className="report-chart">
            {chart.map(entry => (
              <div key={entry.key} className="report-bar-row">
                <span>{entry.name}</span>
                <div className="report-bar-track">
                  <i style={{
                    width: `${Math.max(2, (entry.value / maxValue) * 100)}%`,
                    background: STATUS_COLORS[entry.key] || '#c026d3',
                  }} />
                </div>
                <b>{entry.value}</b>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={t('rankings')} subtitle="Ranked by attended sessions">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t('rank')}</th><th>{t('player')}</th><th>{t('position')}</th>
                  <th>{t('present')}</th><th>{t('late')}</th><th>{t('attendanceRate')}</th>
                </tr>
              </thead>
              <tbody>
                {data?.rankings?.map((row, index) => (
                  <tr key={row.player.id}>
                    <td><span className={`rank-number rank-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span></td>
                    <td>
                      <div className="table-user">
                        <span className={`player-avatar player-avatar-${index % 5}`}>{row.player.name?.[0]}</span>
                        <b>{row.player.name}</b>
                      </div>
                    </td>
                    <td>{row.player.player_profile?.position || '—'}</td>
                    <td><b>{row.attended}</b></td>
                    <td>{row.late}</td>
                    <td>
                      <div className="rate-cell">
                        <div className="rate-bar"><i style={{ width: `${row.rate}%` }} /></div>
                        <b>{row.rate}%</b>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.rankings?.length && <EmptyState>{t('noData')}</EmptyState>}
          </div>
        </Panel>
      </div>

      <Panel title={t('attendance')} subtitle={`${t('month')} ${month}`}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t('player')}</th><th>{t('session')}</th><th>{t('date')}</th>
                <th>{t('status')}</th><th>{t('checkinTime')}</th>
              </tr>
            </thead>
            <tbody>
              {data?.records?.map(record => (
                <tr key={record.id}>
                  <td>{record.player?.name}</td>
                  <td>{record.session?.title}</td>
                  <td>{new Date(record.session?.starts_at).toLocaleDateString()}</td>
                  <td><StatusBadge status={record.status} /></td>
                  <td>
                    {record.checked_in_at
                      ? new Date(record.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.records?.length && <EmptyState>{t('noData')}</EmptyState>}
        </div>
      </Panel>
    </div>
  );
}