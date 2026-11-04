import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { PageTitle, Modal, ErrorNotice } from '../components/UI';
import { getAllFiles, addFile, deleteFile } from '../services/db';
import './LibraryPage.css';

const T = {
  en: {
    library: 'Library', librarySub: 'Club media & documents',
    all: 'All Files', photos: 'Match Photos', clips: 'Training Clips', playbooks: 'Tactical Playbooks', docs: 'Official Documents',
    upload: 'Upload Media', uploadHint: 'Drag & drop or click to select files',
    search: 'Search files...', noFiles: 'No files yet', loading: 'Loading...',
    view: 'View', download: 'Download', delete: 'Delete', close: 'Close',
    fileName: 'File name', category: 'Category', size: 'Size', date: 'Date',
    uploadSuccess: 'Uploaded successfully', uploading: 'Uploading...',
    storageError: 'Storage error. Try smaller files.',
  },
  km: {
    library: 'បណ្ណាល័យ', librarySub: 'មេឌៀ និងឯកសារក្លឹប',
    all: 'ឯកសារទាំងអស់', photos: 'រូបភាពការប្រកួត', clips: 'វីដេអូហ្វឹកហាត់', playbooks: 'សៀវភៅយុទ្ធសាស្ត្រ', docs: 'ឯកសារផ្លូវការ',
    upload: 'បញ្ចូលមេឌៀ', uploadHint: 'អូសទម្លាក់ ឬចុចដើម្បីជ្រើសរើសឯកសារ',
    search: 'ស្វែងរកឯកសារ...', noFiles: 'មិនទាន់មានឯកសារ', loading: 'កំពុងផ្ទុក...',
    view: 'មើល', download: 'ទាញយក', delete: 'លុប', close: 'បិទ',
    fileName: 'ឈ្មោះឯកសារ', category: 'ប្រភេទ', size: 'ទំហំ', date: 'កាលបរិច្ឆេទ',
    uploadSuccess: 'បានបញ្ចូលដោយជោគជ័យ', uploading: 'កំពុងបញ្ចូល...',
    storageError: 'កំហុសផ្ទុក។ សូមព្យាយាមឯកសារតូចជាង។',
  },
};

const CATEGORIES = [
  { key: 'all', label: 'all' },
  { key: 'photo', label: 'photos' },
  { key: 'clip', label: 'clips' },
  { key: 'playbook', label: 'playbooks' },
  { key: 'document', label: 'docs' },
];

const CATEGORY_LABELS = { photo: 'photos', clip: 'clips', playbook: 'playbooks', document: 'docs' };

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function categorize(file) {
  const type = file.type || '';
  const name = file.name.toLowerCase();
  if (type.startsWith('image/')) return 'photo';
  if (type.startsWith('video/')) return 'clip';
  if (name.endsWith('.pdf')) return 'document';
  return 'document';
}

export default function LibraryPage() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'km' ? 'km' : 'en';
  const t = (k) => T[lang][k] ?? T.en[k] ?? k;
  const canUpload = ['admin', 'coach'].includes(user?.role);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getAllFiles().then(data => {
      setFiles(data || []);
      setLoading(false);
    }).catch(() => { setError(t('storageError')); setLoading(false); });
  }, []);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList);
    if (arr.length === 0) return;
    setUploading(true);
    setError(null);
    const readers = arr.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        category: categorize(file),
        dataUrl: e.target.result,
        uploadedBy: user?.name || 'Unknown',
        uploadedAt: new Date().toISOString(),
      });
      reader.onerror = () => reject(new Error('Failed to read ' + file.name));
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(results => {
      // Save each file to IndexedDB
      Promise.all(results.map(f => addFile(f))).then(() => {
        setFiles(prev => [...results, ...prev]);
        setUploading(false);
      }).catch(() => {
        setError(t('storageError'));
        setUploading(false);
      });
    }).catch((err) => { setError(err.message || 'Upload failed'); setUploading(false); });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const removeFile = (id) => {
    deleteFile(id).then(() => {
      setFiles(prev => prev.filter(f => f.id !== id));
      if (viewing?.id === id) setViewing(null);
    }).catch(() => setError(t('storageError')));
  };

  const downloadFile = (file) => {
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
  };

  const filtered = files.filter(f => {
    if (category !== 'all' && f.category !== category) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const isImage = (f) => f.type?.startsWith('image/');
  const isVideo = (f) => f.type?.startsWith('video/');

  return (
    <div className="lib">
      <PageTitle title={t('library')} subtitle={t('librarySub')} />

      <div className="lib-tabs">
        {CATEGORIES.map(c => (
          <button key={c.key} className={`lib-tab ${category === c.key ? 'active' : ''}`} onClick={() => setCategory(c.key)}>
            {t(c.label)}
          </button>
        ))}
        <div className="lib-search-wrap">
          <input className="lib-search" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {canUpload && (
        <div
          className={`lib-upload-zone ${dragOver ? 'dragover' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
          <div className="lib-upload-icon">⬆</div>
          <div className="lib-upload-text">
            {uploading ? t('uploading') : t('upload')}
          </div>
          <div className="lib-upload-hint">{t('uploadHint')}</div>
        </div>
      )}

      {error && <ErrorNotice error={error} />}

      {loading ? (
        <div className="lib-empty">{t('loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="lib-empty">{t('noFiles')}</div>
      ) : (
        <div className="lib-grid">
          {filtered.map(f => (
            <div key={f.id} className="lib-card" onClick={() => setViewing(f)}>
              <div className="lib-card-thumb">
                {isImage(f) && <img src={f.dataUrl} alt={f.name} />}
                {isVideo(f) && <video src={f.dataUrl} />}
                {!isImage(f) && !isVideo(f) && <div className="lib-card-fileicon">📄</div>}
              </div>
              <div className="lib-card-info">
                <div className="lib-card-name" title={f.name}>{f.name}</div>
                <div className="lib-card-meta">
                  <span>{t(CATEGORY_LABELS[f.category])}</span>
                  <span>{formatSize(f.size)}</span>
                </div>
              </div>
              <div className="lib-card-actions" onClick={e => e.stopPropagation()}>
                <button className="lib-card-btn" onClick={() => setViewing(f)}>{t('view')}</button>
                <button className="lib-card-btn" onClick={() => downloadFile(f)}>{t('download')}</button>
                {canUpload && <button className="lib-card-btn danger" onClick={() => removeFile(f.id)}>{t('delete')}</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)}>
          <div className="lib-viewer">
            {isImage(viewing) && <img src={viewing.dataUrl} alt={viewing.name} className="lib-viewer-img" />}
            {isVideo(viewing) && <video src={viewing.dataUrl} controls className="lib-viewer-video" />}
            {!isImage(viewing) && !isVideo(viewing) && (
              <div className="lib-viewer-doc">
                <div className="lib-viewer-docicon">📄</div>
                <p>{viewing.name}</p>
              </div>
            )}
            <div className="lib-viewer-meta">
              <div><small>{t('category')}</small><b>{t(CATEGORY_LABELS[viewing.category])}</b></div>
              <div><small>{t('size')}</small><b>{formatSize(viewing.size)}</b></div>
              <div><small>{t('date')}</small><b>{new Date(viewing.uploadedAt).toLocaleDateString()}</b></div>
            </div>
            <div className="lib-viewer-actions">
              <button className="lib-btn" onClick={() => downloadFile(viewing)}>{t('download')}</button>
              <button className="lib-btn" onClick={() => setViewing(null)}>{t('close')}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}