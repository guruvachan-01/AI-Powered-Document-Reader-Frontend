import React from 'react';
import { useNavigate } from 'react-router-dom';
import { documentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, Music, Video, Trash2, MessageSquare, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const DocumentCard = ({ doc, onDeleted }) => {
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document and all its chat history?')) return;
    try {
      await documentAPI.delete(doc.id);
      toast.success('Document deleted');
      onDeleted?.(doc.id);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const icons = {
    PDF: <FileText size={20} color="#f87171" />,
    AUDIO: <Music size={20} color="#fbbf24" />,
    VIDEO: <Video size={20} color="#60a5fa" />,
  };

  const badgeClass = {
    PDF: 'badge badge-pdf',
    AUDIO: 'badge badge-audio',
    VIDEO: 'badge badge-video',
  };

  return (
    <div style={styles.card} className="card">
      <div style={styles.header}>
        <div style={styles.typeIcon}>{icons[doc.fileType]}</div>
        <span className={badgeClass[doc.fileType]}>{doc.fileType}</span>
      </div>

      <div style={styles.name} title={doc.originalFilename}>
        {doc.originalFilename}
      </div>

      {doc.summary ? (
        <p style={styles.summary}>{doc.summary.substring(0, 120)}...</p>
      ) : (
        <p style={styles.processing}>
          <span style={{ animation: 'pulse 1.5s infinite' }}>⚙</span> Processing...
        </p>
      )}

      <div style={styles.meta}>
        <span style={styles.metaItem}>
          <Clock size={12} />
          {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
        </span>
        <span style={styles.metaItem}>
          {(doc.fileSize / 1024).toFixed(0)} KB
        </span>
      </div>

      <div style={styles.actions}>
        <button
          onClick={() => navigate(`/chat/${doc.id}`)}
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: 13 }}
        >
          <MessageSquare size={14} /> Chat
        </button>
        <button onClick={handleDelete} className="btn btn-danger" style={{ padding: '8px 12px' }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const DocumentList = ({ documents, onDeleted }) => {
  if (!documents.length) {
    return (
      <div style={styles.empty}>
        <FileText size={40} color="var(--text-muted)" />
        <p>No documents yet. Upload your first file!</p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {documents.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} onDeleted={onDeleted} />
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  card: { display: 'flex', flexDirection: 'column', gap: 12, transition: 'border-color 0.2s', cursor: 'default' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  typeIcon: {
    width: 36, height: 36, borderRadius: 8,
    background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  name: {
    fontSize: 14, fontWeight: 500,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  summary: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 },
  processing: { fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' },
  meta: { display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4 },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  empty: {
    textAlign: 'center', padding: '60px 24px',
    color: 'var(--text-muted)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12,
  },
};

export default DocumentList;
