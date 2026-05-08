import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import UploadZone from '../components/documents/UploadZone';
import DocumentList from '../components/documents/DocumentList';
import { documentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, MessageSquare, HardDrive, Plus, X } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data } = await documentAPI.getAll();
      setDocuments(data);
    } finally {
      setLoading(false);
    }
  };

  const handleUploaded = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setShowUpload(false);
  };

  const handleDeleted = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const stats = {
    total: documents.length,
    pdfs: documents.filter((d) => d.fileType === 'PDF').length,
    media: documents.filter((d) => d.fileType !== 'PDF').length,
  };

  return (
    <Layout>
      <div style={styles.page}>
        {/* Page header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>My Documents</h1>
            <p style={styles.subtitle}>Welcome back, <strong>{user?.username}</strong></p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn btn-primary"
          >
            {showUpload ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Upload File</>}
          </button>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <StatCard icon={<FileText size={20} />} label="Total Files" value={stats.total} color="#6c63ff" />
          <StatCard icon={<FileText size={20} />} label="PDFs" value={stats.pdfs} color="#f87171" />
          <StatCard icon={<MessageSquare size={20} />} label="Media Files" value={stats.media} color="#60a5fa" />
        </div>

        {/* Upload zone */}
        {showUpload && (
          <div style={styles.uploadSection} className="card fade-in">
            <h3 style={styles.sectionTitle}>Upload New File</h3>
            <p style={styles.sectionSubtitle}>
              Upload PDF documents, audio, or video files to start asking questions.
            </p>
            <UploadZone onUploaded={handleUploaded} />
          </div>
        )}

        {/* Document list */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            All Documents
            <span style={styles.count}>{documents.length}</span>
          </h2>
          {loading ? (
            <div style={styles.loader}>
              <div className="loading-spinner" style={{ width: 28, height: 28 }} />
              <span style={{ color: 'var(--text-muted)' }}>Loading documents...</span>
            </div>
          ) : (
            <DocumentList documents={documents} onDeleted={handleDeleted} />
          )}
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={styles.statCard} className="card">
    <div style={{ ...styles.statIcon, background: `${color}20`, color }}>
      {icon}
    </div>
    <div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  </div>
);

const styles = {
  page: { padding: '28px 32px', maxWidth: 1100, margin: '0 auto' },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 28,
  },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  subtitle: { color: 'var(--text-secondary)', fontSize: 14 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { display: 'flex', alignItems: 'center', gap: 14, padding: 20 },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 24, fontWeight: 700 },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)' },
  uploadSection: { marginBottom: 28 },
  section: { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle: {
    fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
  },
  sectionSubtitle: { fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 4 },
  count: {
    background: 'var(--bg-hover)', border: '1px solid var(--border)',
    borderRadius: 20, padding: '1px 10px',
    fontSize: 12, color: 'var(--text-muted)', fontWeight: 400,
  },
  loader: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 12, padding: 40, color: 'var(--text-muted)',
  },
};

export default Dashboard;
