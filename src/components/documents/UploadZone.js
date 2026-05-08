import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { documentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, FileText, Music, Video, X, CheckCircle } from 'lucide-react';

const UploadZone = ({ onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
    },
    maxSize: 100 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await documentAPI.upload(file, setProgress);
      toast.success(`"${file.name}" uploaded successfully!`);
      setFile(null);
      setProgress(0);
      onUploaded?.(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (name) => {
    if (!name) return <Upload size={36} color="var(--text-muted)" />;
    if (name.match(/\.(mp3|wav|ogg|m4a)$/i)) return <Music size={36} color="#fbbf24" />;
    if (name.match(/\.(mp4|avi|mov|mkv|webm)$/i)) return <Video size={36} color="#60a5fa" />;
    return <FileText size={36} color="#f87171" />;
  };

  return (
    <div style={styles.wrapper}>
      <div
        {...getRootProps()}
        style={{
          ...styles.dropzone,
          borderColor: isDragActive ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)',
          background: isDragActive ? 'var(--accent-dim)' : file ? 'rgba(34,197,94,0.05)' : 'var(--bg-hover)',
        }}
      >
        <input {...getInputProps()} />

        {file ? (
          <div style={styles.filePreview}>
            {getFileIcon(file.name)}
            <div style={styles.fileName}>{file.name}</div>
            <div style={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        ) : (
          <div style={styles.placeholder}>
            <Upload size={36} color="var(--text-muted)" />
            <p style={styles.dropText}>
              {isDragActive ? 'Drop it here!' : 'Drag & drop or click to browse'}
            </p>
            <p style={styles.dropHint}>PDF, MP3, MP4, WAV, MOV — up to 100MB</p>
          </div>
        )}
      </div>

      {uploading && (
        <div style={styles.progressWrap}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <span style={styles.progressText}>{progress}%</span>
        </div>
      )}

      <div style={styles.actions}>
        {file && !uploading && (
          <>
            <button onClick={() => setFile(null)} className="btn btn-ghost">
              <X size={14} /> Remove
            </button>
            <button onClick={handleUpload} className="btn btn-primary">
              <Upload size={14} /> Upload File
            </button>
          </>
        )}
        {uploading && (
          <button disabled className="btn btn-primary">
            <span className="loading-spinner" /> Uploading...
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 12 },
  dropzone: {
    border: '2px dashed',
    borderRadius: 'var(--radius)',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: 160,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  dropText: { fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' },
  dropHint: { fontSize: 13, color: 'var(--text-muted)' },
  filePreview: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  fileName: { fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 300, wordBreak: 'break-all' },
  fileSize: { fontSize: 12, color: 'var(--text-muted)' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  progressBar: { flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' },
  progressText: { fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', width: 36 },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
};

export default UploadZone;
