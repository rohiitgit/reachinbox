import React, { useState } from 'react';
import { Email, EmailCategory } from '../types';
import { emailApi } from '../services/api';

interface EmailDetailProps {
  email: Email;
  onEmailUpdated: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, onEmailUpdated }) => {
  const [generatingReply, setGeneratingReply] = useState(false);

  const handleGenerateReply = async () => {
    setGeneratingReply(true);
    try {
      await emailApi.generateReply(email.id);
      onEmailUpdated();
    } catch (error) {
      console.error('Error generating reply:', error);
    } finally {
      setGeneratingReply(false);
    }
  };

  const getCategoryColor = (category?: EmailCategory): string => {
    switch (category) {
      case EmailCategory.INTERESTED:
        return '#10b981';
      case EmailCategory.MEETING_BOOKED:
        return '#3b82f6';
      case EmailCategory.NOT_INTERESTED:
        return '#ef4444';
      case EmailCategory.SPAM:
        return '#f59e0b';
      case EmailCategory.OUT_OF_OFFICE:
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.subject}>{email.subject}</h2>
          <div style={styles.meta}>
            <span style={styles.from}>
              {email.from.name || email.from.address}
              <span style={styles.email}> &lt;{email.from.address}&gt;</span>
            </span>
            <span style={styles.date}>
              {new Date(email.date).toLocaleString()}
            </span>
          </div>
        </div>
        <span
          style={{
            ...styles.categoryBadge,
            backgroundColor: getCategoryColor(email.category)
          }}
        >
          {email.category || 'Uncategorized'}
        </span>
      </div>

      <div style={styles.body}>
        {email.html ? (
          <iframe
            srcDoc={email.html}
            style={styles.iframe}
            sandbox="allow-same-origin"
          />
        ) : (
          <pre style={styles.text}>{email.body}</pre>
        )}
      </div>

      {email.suggestedReply && (
        <div style={styles.suggestedReply}>
          <h3 style={styles.replyTitle}>AI Suggested Reply</h3>
          <div style={styles.replyContent}>{email.suggestedReply}</div>
        </div>
      )}

      {!email.suggestedReply && (
        <button
          style={styles.button}
          onClick={handleGenerateReply}
          disabled={generatingReply}
        >
          {generatingReply ? 'Generating...' : 'Generate AI Reply'}
        </button>
      )}

      <div style={styles.metadata}>
        <div style={styles.metaItem}>
          <strong>Account:</strong> {email.accountId}
        </div>
        <div style={styles.metaItem}>
          <strong>Folder:</strong> {email.folder}
        </div>
        <div style={styles.metaItem}>
          <strong>UID:</strong> {email.uid}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  subject: {
    fontSize: '20px',
    fontWeight: 600,
    margin: '0 0 12px 0',
    color: '#111827'
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  from: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151'
  },
  email: {
    fontWeight: 400,
    color: '#6b7280'
  },
  date: {
    fontSize: '13px',
    color: '#9ca3af'
  },
  categoryBadge: {
    padding: '6px 12px',
    borderRadius: '6px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 500
  },
  body: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto'
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none'
  },
  text: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#374151',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  },
  suggestedReply: {
    margin: '16px 24px',
    padding: '16px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '8px'
  },
  replyTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#166534',
    margin: '0 0 8px 0'
  },
  replyContent: {
    fontSize: '14px',
    color: '#166534',
    lineHeight: '1.6'
  },
  button: {
    margin: '16px 24px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  metadata: {
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '24px',
    fontSize: '13px',
    color: '#6b7280'
  },
  metaItem: {
    display: 'flex',
    gap: '6px'
  }
};

export default EmailDetail;
