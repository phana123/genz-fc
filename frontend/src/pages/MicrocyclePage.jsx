import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { PageTitle } from '../components/UI';
import './MicrocyclePage.css';

// Intensity colors in one place (traffic-light meaning, softened for the light theme)
const INTENSITY_COLORS = {
  high: '#f43f5e',
  medium: '#f59e0b',
  low: '#34d399',
  rest: '#c9b8d6',
};

const T = {
  en: {
    microcycle: 'Microcycle', microcycleSub: 'Weekly training load & planning',
    loadManagement: 'Load Management', loadChart: 'Training Load Chart',
    md4: 'MD-4', md3: 'MD-3', md2: 'MD-2', md1: 'MD-1', md: 'Matchday', mdPlus1: 'MD+1', mdPlus2: 'MD+2',
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
    high: 'High', medium: 'Medium', low: 'Low', rest: 'Rest',
    intensity: 'Intensity', focus: 'Session Focus', pitch: 'Pitch', duration: 'Duration', notes: 'Notes',
    recovery: 'Recovery & Strength', tactical: 'Tactical Block & Endurance', speed: 'Speed & Sharpness',
    matchEve: 'Match Eve / Set-Pieces', matchday: 'Matchday', recoveryDay: 'Recovery Day', offDay: 'Off Day',
    pitchA: 'Pitch A', pitchB: 'Pitch B', gym: 'Gym',
    addPlan: 'Add Microcycle Plan', save: 'Save', saved: 'Saved', cancel: 'Cancel', reset: 'Reset',
    exportPdf: 'Export PDF', exportExcel: 'Export Excel', publish: 'Publish to Team', published: 'Published to players',
    coachControls: 'Coach Controls', noData: 'No microcycle data',
  },
  km: {
    microcycle: 'វដ្ដហ្វឹកហាត់', microcycleSub: 'ផ្ទុកការហ្វឹកហាត់ប្រចាំសប្តាហ៍',
    loadManagement: 'គ្រប់គ្រងផ្ទុក', loadChart: 'ក្រាហ្វិកផ្ទុកការហ្វឹកហាត់',
    md4: 'MD-4', md3: 'MD-3', md2: 'MD-2', md1: 'MD-1', md: 'ថ្ងៃប្រកួត', mdPlus1: 'MD+1', mdPlus2: 'MD+2',
    mon: 'ចន្ទ', tue: 'អង្គារ', wed: 'ពុធ', thu: 'ព្រហស្បតិ៍', fri: 'សុក្រ', sat: 'សៅរ៍', sun: 'អាទិត្យ',
    high: 'ខ្ពស់', medium: 'មធ្យម', low: 'ទាប', rest: 'សម្រាក',
    intensity: 'កម្រិត', focus: 'ផ្តោត', pitch: 'ទីលាន', duration: 'រយៈពេល', notes: 'កំណត់ត្រា',
    recovery: 'ស្ដារ និងកម្លាំង', tactical: 'យុទ្ធសាស្ត្រ និងស៊ូ', speed: 'ល្បឿន និងឆាប់រហ័ស',
    matchEve: 'មុនប្រកួត / បាល់ស្លាប់', matchday: 'ថ្ងៃប្រកួត', recoveryDay: 'ថ្ងៃស្ដារ', offDay: 'ថ្ងៃសម្រាក',
    pitchA: 'ទីលាន A', pitchB: 'ទីលាន B', gym: 'កន្លែងហាត់',
    addPlan: 'បន្ថែមផែនការវដ្ដ', save: 'រក្សាទុក', saved: 'បានរក្សាទុក', cancel: 'បោះបង់', reset: 'កំណត់ឡើងវិញ',
    exportPdf: 'ទាញយក PDF', exportExcel: 'ទាញយក Excel', publish: 'ផ្សព្វផ្សាយទៅក្រុម', published: 'បានផ្សព្វផ្សាយ',
    coachControls: 'ការគ្រប់គ្រងគ្រូ', noData: 'មិនទាន់មានទិន្នន័យ',
  },
};

const INTENSITIES = ['high', 'medium', 'low', 'rest'];
const PITCHES = ['pitchA', 'pitchB', 'gym'];

const DEFAULT_PLAN = [
  { day: 'mon', md: 'md4', intensity: 'low', focus: 'recovery', pitch: 'gym', duration: '45 min', notes: '' },
  { day: 'tue', md: 'md3', intensity: 'high', focus: 'tactical', pitch: 'pitchA', duration: '90 min', notes: '' },
  { day: 'wed', md: 'md2', intensity: 'medium', focus: 'speed', pitch: 'pitchA', duration: '75 min', notes: '' },
  { day: 'thu', md: 'md1', intensity: 'low', focus: 'matchEve', pitch: 'pitchB', duration: '45 min', notes: '' },
  { day: 'fri', md: 'md', intensity: 'high', focus: 'matchday', pitch: 'pitchA', duration: '90 min', notes: '' },
  { day: 'sat', md: 'mdPlus1', intensity: 'low', focus: 'recoveryDay', pitch: 'gym', duration: '30 min', notes: '' },
  { day: 'sun', md: 'mdPlus2', intensity: 'rest', focus: 'offDay', pitch: 'gym', duration: '0 min', notes: '' },
];

export default function MicrocyclePage() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'km' ? 'km' : 'en';
  const t = (k) => T[lang][k] ?? T.en[k] ?? k;
  const canEdit = ['admin', 'coach'].includes(user?.role);

  const [plan, setPlan] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('genz-microcycle') || 'null') || DEFAULT_PLAN;
    } catch { return DEFAULT_PLAN; }
  });

  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);

  const intensityColor = (v) => INTENSITY_COLORS[v] || INTENSITY_COLORS.rest;
  const intensityHeight = (v) => v === 'high' ? '100%' : v === 'medium' ? '66%' : v === 'low' ? '33%' : '8%';

  const updateDay = (idx, field, value) => {
    setPlan(p => p.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };

  const save = () => {
    try { localStorage.setItem('genz-microcycle', JSON.stringify(plan)); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch {}
  };

  const publish = () => {
    try { localStorage.setItem('genz-microcycle-published', JSON.stringify({ plan, publishedAt: new Date().toISOString() })); setPublished(true); setTimeout(() => setPublished(false), 3000); } catch {}
  };

  const exportExcel = () => {
    const rows = [['Day', 'MD', 'Intensity', 'Focus', 'Pitch', 'Duration', 'Notes']];
    plan.forEach(d => rows.push([d.day, d.md, d.intensity, d.focus, d.pitch, d.duration, d.notes]));
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'microcycle.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => setPlan(DEFAULT_PLAN);

  return (
    <div className="mc">
      <PageTitle title={t('microcycle')} subtitle={t('microcycleSub')} />

      <div className="mc-toolbar">
        <div className="mc-toolbar-left">
          <h2>{t('loadManagement')}</h2>
        </div>
        <div className="mc-toolbar-actions">
          {canEdit && <button className="mc-btn" onClick={reset}>{t('reset')}</button>}
          <button className="mc-btn" onClick={exportExcel}>{t('exportExcel')}</button>
          {canEdit && <button className="mc-btn" onClick={publish}>{published ? t('published') : t('publish')}</button>}
          {canEdit && <button className="mc-btn primary" onClick={save}>{saved ? t('saved') : t('save')}</button>}
        </div>
      </div>

      <div className="mc-chart-card">
        <h3>{t('loadChart')}</h3>
        <div className="mc-chart">
          {plan.map(d => (
            <div key={d.day} className="mc-chart-col">
              <div className="mc-chart-bar-wrap">
                <div className="mc-chart-bar" style={{ height: intensityHeight(d.intensity), background: intensityColor(d.intensity) }} />
              </div>
              <div className="mc-chart-label">{t(d.day)}</div>
              <div className="mc-chart-md">{t(d.md)}</div>
            </div>
          ))}
        </div>
        <div className="mc-legend">
          {INTENSITIES.map(v => (
            <span key={v} className="mc-legend-item">
              <i style={{ background: intensityColor(v) }} /> {t(v)}
            </span>
          ))}
        </div>
      </div>

      <div className="mc-grid">
        {plan.map((d, idx) => (
          <div key={d.day} className="mc-day-card">
            <div className="mc-day-head">
              <div className="mc-day-name">{t(d.day)}</div>
              <div className="mc-day-md">{t(d.md)}</div>
            </div>
            <div className="mc-day-body">
              <label>{t('intensity')}
                <select value={d.intensity} onChange={e => updateDay(idx, 'intensity', e.target.value)} disabled={!canEdit}>
                  {INTENSITIES.map(v => <option key={v} value={v}>{t(v)}</option>)}
                </select>
              </label>
              <label>{t('focus')}
                <select value={d.focus} onChange={e => updateDay(idx, 'focus', e.target.value)} disabled={!canEdit}>
                  <option value="recovery">{t('recovery')}</option>
                  <option value="tactical">{t('tactical')}</option>
                  <option value="speed">{t('speed')}</option>
                  <option value="matchEve">{t('matchEve')}</option>
                  <option value="matchday">{t('matchday')}</option>
                  <option value="recoveryDay">{t('recoveryDay')}</option>
                  <option value="offDay">{t('offDay')}</option>
                </select>
              </label>
              <label>{t('pitch')}
                <select value={d.pitch} onChange={e => updateDay(idx, 'pitch', e.target.value)} disabled={!canEdit}>
                  {PITCHES.map(p => <option key={p} value={p}>{t(p)}</option>)}
                </select>
              </label>
              <label>{t('duration')}
                <input value={d.duration} onChange={e => updateDay(idx, 'duration', e.target.value)} disabled={!canEdit} />
              </label>
              <label>{t('notes')}
                <textarea value={d.notes} onChange={e => updateDay(idx, 'notes', e.target.value)} disabled={!canEdit} rows={2} />
              </label>
            </div>
            <div className="mc-day-bar" style={{ background: intensityColor(d.intensity) }} />
          </div>
        ))}
      </div>
    </div>
  );
}