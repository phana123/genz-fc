import { useEffect, useMemo, useState } from 'react';
import { Link } from '../routing';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Modal, ErrorNotice } from '../components/UI';
import './SquadsPage.css';

const POSITIONS = ['Goalkeeper', 'Centre-back', 'Right full-back', 'Left full-back', 'Defender', 'Midfielder', 'Left winger', 'Right winger', 'Winger', 'Forward', 'Striker'];
const AVAILABILITY_TO_STATUS = { Available: 'active', Injured: 'injured', Unavailable: 'inactive' };
const STATUS_TO_AVAILABILITY = { active: 'Available', injured: 'Injured', inactive: 'Unavailable' };

const blank = {
  name: '', email: '', password: '', jersey_number: '', position: '', phone: '',
  status: 'active', coach_note: '', role_in_model: '', age: '', height_cm: '', weight_kg: '',
  preferred_foot: 'Right', availability: 'Available', photoFile: null, removePhoto: false,
};

const initialsOf = (n = '') => n.split(' ').filter(Boolean).map(x => x[0]).join('').slice(0, 2).toUpperCase();
const ageFrom = dob => (dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000) : '');
const calcBmi = (h, w) => {
  const height = parseFloat(h), weight = parseFloat(w);
  return height > 0 && weight > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : '-';
};

export default function SquadsPage() {
  const { user } = useAuth();
  const canEdit = ['admin', 'coach'].includes(user?.role);

  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blank);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const { data } = await api.get('/players', { params: { search } });
      setPlayers(data.data);
      return data.data;
    } catch (e) { setError(e); return []; }
  }

  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [search]);
  useEffect(() => () => { if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  function fillForm(player) {
    const p = player.player_profile || {};
    setForm({
      ...blank,
      name: player.name, email: player.email,
      jersey_number: p.jersey_number ?? '', position: p.position || '', phone: p.phone || '',
      status: p.status || 'active',
      coach_note: p.coach_note || p.notes || '',
      role_in_model: p.role_in_model || '',
      age: ageFrom(p.date_of_birth),
      height_cm: p.height_cm ?? '', weight_kg: p.weight_kg ?? '',
      preferred_foot: p.preferred_foot || 'Right',
      availability: STATUS_TO_AVAILABILITY[p.status] || 'Available',
    });
    setPhotoPreview(p.photo_path ? `/storage/${p.photo_path}` : null);
  }

  function select(player) { setSelected(player); fillForm(player); setError(null); }
  function openAdd() { setForm(blank); setPhotoPreview(null); setError(null); setAdding(true); }

  function change(e) {
    const { name, value } = e.target;
    setForm(f => {
      const next = { ...f, [name]: value };
      if (name === 'availability') next.status = AVAILABILITY_TO_STATUS[value];
      if (name === 'status') next.availability = STATUS_TO_AVAILABILITY[value];
      return next;
    });
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, photoFile: file, removePhoto: false }));
  }

  function removePhoto() {
    setPhotoPreview(null);
    setForm(f => ({ ...f, photoFile: null, removePhoto: true }));
  }

  async function save(e) {
    e?.preventDefault();
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      ['name', 'email', 'password', 'jersey_number', 'position', 'phone', 'status', 'coach_note',
        'role_in_model', 'preferred_foot', 'height_cm', 'weight_kg'].forEach(k => {
        if (form[k] !== '' && form[k] != null) fd.append(k, form[k]);
      });
      if (form.photoFile) fd.append('photo', form.photoFile);
      if (form.removePhoto) fd.append('remove_photo', '1');

      if (selected && !adding) await api.post(`/players/${selected.id}?_method=PUT`, fd);
      else await api.post('/players', fd);

      const list = await load();
      if (selected && !adding) {
        const updated = list.find(p => p.id === selected.id);
        if (updated) select(updated);
      }
      setAdding(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error');
    } finally { setBusy(false); }
  }

  async function remove() {
    if (!selected || !window.confirm(`Delete ${selected.name}?`)) return;
    try {
      await api.delete(`/players/${selected.id}`);
      setSelected(null); setForm(blank); setPhotoPreview(null);
      load();
    } catch (err) { setError(err.response?.data?.message || err.message); }
  }

  // Opens in Excel; no extra library needed
  function exportExcel() {
    const rows = [['Name', 'Number', 'Position', 'Foot', 'Height (cm)', 'Weight (kg)', 'Status']];
    players.forEach(p => {
      const pr = p.player_profile || {};
      rows.push([p.name, pr.jersey_number, pr.position, pr.preferred_foot, pr.height_cm, pr.weight_kg, pr.status]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'squad.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(() => players.filter(p =>
    statusFilter === 'all' || (p.player_profile?.status || 'active') === statusFilter), [players, statusFilter]);

  const total = players.length;
  const available = players.filter(p => (p.player_profile?.status || 'active') === 'active').length;
  const bmi = calcBmi(form.height_cm, form.weight_kg);
  const positionOptions = form.position && !POSITIONS.includes(form.position) ? [form.position, ...POSITIONS] : POSITIONS;
  const badge = s => (s === 'injured' ? 'Injured' : s === 'inactive' ? 'Unavailable' : 'Available');

  return <div className="sq">
    {/* Header */}
    <header className="sq-header">
      <div>
        <h1>Squad</h1>
        <div className="sq-actions">
          {canEdit && <button className="sq-btn primary" onClick={openAdd}>New player</button>}
          <button className="sq-btn" onClick={exportExcel}>Export Excel</button>
          <Link className="sq-btn" to="/">Back to dashboard</Link>
        </div>
      </div>
      <div className="sq-stats">
        <div className="sq-stat"><small>TOTAL PLAYERS</small><b>{total}</b><span>Club roster</span></div>
        <div className="sq-stat"><small>AVAILABLE</small><b>{available}</b><span>Ready for selection</span></div>
      </div>
    </header>

    <div className="sq-body">
      {/* Left list */}
      <aside className="sq-card sq-list">
        <small className="sq-eyebrow">SQUAD</small>
        <h2>Players</h2>
        <input className="sq-input" placeholder="Search player" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="sq-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Available</option>
          <option value="injured">Injured</option>
          <option value="inactive">Unavailable</option>
        </select>
        <p className="sq-muted">Players stored locally.</p>

        <div className="sq-list-scroll">
          {filtered.map(player => {
            const p = player.player_profile || {};
            return <button key={player.id} type="button"
              className={`sq-player ${selected?.id === player.id ? 'active' : ''}`}
              onClick={() => select(player)}>
              <span className="sq-thumb">
                {p.photo_path ? <img src={`/storage/${p.photo_path}`} alt="" /> : initialsOf(player.name)}
              </span>
              <span className="sq-player-info">
                <b>{player.name}</b>
                <small>#{p.jersey_number} · {p.position}</small>
                <span className="sq-chips">
                  {p.preferred_foot && <i>{p.preferred_foot}</i>}
                  {p.height_cm && <i>{p.height_cm} cm</i>}
                  {p.weight_kg && <i>{p.weight_kg} kg</i>}
                </span>
              </span>
              <span className={`sq-badge ${p.status || 'active'}`}>{badge(p.status || 'active')}</span>
            </button>;
          })}
          {filtered.length === 0 && <p className="sq-muted">No results.</p>}
        </div>
      </aside>

      {/* Right profile */}
      <section className="sq-card sq-profile">
        <small className="sq-eyebrow">PROFILE</small>
        <h2>Player profile</h2>
        <p className="sq-muted">General profile, availability and base identity of the player.</p>

        {selected ? (
          <form className="sq-profile-grid" onSubmit={save}>
            <div className="sq-photo-card">
              <div className="sq-photo">
                {photoPreview ? <img src={photoPreview} alt="" /> : <span>{initialsOf(form.name)}</span>}
              </div>
              <h3>{form.name}</h3>
              <small className="sq-muted">#{form.jersey_number} · {form.position} · {form.availability}</small>
              <div className="sq-tiles">
                <div><small>POSITION ID</small><b>{form.position || '-'}</b></div>
                <div><small>PREFERRED FOOT ID</small><b>{form.preferred_foot}</b></div>
                <div><small>AVAILABILITY</small><b>{form.availability}</b></div>
                <div><small>BMI</small><b>{bmi}</b></div>
              </div>
            </div>

            <div className="sq-fields">
              <label className="span2"><small>NAME</small>
                <input name="name" value={form.name} onChange={change} disabled={!canEdit} /></label>
              <label><small>NUMBER</small>
                <input name="jersey_number" value={form.jersey_number} onChange={change} disabled={!canEdit} /></label>
              <label><small>AGE</small><input value={form.age} readOnly /></label>
              <label><small>POSITION</small>
                <select name="position" value={form.position} onChange={change} disabled={!canEdit}>
                  <option value="">—</option>
                  {positionOptions.map(o => <option key={o}>{o}</option>)}
                </select></label>
              <label><small>PREFERRED FOOT</small>
                <select name="preferred_foot" value={form.preferred_foot} onChange={change} disabled={!canEdit}>
                  <option>Right</option><option>Left</option>
                </select></label>
              <label><small>AVAILABILITY</small>
                <select name="availability" value={form.availability} onChange={change} disabled={!canEdit}>
                  <option>Available</option><option>Injured</option><option>Unavailable</option>
                </select></label>
              <label><small>HEIGHT (CM)</small>
                <input type="number" min="0" name="height_cm" value={form.height_cm} onChange={change} disabled={!canEdit} /></label>
              <label><small>WEIGHT (KG)</small>
                <input type="number" min="0" name="weight_kg" value={form.weight_kg} onChange={change} disabled={!canEdit} /></label>

              {canEdit && <div className="span2">
                <small className="sq-label">PLAYER PHOTO</small>
                <div className="sq-row">
                  <label className="sq-btn">Add photo<input type="file" accept="image/*" hidden onChange={handlePhoto} /></label>
                  <button type="button" className="sq-btn" onClick={removePhoto}>Remove photo</button>
                </div>
              </div>}

              <label className="span2"><small>ROLE IN MODEL</small>
                <input name="role_in_model" value={form.role_in_model} onChange={change} disabled={!canEdit} /></label>
              <label className="span2"><small>COACH NOTE</small>
                <textarea name="coach_note" rows="4" value={form.coach_note} onChange={change} disabled={!canEdit} /></label>

              <div className="span2"><ErrorNotice error={error} /></div>

              {canEdit && <div className="span2 sq-row">
                <button className="sq-btn primary" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
                <button type="button" className="sq-btn" onClick={() => fillForm(selected)}>Reset</button>
                <button type="button" className="sq-btn danger" onClick={remove}>Delete</button>
              </div>}
            </div>
          </form>
        ) : <p className="sq-empty">Select a player to view profile</p>}
      </section>
    </div>

    {adding && <Modal title="New player" onClose={() => setAdding(false)}>
      <form className="sq-fields" onSubmit={save}>
        <label className="span2"><small>NAME</small><input name="name" value={form.name} onChange={change} required /></label>
        <label className="span2"><small>EMAIL</small><input type="email" name="email" value={form.email} onChange={change} required /></label>
        <label className="span2"><small>PASSWORD</small><input type="password" name="password" value={form.password} onChange={change} minLength="8" required /></label>
        <label><small>NUMBER</small><input name="jersey_number" value={form.jersey_number} onChange={change} /></label>
        <label><small>POSITION</small>
          <select name="position" value={form.position} onChange={change}>
            <option value="">—</option>
            {POSITIONS.map(o => <option key={o}>{o}</option>)}
          </select></label>
        <label><small>PHONE</small><input name="phone" value={form.phone} onChange={change} /></label>
        <label><small>STATUS</small>
          <select name="status" value={form.status} onChange={change}>
            <option value="active">Active</option><option value="injured">Injured</option><option value="inactive">Inactive</option>
          </select></label>
        <div className="span2"><ErrorNotice error={error} /></div>
        <div className="span2 sq-row">
          <button type="button" className="sq-btn" onClick={() => setAdding(false)}>Cancel</button>
          <button className="sq-btn primary" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>}
  </div>;
}