import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { PageTitle } from '../components/UI';
import './PlansPage.css';

const T = {
  en: {
    plans: 'Plans', plansSub: 'Training plans & club strategy',
    schedule: 'Schedule', microcycle: 'Microcycle', matchPlans: 'Match Plans', tasks: 'Tasks',
    weeklySchedule: 'Weekly Training Schedule', addPlan: 'Add New Plan',
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
    time: 'Time', pitch: 'Pitch', type: 'Type', coach: 'Coach', notes: 'Notes',
    strength: 'Strength', recovery: 'Recovery', tactical: 'Tactical', matchPrep: 'Match Prep', rest: 'Rest',
    pitchA: 'Pitch A', pitchB: 'Pitch B', gym: 'Gym',
    microcyclePlanning: 'Microcycle Planning', loadManagement: 'Load Management',
    md3: 'MD-3', md2: 'MD-2', md1: 'MD-1', md: 'Matchday',
    high: 'High', medium: 'Medium', low: 'Low', restDay: 'Rest',
    intensity: 'Intensity', focus: 'Focus', duration: 'Duration',
    matchTacticalPlans: 'Match & Tactical Plans', opponent: 'Opponent', date: 'Date',
    attacking: 'Attacking Strategy', defending: 'Defensive Block', keyPoints: 'Key Points',
    addMatchPlan: 'Add Match Plan', noPlans: 'No match plans yet',
    clubObjectives: 'Club Objectives & Tasks', addTask: 'Add Task',
    todo: 'To-Do', inProgress: 'In Progress', done: 'Done',
    exportPdf: 'Export PDF', exportExcel: 'Export Excel', share: 'Share',
    save: 'Save', cancel: 'Cancel', delete: 'Delete',
    noTasks: 'No tasks yet', noSchedule: 'No schedule yet',
  },
  km: {
    plans: 'ផែនការ', plansSub: 'ផែនការហ្វឹកហាត់ និងយុទ្ធសាស្ត្រក្លឹប',
    schedule: 'កាលវិភាគ', microcycle: 'វដ្តហ្វឹកហាត់', matchPlans: 'ផែនការប្រកួត', tasks: 'កិច្ចការ',
    weeklySchedule: 'កាលវិភាគហ្វឹកហាត់ប្រចាំសប្តាហ៍', addPlan: 'បន្ថែមផែនការ',
    mon: 'ចន្ទ', tue: 'អង្គារ', wed: 'ពុធ', thu: 'ព្រហស្បតិ៍', fri: 'សុក្រ', sat: 'សៅរ៍', sun: 'អាទិត្យ',
    time: 'ម៉ោង', pitch: 'ទីលាន', type: 'ប្រភេទ', coach: 'គ្រូ', notes: 'កំណត់ត្រា',
    strength: 'កម្លាំង', recovery: 'ស្ដារ', tactical: 'យុទ្ធសាស្ត្រ', matchPrep: 'រៀបចំប្រកួត', rest: 'សម្រាក',
    pitchA: 'ទីលាន A', pitchB: 'ទីលាន B', gym: 'កន្លែងហាត់',
    microcyclePlanning: 'ផែនការវដ្តហ្វឹកហាត់', loadManagement: 'គ្រប់គ្រងផ្ទុក',
    md3: 'MD-3', md2: 'MD-2', md1: 'MD-1', md: 'ថ្ងៃប្រកួត',
    high: 'ខ្ពស់', medium: 'មធ្យម', low: 'ទាប', restDay: 'សម្រាក',
    intensity: ' شدت', focus: 'ផ្តោត', duration: 'រយៈពេល',
    matchTacticalPlans: 'ផែនការយុទ្ធសាស្ត្រប្រកួត', opponent: 'គូប្រកួត', date: 'កាលបរិច្ឆេទ',
    attacking: 'យុទ្ធសាស្ត្រវាយលុក', defending: 'ការពារ', keyPoints: 'ចំណុចសំខាន់',
    addMatchPlan: 'បន្ថែមផែនការប្រកួត', noPlans: 'មិនទាន់មានផែនការប្រកួត',
    clubObjectives: 'គោលដៅ និងកិច្ចការក្លឹប', addTask: 'បន្ថែមកិច្ចការ',
    todo: 'ត្រូវធ្វើ', inProgress: 'កំពុងធ្វើ', done: 'បានធ្វើ',
    exportPdf: 'ទាញយក PDF', exportExcel: 'ទាញយក Excel', share: 'ចែករំលែក',
    save: 'រក្សាទុក', cancel: 'បោះបង់', delete: 'លុប',
    noTasks: 'មិនទាន់មានកិច្ចការ', noSchedule: 'មិនទាន់មានកាលវិភាគ',
  },
};

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const TYPES = ['strength', 'recovery', 'tactical', 'matchPrep', 'rest'];
const PITCHES = ['pitchA', 'pitchB', 'gym'];

export default function PlansPage() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'km' ? 'km' : 'en';
  const t = (k) => T[lang][k] ?? T.en[k] ?? k;
  const canEdit = ['admin', 'coach'].includes(user?.role);

  const [tab, setTab] = useState('schedule');

  // Weekly schedule
  const [schedule, setSchedule] = useState(() => {
    try { return JSON.parse(localStorage.getItem('genz-plans-schedule') || '[]'); } catch { return []; }
  });
  const [newPlan, setNewPlan] = useState({ day: 'mon', time: '17:30', pitch: 'pitchA', type: 'tactical', coach: '', notes: '' });
  const [showAddPlan, setShowAddPlan] = useState(false);

  // Microcycle
  const [microcycle, setMicrocycle] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('genz-plans-micro') || 'null');
      return parsed || [
        { day: 'md3', intensity: 'high', focus: 'Strength & Conditioning', duration: '90 min' },
        { day: 'md2', intensity: 'medium', focus: 'Tactical Shape', duration: '75 min' },
        { day: 'md1', intensity: 'low', focus: 'Activation & Set-pieces', duration: '45 min' },
        { day: 'md', intensity: 'high', focus: 'Matchday', duration: '90 min' },
      ];
    } catch { return [
      { day: 'md3', intensity: 'high', focus: 'Strength & Conditioning', duration: '90 min' },
      { day: 'md2', intensity: 'medium', focus: 'Tactical Shape', duration: '75 min' },
      { day: 'md1', intensity: 'low', focus: 'Activation & Set-pieces', duration: '45 min' },
      { day: 'md', intensity: 'high', focus: 'Matchday', duration: '90 min' },
    ]; }
  });

  // Match plans
  const [matchPlans, setMatchPlans] = useState(() => {
    try { return JSON.parse(localStorage.getItem('genz-plans-matches') || '[]'); } catch { return []; }
  });
  const [newMatch, setNewMatch] = useState({ opponent: '', date: '', attacking: '', defending: '', keyPoints: '' });
  const [showAddMatch, setShowAddMatch] = useState(false);

  // Tasks
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('genz-plans-tasks') || '[]'); } catch { return []; }
  });
  const [newTask, setNewTask] = useState({ title: '', assignee: '', status: 'todo' });
  const [showAddTask, setShowAddTask] = useState(false);

  const persist = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

  const addPlan = () => {
    const p = { ...newPlan, id: Date.now() };
    const next = [...schedule, p];
    setSchedule(next); persist('genz-plans-schedule', next);
    setShowAddPlan(false);
    setNewPlan({ day: 'mon', time: '17:30', pitch: 'pitchA', type: 'tactical', coach: '', notes: '' });
  };

  const removePlan = (id) => {
    const next = schedule.filter(p => p.id !== id);
    setSchedule(next); persist('genz-plans-schedule', next);
  };

  const saveMicro = () => { persist('genz-plans-micro', microcycle); };

  const addMatch = () => {
    const m = { ...newMatch, id: Date.now() };
    const next = [...matchPlans, m];
    setMatchPlans(next); persist('genz-plans-matches', next);
    setShowAddMatch(false);
    setNewMatch({ opponent: '', date: '', attacking: '', defending: '', keyPoints: '' });
  };

  const removeMatch = (id) => {
    const next = matchPlans.filter(m => m.id !== id);
    setMatchPlans(next); persist('genz-plans-matches', next);
  };

  const addTask = () => {
    const task = { ...newTask, id: Date.now() };
    const next = [...tasks, task];
    setTasks(next); persist('genz-plans-tasks', next);
    setShowAddTask(false);
    setNewTask({ title: '', assignee: '', status: 'todo' });
  };

  const updateTaskStatus = (id, status) => {
    const next = tasks.map(tsk => tsk.id === id ? { ...tsk, status } : tsk);
    setTasks(next); persist('genz-plans-tasks', next);
  };

  const removeTask = (id) => {
    const next = tasks.filter(tsk => tsk.id !== id);
    setTasks(next); persist('genz-plans-tasks', next);
  };

  const exportExcel = () => {
    const rows = [['Day', 'Time', 'Pitch', 'Type', 'Coach', 'Notes']];
    schedule.forEach(p => rows.push([p.day, p.time, p.pitch, p.type, p.coach, p.notes]));
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'training-plan.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const typeLabel = (k) => t(k);
  const pitchLabel = (k) => t(k);
  const intensityColor = (v) => v === 'high' ? '#ef4444' : v === 'medium' ? '#f59e0b' : v === 'low' ? '#22c55e' : '#6b7280';

  return (
    <div className="pl">
      <PageTitle title={t('plans')} subtitle={t('plansSub')} />

      <div className="pl-tabs">
        {['schedule', 'microcycle', 'matchPlans', 'tasks'].map(k => (
          <button key={k} className={`pl-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{t(k)}</button>
        ))}
        <div className="pl-tab-actions">
          <button className="pl-btn" onClick={exportExcel}>{t('exportExcel')}</button>
        </div>
      </div>

      {/* Schedule tab */}
      {tab === 'schedule' && (
        <div className="pl-section">
          <div className="pl-section-head">
            <h2>{t('weeklySchedule')}</h2>
            {canEdit && <button className="pl-btn primary" onClick={() => setShowAddPlan(true)}>{t('addPlan')}</button>}
          </div>

          {showAddPlan && (
            <div className="pl-form">
              <select value={newPlan.day} onChange={e => setNewPlan({ ...newPlan, day: e.target.value })}>
                {DAYS.map(d => <option key={d} value={d}>{t(d)}</option>)}
              </select>
              <input type="time" value={newPlan.time} onChange={e => setNewPlan({ ...newPlan, time: e.target.value })} />
              <select value={newPlan.pitch} onChange={e => setNewPlan({ ...newPlan, pitch: e.target.value })}>
                {PITCHES.map(p => <option key={p} value={p}>{t(p)}</option>)}
              </select>
              <select value={newPlan.type} onChange={e => setNewPlan({ ...newPlan, type: e.target.value })}>
                {TYPES.map(ty => <option key={ty} value={ty}>{t(ty)}</option>)}
              </select>
              <input placeholder={t('coach')} value={newPlan.coach} onChange={e => setNewPlan({ ...newPlan, coach: e.target.value })} />
              <input placeholder={t('notes')} value={newPlan.notes} onChange={e => setNewPlan({ ...newPlan, notes: e.target.value })} />
              <div className="pl-form-actions">
                <button className="pl-btn" onClick={() => setShowAddPlan(false)}>{t('cancel')}</button>
                <button className="pl-btn primary" onClick={addPlan}>{t('save')}</button>
              </div>
            </div>
          )}

          {schedule.length === 0 ? (
            <p className="pl-muted">{t('noSchedule')}</p>
          ) : (
            <div className="pl-schedule-grid">
              {DAYS.map(day => {
                const items = schedule.filter(p => p.day === day).sort((a, b) => a.time.localeCompare(b.time));
                return (
                  <div key={day} className="pl-day-card">
                    <div className="pl-day-head">{t(day)}</div>
                    {items.length === 0 ? <p className="pl-muted small">—</p> : items.map(p => (
                      <div key={p.id} className="pl-plan-item">
                        <div className="pl-plan-time">{p.time}</div>
                        <div className="pl-plan-body">
                          <div className="pl-plan-type">{t(p.type)}</div>
                          <div className="pl-plan-meta">{t(p.pitch)}{p.coach ? ` · ${p.coach}` : ''}</div>
                          {p.notes && <div className="pl-plan-notes">{p.notes}</div>}
                        </div>
                        {canEdit && <button className="pl-plan-del" onClick={() => removePlan(p.id)}>×</button>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Microcycle tab */}
      {tab === 'microcycle' && (
        <div className="pl-section">
          <div className="pl-section-head">
            <h2>{t('microcyclePlanning')}</h2>
            {canEdit && <button className="pl-btn primary" onClick={saveMicro}>{t('save')}</button>}
          </div>
          <p className="pl-muted">{t('loadManagement')}</p>
          <div className="pl-micro-grid">
            {microcycle.map((m, i) => (
              <div key={m.day} className="pl-micro-card">
                <div className="pl-micro-day">{t(m.day.toLowerCase() === 'md' ? 'md' : m.day.toLowerCase())}</div>
                <label>{t('intensity')}
                  <select value={m.intensity} onChange={e => {
                    const next = [...microcycle]; next[i] = { ...next[i], intensity: e.target.value }; setMicrocycle(next);
                  }} disabled={!canEdit}>
                    <option value="high">{t('high')}</option>
                    <option value="medium">{t('medium')}</option>
                    <option value="low">{t('low')}</option>
                    <option value="rest">{t('restDay')}</option>
                  </select>
                </label>
                <label>{t('focus')}
                  <input value={m.focus} onChange={e => {
                    const next = [...microcycle]; next[i] = { ...next[i], focus: e.target.value }; setMicrocycle(next);
                  }} disabled={!canEdit} />
                </label>
                <label>{t('duration')}
                  <input value={m.duration} onChange={e => {
                    const next = [...microcycle]; next[i] = { ...next[i], duration: e.target.value }; setMicrocycle(next);
                  }} disabled={!canEdit} />
                </label>
                <div className="pl-intensity-bar" style={{ background: intensityColor(m.intensity) }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match plans tab */}
      {tab === 'matchPlans' && (
        <div className="pl-section">
          <div className="pl-section-head">
            <h2>{t('matchTacticalPlans')}</h2>
            {canEdit && <button className="pl-btn primary" onClick={() => setShowAddMatch(true)}>{t('addMatchPlan')}</button>}
          </div>

          {showAddMatch && (
            <div className="pl-form">
              <input placeholder={t('opponent')} value={newMatch.opponent} onChange={e => setNewMatch({ ...newMatch, opponent: e.target.value })} />
              <input type="date" value={newMatch.date} onChange={e => setNewMatch({ ...newMatch, date: e.target.value })} />
              <textarea placeholder={t('attacking')} value={newMatch.attacking} onChange={e => setNewMatch({ ...newMatch, attacking: e.target.value })} rows={2} />
              <textarea placeholder={t('defending')} value={newMatch.defending} onChange={e => setNewMatch({ ...newMatch, defending: e.target.value })} rows={2} />
              <textarea placeholder={t('keyPoints')} value={newMatch.keyPoints} onChange={e => setNewMatch({ ...newMatch, keyPoints: e.target.value })} rows={2} />
              <div className="pl-form-actions">
                <button className="pl-btn" onClick={() => setShowAddMatch(false)}>{t('cancel')}</button>
                <button className="pl-btn primary" onClick={addMatch}>{t('save')}</button>
              </div>
            </div>
          )}

          {matchPlans.length === 0 ? (
            <p className="pl-muted">{t('noPlans')}</p>
          ) : (
            <div className="pl-match-list">
              {matchPlans.map(m => (
                <div key={m.id} className="pl-match-card">
                  <div className="pl-match-head">
                    <b>{m.opponent}</b>
                    <span>{m.date}</span>
                    {canEdit && <button className="pl-plan-del" onClick={() => removeMatch(m.id)}>×</button>}
                  </div>
                  {m.attacking && <div className="pl-match-block"><small>{t('attacking')}</small><p>{m.attacking}</p></div>}
                  {m.defending && <div className="pl-match-block"><small>{t('defending')}</small><p>{m.defending}</p></div>}
                  {m.keyPoints && <div className="pl-match-block"><small>{t('keyPoints')}</small><p>{m.keyPoints}</p></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks tab */}
      {tab === 'tasks' && (
        <div className="pl-section">
          <div className="pl-section-head">
            <h2>{t('clubObjectives')}</h2>
            {canEdit && <button className="pl-btn primary" onClick={() => setShowAddTask(true)}>{t('addTask')}</button>}
          </div>

          {showAddTask && (
            <div className="pl-form">
              <input placeholder={t('notes')} value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              <input placeholder={t('coach')} value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })} />
              <select value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                <option value="todo">{t('todo')}</option>
                <option value="inProgress">{t('inProgress')}</option>
                <option value="done">{t('done')}</option>
              </select>
              <div className="pl-form-actions">
                <button className="pl-btn" onClick={() => setShowAddTask(false)}>{t('cancel')}</button>
                <button className="pl-btn primary" onClick={addTask}>{t('save')}</button>
              </div>
            </div>
          )}

          {tasks.length === 0 ? (
            <p className="pl-muted">{t('noTasks')}</p>
          ) : (
            <div className="pl-task-list">
              {['todo', 'inProgress', 'done'].map(status => (
                <div key={status} className="pl-task-col">
                  <div className="pl-task-col-head">{t(status === 'todo' ? 'todo' : status === 'inProgress' ? 'inProgress' : 'done')}</div>
                  {tasks.filter(tsk => tsk.status === status).map(tsk => (
                    <div key={tsk.id} className="pl-task-card">
                      <div className="pl-task-title">{tsk.title}</div>
                      {tsk.assignee && <div className="pl-task-assignee">{tsk.assignee}</div>}
                      <div className="pl-task-actions">
                        <select value={tsk.status} onChange={e => updateTaskStatus(tsk.id, e.target.value)} disabled={!canEdit}>
                          <option value="todo">{t('todo')}</option>
                          <option value="inProgress">{t('inProgress')}</option>
                          <option value="done">{t('done')}</option>
                        </select>
                        {canEdit && <button className="pl-plan-del" onClick={() => removeTask(tsk.id)}>×</button>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}