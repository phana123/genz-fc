import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { PageTitle } from '../components/UI';
import './GameModelPage.css';

const T = {
  en: {
    gameModel: 'Game Model', gameModelSub: 'Club playing style & principles',
    overview: 'Overview', principles: 'Principles', phases: 'Phases of Play', style: 'Playing Style',
    save: 'Save', saved: 'Saved',
    identity: 'Team Identity', identityPlaceholder: 'Describe the club playing identity...',
    coreStyle: 'Core Playing Style', culture: 'Culture & Mindset',
    buildUp: 'Build-up Phase', spacing: 'Spacing & Width', progression: 'Progression',
    pressZones: 'Pressing Zones', pressTriggers: 'Pressing Triggers',
    corners: 'Corners', freeKicks: 'Free Kicks & Throw-ins',
    finalThird: 'Final Third Entry', boxOccupation: 'Box Occupation',
    defShape: 'Defensive Shape', boxDefense: 'Box Defense',
    adaptability: 'Tactical Adaptability', physical: 'Physical Demands',
    possession: 'Possession', pressing: 'Pressing', transition: 'Transition', setPieces: 'Set Pieces',
    attacking: 'Attacking Phase', defending: 'Defending Phase', transitionAtk: 'Transition to Attack', transitionDef: 'Transition to Defense',
    notes: 'Notes', notesPlaceholder: 'Additional notes...',
  },
  km: {
    gameModel: 'គំរូល្បែង', gameModelSub: 'រចនាប័ទ្មលេង និងគោលការណ៍',
    overview: 'ទិដ្ឋភាពទូទៅ', principles: 'គោលការណ៍', phases: 'ដំណាក់កាលលេង', style: 'រចនាប័ទ្ម',
    save: 'រក្សាទុក', saved: 'បានរក្សាទុក',
    identity: 'អត្តសញ្ញាណក្រុម', identityPlaceholder: 'ពិពណ៌នាអត្តសញ្ញាណ...',
    coreStyle: 'រចនាប័ទ្មស្នូល', culture: 'វប្បធម៌ និងផ្នត់គំនិត',
    buildUp: 'ការសាងបាល់', spacing: 'លំហ និងទទឹង', progression: 'ការឆ្លងកាត់',
    pressZones: 'តំបន់ Press', pressTriggers: 'សញ្ញា Press',
    corners: 'បាល់ជ្រុង', freeKicks: 'បាល់ហ្វ្រីឃិក និងបោះចូល',
    finalThird: 'ចូលតំបន់គ្រោះថ្នាក់', boxOccupation: 'ការបំពេញប្រអប់',
    defShape: 'រចនាសម្ព័ន្ធការពារ', boxDefense: 'ការពារប្រអប់',
    adaptability: 'ការបត់បែន', physical: 'លក្ខខណ្ឌកាយ',
    possession: 'កាន់បាល់', pressing: 'សម្ពាធ', transition: 'ផ្លាស់ប្ដូរ', setPieces: 'បាល់ស្លាប់',
    attacking: 'វាយលុក', defending: 'ការពារ', transitionAtk: 'ផ្លាស់ទៅវាយលុក', transitionDef: 'ផ្លាស់ទៅការពារ',
    notes: 'កំណត់ត្រា', notesPlaceholder: 'កំណត់ត្រាបន្ថែម...',
  },
};

export default function GameModelPage() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'km' ? 'km' : 'en';
  const t = (k) => T[lang][k] ?? T.en[k] ?? k;
  const canEdit = ['admin', 'coach'].includes(user?.role);

  const [model, setModel] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('genz-gamemodel') || 'null');
      return parsed || {
        identity: '',
        possession: '',
        pressing: '',
        transition: '',
        setPieces: '',
        attacking: '',
        defending: '',
        transitionAtk: '',
        transitionDef: '',
        notes: '',
      };
    } catch { return {
      identity: '',
      possession: '',
      pressing: '',
      transition: '',
      setPieces: '',
      attacking: '',
      defending: '',
      transitionAtk: '',
      transitionDef: '',
      notes: '',
    }; }
  });

  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('overview');

  const update = (field, value) => setModel(m => ({ ...m, [field]: value }));

  const save = () => {
    try { localStorage.setItem('genz-gamemodel', JSON.stringify(model)); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch {}
  };

  const sections = [
    { key: 'identity', label: t('identity'), placeholder: t('identityPlaceholder') },
    { key: 'coreStyle', label: t('coreStyle'), placeholder: 'Possession-based / Direct & Counter / Gegenpressing...' },
    { key: 'culture', label: t('culture'), placeholder: 'Bravery, sacrifice, discipline...' },
    { key: 'buildUp', label: t('buildUp'), placeholder: 'Short build-up from GK, midfielders drop...' },
    { key: 'spacing', label: t('spacing'), placeholder: 'Overload one side, isolate other...' },
    { key: 'progression', label: t('progression'), placeholder: 'Short combinations through midfield...' },
    { key: 'pressZones', label: t('pressZones'), placeholder: 'High press / Mid block / Low block...' },
    { key: 'pressTriggers', label: t('pressTriggers'), placeholder: 'Back pass, wide pass, back to goal...' },
    { key: 'transitionAtk', label: t('transitionAtk'), placeholder: 'Counter-attack 5-8 seconds...' },
    { key: 'transitionDef', label: t('transitionDef'), placeholder: 'Counter-press 3-5 seconds...' },
    { key: 'corners', label: t('corners'), placeholder: 'Attacking routines, man/zone marking...' },
    { key: 'freeKicks', label: t('freeKicks'), placeholder: 'Free kick & throw-in routines...' },
    { key: 'finalThird', label: t('finalThird'), placeholder: 'Through balls, crossing, long shots...' },
    { key: 'boxOccupation', label: t('boxOccupation'), placeholder: 'CF, opposite winger, one midfielder...' },
    { key: 'defShape', label: t('defShape'), placeholder: '4-4-2 / 5-3-2 out of possession...' },
    { key: 'boxDefense', label: t('boxDefense'), placeholder: 'Clearances, shot blocking...' },
    { key: 'adaptability', label: t('adaptability'), placeholder: 'Plan B, game state adjustments...' },
    { key: 'physical', label: t('physical'), placeholder: 'Physical demands for this style...' },
    { key: 'possession', label: t('possession'), placeholder: 'Possession principles...' },
    { key: 'pressing', label: t('pressing'), placeholder: 'Pressing principles...' },
    { key: 'transition', label: t('transition'), placeholder: 'Transition principles...' },
    { key: 'setPieces', label: t('setPieces'), placeholder: 'Set-piece principles...' },
    { key: 'attacking', label: t('attacking'), placeholder: 'Attacking phase details...' },
    { key: 'defending', label: t('defending'), placeholder: 'Defending phase details...' },
    { key: 'notes', label: t('notes'), placeholder: t('notesPlaceholder') },
  ];

  return (
    <div className="gm">
      <PageTitle title={t('gameModel')} subtitle={t('gameModelSub')} />

      <div className="gm-tabs">
        {['overview', 'principles', 'phases', 'style'].map(k => (
          <button key={k} className={`gm-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{t(k)}</button>
        ))}
        <div className="gm-tab-actions">
          {canEdit && <button className="gm-btn primary" onClick={save}>{saved ? t('saved') : t('save')}</button>}
        </div>
      </div>

      <div className="gm-content">
        {sections.map(s => (
          <div key={s.key} className="gm-section">
            <label className="gm-label">{s.label}</label>
            {canEdit ? (
              <textarea
                className="gm-textarea"
                value={model[s.key]}
                onChange={e => update(s.key, e.target.value)}
                placeholder={s.placeholder}
                rows={4}
              />
            ) : (
              <p className="gm-text">{model[s.key] || '—'}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}