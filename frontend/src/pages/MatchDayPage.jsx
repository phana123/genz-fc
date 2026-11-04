import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { PageTitle } from '../components/UI';
import './MatchDayPage.css';

// Pitch and player colors in one place
const COLORS = {
  pitch: '#58b878',
  stripe: 'rgba(255,255,255,0.10)',
  line: 'rgba(255,255,255,0.85)',
  player: '#a21caf',
  playerRing: '#ffffff',
  text: '#ffffff',
  label: '#ffffff',
  labelShadow: 'rgba(59,26,74,0.55)',
};

const T = {
  en: {
    matchDay: 'Match Day', matchDaySub: 'Official match preparation',
    preMatch: 'Pre-Match', live1st: 'Live 1st Half', live2nd: 'Live 2nd Half', fullTime: 'Full Time',
    vs: 'vs', date: 'Date', time: 'Time', venue: 'Venue', competition: 'Competition',
    countdown: 'Kickoff in', days: 'd', hours: 'h', minutes: 'm',
    formation: 'Formation', startingXI: 'Starting XI', substitutes: 'Substitutes',
    technicalStaff: 'Technical Staff', tacticalBriefing: 'Tactical Briefing',
    captain: 'Captain', goalkeeper: 'Goalkeeper', keyPlayers: 'Key Players',
    instructions: 'Tactical Instructions', kitColors: 'Kit Colors',
    homeKit: 'Home Kit', awayKit: 'Away Kit',
    headCoach: 'Head Coach', assistantCoach: 'Assistant Coach', physio: 'Physio',
    exportLineup: 'Export Lineup', publishLineup: 'Publish Lineup',
    published: 'Published to players', opponent: 'Opponent', venuePlaceholder: 'Stadium / Pitch',
    addSub: 'Add Substitute', noSubs: 'No substitutes selected',
    instructionsPlaceholder: 'High Pressing 15-min, Quick Counter-attack, Set-piece Takers...',
    save: 'Save', saved: 'Saved', cancel: 'Cancel', position: 'Position', actions: 'Actions',
  },
  km: {
    matchDay: 'ថ្ងៃប្រកួត', matchDaySub: 'ការរៀបចំប្រកួតផ្លូវការ',
    preMatch: 'មុនប្រកួត', live1st: 'កំពុងប្រកួត តង់ទី១', live2nd: 'កំពុងប្រកួត តង់ទី២', fullTime: 'បញ្ចប់',
    vs: 'ប្រកួតជាមួយ', date: 'កាលបរិច្ឆេទ', time: 'ម៉ោង', venue: 'ទីតាំង', competition: 'ការប្រកួត',
    countdown: 'នៅសល់', days: 'ថ្ងៃ', hours: 'ម៉ោង', minutes: 'នាទី',
    formation: 'ទម្រង់', startingXI: '១១នាក់ដំបូង', substitutes: 'បម្រុង',
    technicalStaff: 'បុគ្គលិកបច្ចេកទេស', tacticalBriefing: 'ការណែនាំយុទ្ធសាស្ត្រ',
    captain: 'ប្រធានក្រុម', goalkeeper: 'អ្នកចាំទី', keyPlayers: 'កីឡាករសំខាន់',
    instructions: 'យុទ្ធសាស្ត្រ', kitColors: 'ពណ៌អាវ',
    homeKit: 'អាវក្នុងផ្ទះ', awayKit: 'អាវក្រៅផ្ទះ',
    headCoach: 'គ្រូបង្វឹក', assistantCoach: 'ជំនួយការ', physio: 'គ្រូពេទ្យ',
    exportLineup: 'ទាញយក Lineup', publishLineup: 'ផ្សព្វផ្សាយ Lineup',
    published: 'បានផ្សព្វផ្សាយទៅកីឡាករ', opponent: 'គូប្រកួត', venuePlaceholder: 'កីឡដ្ឋាន / ទីលាន',
    addSub: 'បន្ថែមបម្រុង', noSubs: 'មិនទាន់មានបម្រុង',
    instructionsPlaceholder: 'High Pressing 15-min, Quick Counter-attack, Set-piece Takers...',
    save: 'រក្សាទុក', saved: 'បានរក្សាទុក', cancel: 'បោះបង់', position: 'តួនាទី', actions: 'សកម្មភាព',
  },
};

const FORMATIONS = {
  '4-3-3': [{ x: 50, y: 8, n: 9 }, { x: 20, y: 18, n: 11 }, { x: 80, y: 18, n: 7 }, { x: 30, y: 38, n: 10 }, { x: 50, y: 34, n: 8 }, { x: 70, y: 38, n: 6 }, { x: 15, y: 62, n: 3 }, { x: 38, y: 66, n: 4 }, { x: 62, y: 66, n: 5 }, { x: 85, y: 62, n: 2 }, { x: 50, y: 82, n: 1 }],
  '4-2-3-1': [{ x: 50, y: 8, n: 9 }, { x: 25, y: 22, n: 11 }, { x: 50, y: 20, n: 10 }, { x: 75, y: 22, n: 7 }, { x: 35, y: 38, n: 8 }, { x: 65, y: 38, n: 6 }, { x: 35, y: 52, n: 4 }, { x: 65, y: 52, n: 5 }, { x: 15, y: 62, n: 3 }, { x: 85, y: 62, n: 2 }, { x: 50, y: 82, n: 1 }],
  '3-5-2': [{ x: 35, y: 8, n: 9 }, { x: 65, y: 8, n: 10 }, { x: 15, y: 28, n: 11 }, { x: 35, y: 30, n: 8 }, { x: 50, y: 26, n: 10 }, { x: 65, y: 30, n: 7 }, { x: 85, y: 28, n: 2 }, { x: 25, y: 55, n: 4 }, { x: 50, y: 58, n: 5 }, { x: 75, y: 55, n: 3 }, { x: 50, y: 82, n: 1 }],
};

const defaultMatch = () => ({
  opponent: 'Elite Academy FC',
  date: new Date().toISOString().slice(0, 10),
  time: '15:00',
  venue: 'Stadium / Pitch A',
  competition: 'National Academy League',
  status: 'preMatch',
  formation: '4-3-3',
  startingXI: FORMATIONS['4-3-3'].map((p, i) => ({ slot: i, num: p.n, name: '' })),
  substitutes: [],
  headCoach: 'Head Coach',
  assistantCoach: 'Assistant Coach',
  physio: 'Physio',
  captain: '',
  goalkeeper: '',
  keyPlayers: '',
  instructions: '',
  homeKit: '#a21caf',
  awayKit: '#ffffff',
});

export default function MatchDayPage() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'km' ? 'km' : 'en';
  const t = (k) => T[lang][k] ?? T.en[k] ?? k;
  const canEdit = ['admin', 'coach'].includes(user?.role);

  const [match, setMatch] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('genz-matchday') || 'null') || defaultMatch();
    } catch { return defaultMatch(); }
  });

  const [startingXI, setStartingXI] = useState(match.startingXI || FORMATIONS['4-3-3'].map((p, i) => ({ slot: i, num: p.n, name: '' })));
  const [formation, setFormation] = useState(match.formation || '4-3-3');
  const [subs, setSubs] = useState(match.substitutes || []);
  const [newSub, setNewSub] = useState({ num: '', name: '', position: '', fitness: 'Fit' });
  const [showAddSub, setShowAddSub] = useState(false);
  const [published, setPublished] = useState(false);
  const [saved, setSaved] = useState(false);
  const svgRef = useRef(null);

  const positions = FORMATIONS[formation] || FORMATIONS['4-3-3'];

  const save = () => {
    const data = { ...match, formation, startingXI, substitutes: subs };
    try { localStorage.setItem('genz-matchday', JSON.stringify(data)); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch {}
  };

  const applyFormation = (f) => {
    setFormation(f);
    setStartingXI(FORMATIONS[f].map((p, i) => ({ slot: i, num: p.n, name: startingXI[i]?.name || '' })));
  };

  const updatePlayer = (slot, field, value) => {
    setStartingXI(prev => prev.map(p => p.slot === slot ? { ...p, [field]: value } : p));
  };

  const addSub = () => {
    if (!newSub.name) return;
    setSubs(s => [...s, { ...newSub, id: Date.now() }]);
    setNewSub({ num: '', name: '', position: '', fitness: 'Fit' });
    setShowAddSub(false);
  };

  const removeSub = (id) => setSubs(s => s.filter(x => x.id !== id));

  const publish = () => {
    try {
      localStorage.setItem('genz-matchday-published', JSON.stringify({ match, formation, startingXI, subs, publishedAt: new Date().toISOString() }));
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } catch {}
  };

  const exportLineup = () => {
    const lines = [
      `${match.opponent} vs GEN Z FC`,
      `${match.date} ${match.time} - ${match.venue}`,
      `Formation: ${formation}`,
      '',
      'Starting XI:',
      ...startingXI.map((p, i) => `${i + 1}. #${p.num} ${p.name || 'TBD'}`),
      '',
      'Substitutes:',
      ...subs.map((s, i) => `${i + 1}. #${s.num} ${s.name} (${s.position})`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'lineup.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // Countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const kickoff = new Date(`${match.date}T${match.time}`).getTime();
  const diff = isNaN(kickoff) ? 0 : kickoff - now;
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));

  const updateMatch = (field, value) => setMatch(m => ({ ...m, [field]: value }));

  return (
    <div className="md">
      <PageTitle title={t('matchDay')} subtitle={t('matchDaySub')} />

      <div className="md-header">
        <div className="md-team">
          <div className="md-logo">GZ</div>
          <div className="md-team-name">GEN Z FC</div>
        </div>
        <div className="md-vs">
          <div className="md-vs-text">{t('vs')}</div>
          <div className="md-status-badge">{t(match.status)}</div>
        </div>
        <div className="md-team">
          <div className="md-logo opp">{match.opponent?.[0] || 'O'}</div>
          <div className="md-team-name">{match.opponent}</div>
        </div>
      </div>

      <div className="md-info-row">
        <div className="md-info-item"><small>{t('date')}</small><b>{match.date}</b></div>
        <div className="md-info-item"><small>{t('time')}</small><b>{match.time}</b></div>
        <div className="md-info-item"><small>{t('venue')}</small><b>{match.venue}</b></div>
        <div className="md-info-item"><small>{t('competition')}</small><b>{match.competition}</b></div>
        <div className="md-info-item"><small>{t('countdown')}</small><b>{days}{t('days')} {hours}{t('hours')} {mins}{t('minutes')}</b></div>
      </div>

      {canEdit && (
        <div className="md-edit-row">
          <input value={match.opponent} onChange={e => updateMatch('opponent', e.target.value)} placeholder={t('opponent')} />
          <input type="date" value={match.date} onChange={e => updateMatch('date', e.target.value)} />
          <input type="time" value={match.time} onChange={e => updateMatch('time', e.target.value)} />
          <input value={match.venue} onChange={e => updateMatch('venue', e.target.value)} placeholder={t('venuePlaceholder')} />
          <input value={match.competition} onChange={e => updateMatch('competition', e.target.value)} placeholder={t('competition')} />
          <select value={match.status} onChange={e => updateMatch('status', e.target.value)}>
            <option value="preMatch">{t('preMatch')}</option>
            <option value="live1st">{t('live1st')}</option>
            <option value="live2nd">{t('live2nd')}</option>
            <option value="fullTime">{t('fullTime')}</option>
          </select>
          <button className="md-btn primary" onClick={save}>{saved ? t('saved') : t('save')}</button>
        </div>
      )}

      <div className="md-body">
        <aside className="md-col">
          <div className="md-card">
            <h3>{t('substitutes')}</h3>
            {subs.length === 0 && <p className="md-muted">{t('noSubs')}</p>}
            <div className="md-sub-list">
              {subs.map(s => (
                <div key={s.id} className="md-sub-row">
                  <span className="md-sub-num">#{s.num}</span>
                  <span className="md-sub-name">{s.name}</span>
                  <span className="md-sub-pos">{s.position}</span>
                  <span className={`md-fitness ${s.fitness?.toLowerCase()}`}>{s.fitness}</span>
                  {canEdit && <button className="md-sub-del" onClick={() => removeSub(s.id)}>×</button>}
                </div>
              ))}
            </div>
            {canEdit && (
              <>
                {showAddSub ? (
                  <div className="md-add-sub">
                    <input placeholder="#" value={newSub.num} onChange={e => setNewSub({ ...newSub, num: e.target.value })} />
                    <input placeholder={t('keyPlayers')} value={newSub.name} onChange={e => setNewSub({ ...newSub, name: e.target.value })} />
                    <input placeholder={t('position')} value={newSub.position} onChange={e => setNewSub({ ...newSub, position: e.target.value })} />
                    <select value={newSub.fitness} onChange={e => setNewSub({ ...newSub, fitness: e.target.value })}>
                      <option value="Fit">Fit</option>
                      <option value="Fatigued">Fatigued</option>
                      <option value="Doubtful">Doubtful</option>
                    </select>
                    <div className="md-add-sub-actions">
                      <button className="md-btn" onClick={() => setShowAddSub(false)}>{t('cancel')}</button>
                      <button className="md-btn primary" onClick={addSub}>{t('addSub')}</button>
                    </div>
                  </div>
                ) : (
                  <button className="md-btn" onClick={() => setShowAddSub(true)}>{t('addSub')}</button>
                )}
              </>
            )}
          </div>

          <div className="md-card">
            <h3>{t('technicalStaff')}</h3>
            <div className="md-staff-row"><small>{t('headCoach')}</small><b>{match.headCoach}</b></div>
            <div className="md-staff-row"><small>{t('assistantCoach')}</small><b>{match.assistantCoach}</b></div>
            <div className="md-staff-row"><small>{t('physio')}</small><b>{match.physio}</b></div>
            {canEdit && (
              <div className="md-staff-edit">
                <input value={match.headCoach} onChange={e => updateMatch('headCoach', e.target.value)} placeholder={t('headCoach')} />
                <input value={match.assistantCoach} onChange={e => updateMatch('assistantCoach', e.target.value)} placeholder={t('assistantCoach')} />
                <input value={match.physio} onChange={e => updateMatch('physio', e.target.value)} placeholder={t('physio')} />
              </div>
            )}
          </div>
        </aside>

        <section className="md-pitch-section">
          <div className="md-pitch-header">
            <h3>{t('startingXI')}</h3>
            <select value={formation} onChange={e => applyFormation(e.target.value)} disabled={!canEdit}>
              {Object.keys(FORMATIONS).map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="md-pitch-wrap">
            <svg ref={svgRef} className="md-pitch" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <rect x="0" y="0" width="100" height="100" fill={COLORS.pitch} rx="4" />
              {[0, 2, 4, 6, 8].map(i => (
                <rect key={i} x={i * 10} y="0" width="10" height="100" fill={COLORS.stripe} />
              ))}
              <rect x="2" y="2" width="96" height="96" fill="none" stroke={COLORS.line} strokeWidth="0.5" />
              <line x1="50" y1="2" x2="50" y2="98" stroke={COLORS.line} strokeWidth="0.5" />
              <circle cx="50" cy="50" r="12" fill="none" stroke={COLORS.line} strokeWidth="0.5" />
              <circle cx="50" cy="50" r="0.8" fill={COLORS.line} />
              <rect x="2" y="30" width="16" height="40" fill="none" stroke={COLORS.line} strokeWidth="0.5" />
              <rect x="82" y="30" width="16" height="40" fill="none" stroke={COLORS.line} strokeWidth="0.5" />
              <rect x="2" y="38" width="6" height="24" fill="none" stroke={COLORS.line} strokeWidth="0.5" />
              <rect x="92" y="38" width="6" height="24" fill="none" stroke={COLORS.line} strokeWidth="0.5" />

              {positions.map((p, i) => {
                const player = startingXI[i] || { num: p.n, name: '' };
                return (
                  <g key={i} transform={`translate(${p.x},${p.y})`}>
                    <circle r="4" fill={COLORS.player} stroke={COLORS.playerRing} strokeWidth="0.5" />
                    <text textAnchor="middle" dominantBaseline="central" fill={COLORS.text} fontSize="3" fontWeight="700">{player.num || p.n}</text>
                    <text y="7" textAnchor="middle" fill={COLORS.label} stroke={COLORS.labelShadow} strokeWidth="0.5" paintOrder="stroke" fontSize="2.5" fontWeight="600">{player.name || `#${player.num || p.n}`}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {canEdit && (
            <div className="md-xi-editor">
              {startingXI.map((p, i) => (
                <div key={i} className="md-xi-row">
                  <span className="md-xi-slot">{i + 1}</span>
                  <input value={p.num} onChange={e => updatePlayer(p.slot, 'num', e.target.value)} placeholder="#" />
                  <input value={p.name} onChange={e => updatePlayer(p.slot, 'name', e.target.value)} placeholder="Player name" />
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="md-col">
          <div className="md-card">
            <h3>{t('tacticalBriefing')}</h3>
            <div className="md-brief-row">
              <small>{t('captain')}</small>
              <input value={match.captain} onChange={e => updateMatch('captain', e.target.value)} placeholder="Captain name" disabled={!canEdit} />
            </div>
            <div className="md-brief-row">
              <small>{t('goalkeeper')}</small>
              <input value={match.goalkeeper} onChange={e => updateMatch('goalkeeper', e.target.value)} placeholder="GK name" disabled={!canEdit} />
            </div>
            <div className="md-brief-row">
              <small>{t('keyPlayers')}</small>
              <textarea value={match.keyPlayers} onChange={e => updateMatch('keyPlayers', e.target.value)} placeholder="Key players..." disabled={!canEdit} rows={2} />
            </div>
            <div className="md-brief-row">
              <small>{t('instructions')}</small>
              <textarea value={match.instructions} onChange={e => updateMatch('instructions', e.target.value)} placeholder={t('instructionsPlaceholder')} disabled={!canEdit} rows={4} />
            </div>
          </div>

          <div className="md-card">
            <h3>{t('kitColors')}</h3>
            <div className="md-kit-row">
              <div className="md-kit-item">
                <small>{t('homeKit')}</small>
                <div className="md-kit-swatch" style={{ background: match.homeKit }} />
                {canEdit && <input type="color" value={match.homeKit} onChange={e => updateMatch('homeKit', e.target.value)} />}
              </div>
              <div className="md-kit-item">
                <small>{t('awayKit')}</small>
                <div className="md-kit-swatch" style={{ background: match.awayKit }} />
                {canEdit && <input type="color" value={match.awayKit} onChange={e => updateMatch('awayKit', e.target.value)} />}
              </div>
            </div>
          </div>

          <div className="md-card">
            <h3>{t('actions')}</h3>
            <div className="md-actions">
              <button className="md-btn" onClick={exportLineup}>{t('exportLineup')}</button>
              <button className="md-btn primary" onClick={publish}>{published ? t('published') : t('publishLineup')}</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}