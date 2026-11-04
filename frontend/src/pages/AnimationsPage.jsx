import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { PageTitle } from '../components/UI';
import './AnimationsPage.css';

const T = {
  en: {
    animations: 'Animations', animationsSub: 'Tactical animations & drills',
    play: 'Play', pause: 'Pause', reset: 'Reset', speed: 'Speed',
    selectAnim: 'Select Animation', noAnim: 'No animation selected',
    passing: 'Passing Drill', pressing: 'Pressing Drill', setPiece: 'Set-Piece', transition: 'Transition Drill',
  },
  km: {
    animations: 'ចលនា', animationsSub: 'ចលនាយុទ្ធសាស្ត្រ និងការហ្វឹកហាត់',
    play: 'ចាក់', pause: 'ផ្អាក', reset: 'កំណត់ឡើងវិញ', speed: 'ល្បឿន',
    selectAnim: 'ជ្រើសចលនា', noAnim: 'មិនទាន់ជ្រើសចលនា',
    passing: 'ការហ្វឹកហាត់បញ្ជូន', pressing: 'ការហ្វឹកហាត់សម្ពាធ', setPiece: 'បាល់ស្លាប់', transition: 'ការហ្វឹកហាត់ផ្លាស់ប្ដូរ',
  },
};

const ANIMATIONS = [
  { key: 'passing', label: 'passing' },
  { key: 'pressing', label: 'pressing' },
  { key: 'setPiece', label: 'setPiece' },
  { key: 'transition', label: 'transition' },
];

export default function AnimationsPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'km' ? 'km' : 'en';
  const t = (k) => T[lang][k] ?? T.en[k] ?? k;

  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="an">
      <PageTitle title={t('animations')} subtitle={t('animationsSub')} />

      <div className="an-toolbar">
        <select className="an-select" value={selected || ''} onChange={e => { setSelected(e.target.value); setPlaying(false); }}>
          <option value="">{t('selectAnim')}</option>
          {ANIMATIONS.map(a => <option key={a.key} value={a.key}>{t(a.label)}</option>)}
        </select>
        <button className="an-btn" onClick={() => setPlaying(p => !p)} disabled={!selected}>{playing ? t('pause') : t('play')}</button>
        <button className="an-btn" onClick={() => setPlaying(false)} disabled={!selected}>{t('reset')}</button>
        <label className="an-speed">
          {t('speed')}
          <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </label>
      </div>

      <div className="an-stage">
        {selected ? (
          <div className={`an-field an-${selected} ${playing ? 'playing' : ''}`} style={{ animationDuration: `${4 / speed}s` }}>
            <div className="an-pitch">
              <div className="an-center-circle" />
              <div className="an-player an-p1">1</div>
              <div className="an-player an-p2">2</div>
              <div className="an-player an-p3">3</div>
              <div className="an-player an-p4">4</div>
              <div className="an-ball" />
            </div>
          </div>
        ) : (
          <div className="an-empty">{t('noAnim')}</div>
        )}
      </div>
    </div>
  );
}