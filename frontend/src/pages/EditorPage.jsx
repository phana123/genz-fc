import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { PageTitle } from '../components/UI';
import './EditorPage.css';

const T = {
  en: {
    editor: 'Tactical Editor', editorSub: 'Design formations, movements and set-pieces',
    tools: 'Tools', select: 'Select', arrow: 'Arrow', line: 'Line', erase: 'Erase',
    formations: 'Formations', pitch: 'Pitch', reset: 'Reset', save: 'Save', saved: 'Saved',
    players: 'Players', addPlayer: 'Add player', drawHint: 'Click and drag to draw',
    media: 'Media', addMedia: 'Add media URL', mediaPlaceholder: 'Paste image or video URL',
    remove: 'Remove', noMedia: 'No media added yet',
    setPieces: 'Set-pieces', notes: 'Notes', notesPlaceholder: 'Strategy notes...',
    team: 'Team', opponent: 'Opponent',
  },
  km: {
    editor: 'ក្ដារយុទ្ធសាស្ត្រ', editorSub: 'រចនាទម្រង់ ចលនា និងកលល្បិច',
    tools: 'ឧបករណ៍', select: 'ជ្រើស', arrow: 'ព្រួញ', line: 'បន្ទាត់', erase: 'លុប',
    formations: 'ទម្រង់', pitch: 'ទីលាន', reset: 'កំណត់ឡើងវិញ', save: 'រក្សាទុក', saved: 'បានរក្សាទុក',
    players: 'កីឡាករ', addPlayer: 'បន្ថែមកីឡាករ', drawHint: 'ចុច និងអូសដើម្បីគូស',
    media: 'មេឌៀ', addMedia: 'បន្ថែម URL មេឌៀ', mediaPlaceholder: 'បិទភ្ជាប់ URL រូបភាព ឬវីដេអូ',
    remove: 'លុបចោល', noMedia: 'មិនទាន់មានមេឌៀ',
    setPieces: 'កលល្បិច', notes: 'កំណត់ត្រា', notesPlaceholder: 'កំណត់ត្រាយុទ្ធសាស្ត្រ...',
    team: 'ក្រុម', opponent: 'ប្រកួតប្រជែង',
  },
};

const FORMATIONS = {
  '4-3-3': [
    { x: 50, y: 62, n: 1 }, { x: 12, y: 48, n: 2 }, { x: 34, y: 52, n: 3 }, { x: 66, y: 52, n: 4 }, { x: 88, y: 48, n: 5 },
    { x: 22, y: 32, n: 6 }, { x: 50, y: 28, n: 8 }, { x: 78, y: 32, n: 10 },
    { x: 18, y: 12, n: 7 }, { x: 50, y: 8, n: 9 }, { x: 82, y: 12, n: 11 },
  ],
  '4-4-2': [
    { x: 50, y: 62, n: 1 }, { x: 12, y: 48, n: 2 }, { x: 34, y: 52, n: 3 }, { x: 66, y: 52, n: 4 }, { x: 88, y: 48, n: 5 },
    { x: 12, y: 32, n: 6 }, { x: 34, y: 30, n: 7 }, { x: 66, y: 30, n: 8 }, { x: 88, y: 32, n: 11 },
    { x: 34, y: 12, n: 9 }, { x: 66, y: 12, n: 10 },
  ],
  '4-2-3-1': [
    { x: 50, y: 62, n: 1 }, { x: 12, y: 48, n: 2 }, { x: 34, y: 52, n: 3 }, { x: 66, y: 52, n: 4 }, { x: 88, y: 48, n: 5 },
    { x: 34, y: 38, n: 6 }, { x: 66, y: 38, n: 8 },
    { x: 22, y: 22, n: 7 }, { x: 50, y: 20, n: 10 }, { x: 78, y: 22, n: 11 },
    { x: 50, y: 8, n: 9 },
  ],
  '3-5-2': [
    { x: 50, y: 62, n: 1 }, { x: 25, y: 50, n: 2 }, { x: 50, y: 52, n: 3 }, { x: 75, y: 50, n: 4 },
    { x: 10, y: 32, n: 5 }, { x: 30, y: 30, n: 6 }, { x: 50, y: 26, n: 8 }, { x: 70, y: 30, n: 10 }, { x: 90, y: 32, n: 7 },
    { x: 34, y: 12, n: 9 }, { x: 66, y: 12, n: 11 },
  ],
};

export default function EditorPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'km' ? 'km' : 'en';
  const t = (k) => T[lang][k] ?? T.en[k] ?? k;

  const [formation, setFormation] = useState('4-3-3');
  const [players, setPlayers] = useState(() => FORMATIONS['4-3-3'].map((p, i) => ({ id: i, x: p.x, y: p.y, n: p.n, side: 'team' })));
  const [tool, setTool] = useState('select');
  const [strokes, setStrokes] = useState([]);
  const [current, setCurrent] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null);
  const [media, setMedia] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [teamName, setTeamName] = useState('GEN Z FC');
  const [opponent, setOpponent] = useState('Opponent');
  const svgRef = useRef(null);

  const screenToSvg = useCallback((cx, cy) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return { x: vb.x + (cx - rect.left) * vb.width / rect.width, y: vb.y + (cy - rect.top) * vb.height / rect.height };
  }, []);

  const applyFormation = (f) => {
    setFormation(f);
    setPlayers(FORMATIONS[f].map((p, i) => ({ id: i, x: p.x, y: p.y, n: p.n, side: 'team' })));
    setStrokes([]);
  };

  const onPointerDown = (e) => {
    const { x, y } = screenToSvg(e.clientX, e.clientY);
    if (tool === 'select') {
      // check if clicked a player
      const hit = players.find(p => Math.hypot(p.x - x, p.y - y) < 4);
      if (hit) { setDragging(hit.id); setSelected(hit.id); }
      else setSelected(null);
    } else if (tool === 'arrow' || tool === 'line') {
      setCurrent({ type: tool, points: [{ x, y }] });
    } else if (tool === 'erase') {
      // remove strokes near point
      setStrokes(s => s.filter(st => !st.points.some(pt => Math.hypot(pt.x - x, pt.y - y) < 3)));
    }
  };

  const onPointerMove = (e) => {
    if (dragging != null) {
      const { x, y } = screenToSvg(e.clientX, e.clientY);
      setPlayers(ps => ps.map(p => p.id === dragging ? { ...p, x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(66, y)) } : p));
    } else if (current) {
      const { x, y } = screenToSvg(e.clientX, e.clientY);
      setCurrent(c => ({ ...c, points: [...c.points, { x, y }] }));
    }
  };

  const onPointerUp = () => {
    if (dragging != null) setDragging(null);
    if (current) {
      setStrokes(s => [...s, current]);
      setCurrent(null);
    }
  };

  const reset = () => {
    applyFormation(formation);
    setStrokes([]);
    setNotes('');
    setSaved(false);
  };

  const save = () => {
    try {
      localStorage.setItem('genz-editor', JSON.stringify({ formation, players, strokes, notes, teamName, opponent, media }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('genz-editor');
      if (raw) {
        const d = JSON.parse(raw);
        if (d.formation) setFormation(d.formation);
        if (d.players) setPlayers(d.players);
        if (d.strokes) setStrokes(d.strokes);
        if (d.notes) setNotes(d.notes);
        if (d.teamName) setTeamName(d.teamName);
        if (d.opponent) setOpponent(d.opponent);
        if (d.media) setMedia(d.media);
      }
    } catch (e) { /* ignore */ }
  }, []);

  const addMedia = () => {
    if (!mediaUrl.trim()) return;
    setMedia(m => [...m, { url: mediaUrl.trim(), type: mediaUrl.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image' }]);
    setMediaUrl('');
  };

  const removeMedia = (i) => setMedia(m => m.filter((_, idx) => idx !== i));

  const renderStroke = (s, i, isCurrent = false) => {
    if (s.type === 'arrow' || s.type === 'line') {
      const pts = s.points;
      if (pts.length < 2) return null;
      const d = pts.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
      const last = pts[pts.length - 1];
      const prev = pts[pts.length - 2];
      const ang = Math.atan2(last.y - prev.y, last.x - prev.x) * 180 / Math.PI;
      return (
        <g key={i}>
          <path d={d} fill="none" stroke={isCurrent ? '#fbbf24' : '#22d3ee'} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
          {s.type === 'arrow' && (
            <polygon points="0,-1.2 2.4,0 0,1.2" fill={isCurrent ? '#fbbf24' : '#22d3ee'} transform={`translate(${last.x},${last.y}) rotate(${ang})`} />
          )}
        </g>
      );
    }
    return null;
  };

  return (
    <div className="ed">
      <PageTitle title={t('editor')} subtitle={t('editorSub')} />

      <div className="ed-toolbar">
        <div className="ed-group">
          <span className="ed-label">{t('tools')}</span>
          {['select', 'arrow', 'line', 'erase'].map(k => (
            <button key={k} className={`ed-btn ${tool === k ? 'active' : ''}`} onClick={() => setTool(k)}>{t(k)}</button>
          ))}
        </div>
        <div className="ed-group">
          <span className="ed-label">{t('formations')}</span>
          {Object.keys(FORMATIONS).map(f => (
            <button key={f} className={`ed-btn ${formation === f ? 'active' : ''}`} onClick={() => applyFormation(f)}>{f}</button>
          ))}
        </div>
        <div className="ed-group">
          <input className="ed-input" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder={t('team')} />
          <span className="ed-vs">vs</span>
          <input className="ed-input" value={opponent} onChange={e => setOpponent(e.target.value)} placeholder={t('opponent')} />
        </div>
        <div className="ed-group">
          <button className="ed-btn" onClick={reset}>{t('reset')}</button>
          <button className="ed-btn primary" onClick={save}>{saved ? t('saved') : t('save')}</button>
        </div>
      </div>

      <div className="ed-hint">{t('drawHint')}</div>

      <div className="ed-body">
        {/* Pitch */}
        <div className="ed-pitch-wrap">
          <svg ref={svgRef} className="ed-pitch" viewBox="0 0 100 68" preserveAspectRatio="xMidYMid meet"
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
            {/* Pitch background */}
            <rect x="0" y="0" width="100" height="68" fill="#1a3a2a" />
            {/* Stripes */}
            {[0,1,2,3,4,5,6,7,8,9].map(i => (
              <rect key={i} x={i*10} y="0" width="5" height="68" fill="rgba(255,255,255,0.03)" />
            ))}
            {/* Border */}
            <rect x="1" y="1" width="98" height="66" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            {/* Center line */}
            <line x1="50" y1="1" x2="50" y2="67" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            {/* Center circle */}
            <circle cx="50" cy="34" r="9" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <circle cx="50" cy="34" r="0.6" fill="rgba(255,255,255,0.8)" />
            {/* Penalty areas */}
            <rect x="1" y="20" width="16" height="28" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <rect x="83" y="20" width="16" height="28" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            {/* Goal areas */}
            <rect x="1" y="26" width="5.5" height="16" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <rect x="83" y="26" width="5.5" height="16" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            {/* Goals */}
            <rect x="0" y="29" width="1" height="10" fill="rgba(255,255,255,0.3)" />
            <rect x="99" y="29" width="1" height="10" fill="rgba(255,255,255,0.3)" />
            {/* Corner arcs */}
            <path d="M 1 2 A 1 1 0 0 1 2 1" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <path d="M 98 1 A 1 1 0 0 1 99 2" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <path d="M 1 66 A 1 1 0 0 0 2 67" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
            <path d="M 98 67 A 1 1 0 0 0 99 66" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />

            {/* Strokes */}
            {strokes.map((s, i) => renderStroke(s, i))}
            {current && renderStroke(current, 'current', true)}

            {/* Players */}
            {players.map(p => (
              <g key={p.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: tool === 'select' ? 'grab' : 'default' }}>
                <circle r="3.2" fill={p.side === 'team' ? '#2563eb' : '#ef4444'} stroke="#fff" strokeWidth="0.4" />
                <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="2.6" fontWeight="700">{p.n}</text>
              </g>
            ))}
          </svg>
          <div className="ed-pitch-labels">
            <span>{teamName}</span>
            <span>{opponent}</span>
          </div>
        </div>

        {/* Side panel */}
        <aside className="ed-side">
          <div className="ed-panel">
            <h3>{t('players')}</h3>
            <div className="ed-player-list">
              {players.map(p => (
                <div key={p.id} className={`ed-player-row ${selected === p.id ? 'active' : ''}`} onClick={() => setSelected(p.id)}>
                  <span className="ed-player-dot" style={{ background: p.side === 'team' ? '#2563eb' : '#ef4444' }}>{p.n}</span>
                  <span>{p.side === 'team' ? teamName : opponent} #{p.n}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ed-panel">
            <h3>{t('media')}</h3>
            <div className="ed-media-add">
              <input className="ed-input" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder={t('mediaPlaceholder')} />
              <button className="ed-btn primary" onClick={addMedia}>{t('addMedia')}</button>
            </div>
            <div className="ed-media-list">
              {media.length === 0 && <p className="ed-muted">{t('noMedia')}</p>}
              {media.map((m, i) => (
                <div key={i} className="ed-media-item">
                  {m.type === 'image' ? <img src={m.url} alt="" /> : <video src={m.url} controls />}
                  <button className="ed-btn" onClick={() => removeMedia(i)}>{t('remove')}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="ed-panel">
            <h3>{t('notes')}</h3>
            <textarea className="ed-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notesPlaceholder')} rows={6} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function renderStroke(s, i, isCurrent = false) {
  if (s.type === 'arrow' || s.type === 'line') {
    const pts = s.points;
    if (pts.length < 2) return null;
    const d = pts.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const ang = Math.atan2(last.y - prev.y, last.x - prev.x) * 180 / Math.PI;
    const color = isCurrent ? '#fbbf24' : '#22d3ee';
    return (
      <g key={i}>
        <path d={d} fill="none" stroke={color} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
        {s.type === 'arrow' && (
          <polygon points="0,-1.2 2.4,0 0,1.2" fill={color} transform={`translate(${last.x},${last.y}) rotate(${ang})`} />
        )}
      </g>
    );
  }
  return null;
}