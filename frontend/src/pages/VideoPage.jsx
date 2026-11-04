import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { PageTitle, Modal, ErrorNotice } from '../components/UI';
import { getAllFiles, addFile, deleteFile } from '../services/db';
import './VideoPage.css';

const T = {
  en: {
    video: 'Video Analysis', videoSub: 'Match clips & analysis',
    upload: 'Upload Video', uploadHint: 'Drag & drop or click to select video files',
    search: 'Search videos...', noFiles: 'No videos yet', loading: 'Loading...',
    view: 'Play', download: 'Download', delete: 'Delete', close: 'Close',
    fileName: 'File name', size: 'Size', date: 'Date',
    uploading: 'Uploading...', storageError: 'Storage error. Try smaller files.',
  },
  km: {
    video: 'វិភាគវីដេអូ', videoSub: 'ក្លីបប្រកួត និងការវិភាគ',
    upload: 'បញ្ចូលវីដេអូ', uploadHint: 'អូសទម្លាក់ ឬចុចដើម្បីជ្រើសរើសវីដេអូ',
    search: 'ស្វែងរកវីដេអូ...', noFiles: 'មិនទាន់មានវីដេអូ', loading: 'កំពុងផ្ទុក...',
    view: 'ចាក់', download: 'ទាញយក', delete: 'លុប', close: 'បិទ',
    fileName: 'ឈ្មោះឯកសារ', size: 'ទំហំ', date: 'កាលបរិច្ឆេទ',
    uploading: 'កំពុងបញ្ចូល...', storageError: 'កំហុសផ្ទុក។',
  },
};

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function VideoPage() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'km' ? 'km' : 'en';
  const t = (k) => T[lang][k] ?? T.en[k] ?? k;
  const canUpload = ['admin', 'coach'].includes(user?.role);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getAllFiles().then(data => {
      setFiles((data || []).filter(f => f.type?.startsWith('video/')));
      setLoading(false);
    }).catch(() => { setError(t('storageError')); setLoading(false); });
  }, []);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList).filter(f => f.type?.startsWith('video/'));
    if (arr.length === 0) { setError('Only video files are allowed'); return; }
    setUploading(true);
    setError(null);
    const readers = arr.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        category: 'clip',
        dataUrl: e.target.result,
        uploadedBy: user?.name || 'Unknown',
        uploadedAt: new Date().toISOString(),
      });
      reader.onerror = () => reject(new Error('Failed to read ' + file.name));
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(results => {
      Promise.all(results.map(f => addFile(f))).then(() => {
        setFiles(prev => [...results, ...prev]);
        setUploading(false);
      }).catch(() => { setError(t('storageError')); setUploading(false); });
    }).catch((err) => { setError(err.message || 'Upload failed'); setUploading(false); });
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const removeFile = (id) => {
    deleteFile(id).then(() => {
      setFiles(prev => prev.filter(f => f.id !== id));
      if (viewing?.id === id) setViewing(null);
    }).catch(() => setError(t('storageError')));
  };

  const downloadFile = (file) => {
    const a = document.createElement('a'); a.href = file.dataUrl; a.download = file.name; a.click();
  };

  const filtered = files.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="vid">
      <PageTitle title={t('video')} subtitle={t('videoSub')} />

      <div className="vid-toolbar">
        <input className="vid-search" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {canUpload && (
        <div
          className={`vid-upload-zone ${dragOver ? 'dragover' : ''}`}
          onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
          <div className="vid-upload-icon">🎬</div>
          <div className="vid-upload-text">{uploading ? t('uploading') : t('upload')}</div>
          <div className="vid-upload-hint">{t('uploadHint')}</div>
        </div>
      )}

      {error && <ErrorNotice error={error} />}

      {loading ? (
        <div className="vid-empty">{t('loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="vid-empty">{t('noFiles')}</div>
      ) : (
        <div className="vid-grid">
          {filtered.map(f => (
            <div key={f.id} className="vid-card">
              <div className="vid-card-thumb" onClick={() => setViewing(f)}>
                <video src={f.dataUrl} />
                <div className="vid-card-play">▶</div>
              </div>
              <div className="vid-card-info">
                <div className="vid-card-name" title={f.name}>{f.name}</div>
                <div className="vid-card-meta">
                  <span>{formatSize(f.size)}</span>
                  <span>{new Date(f.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="vid-card-actions">
                <button className="vid-card-btn" onClick={() => setViewing(f)}>{t('view')}</button>
                <button className="vid-card-btn" onClick={() => downloadFile(f)}>{t('download')}</button>
                {canUpload && <button className="vid-card-btn danger" onClick={() => removeFile(f.id)}>{t('delete')}</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)} wide>
          <div className="vid-viewer">
            <video src={viewing.dataUrl} controls className="vid-viewer-video" />
            <div className="vid-viewer-actions">
              <button className="vid-btn" onClick={() => downloadFile(viewing)}>{t('download')}</button>
              <button className="vid-btn" onClick={() => setViewing(null)}>{t('close')}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}