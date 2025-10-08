import React from 'react';
import { Email, EmailCategory } from '../types';

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
}

const EmailList: React.FC<EmailListProps> = ({ emails, selectedEmail, onSelectEmail }) => {
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div style={styles.container}>
      {emails.length === 0 ? (
        <div style={styles.empty}>No emails found</div>
      ) : (
        emails.map(email => (
          <div
            key={email.id}
            style={{
              ...styles.emailItem,
              backgroundColor: selectedEmail?.id === email.id ? '#f3f4f6' : 'white'
            }}
            onClick={() => onSelectEmail(email)}
          >
            <div style={styles.emailHeader}>
              <div style={styles.fromName}>
                {email.from.name || email.from.address}
              </div>
              <div style={styles.date}>{formatDate(email.date)}</div>
            </div>
            <div style={styles.subject}>{email.subject}</div>
            <div style={styles.preview}>
              {email.body.substring(0, 100)}...
            </div>
            <div style={styles.footer}>
              <span
                style={{
                  ...styles.category,
                  backgroundColor: getCategoryColor(email.category)
                }}
              >
                {email.category || 'Uncategorized'}
              </span>
              <span style={styles.account}>{email.accountId}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflowY: 'auto',
    borderRight: '1px solid #e5e7eb'
  },
  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#9ca3af'
  },
  emailItem: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  emailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  fromName: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#111827'
  },
  date: {
    fontSize: '12px',
    color: '#6b7280'
  },
  subject: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px'
  },
  preview: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.5',
    marginBottom: '8px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  category: {
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontWeight: 500
  },
  account: {
    fontSize: '11px',
    color: '#9ca3af'
  }
};

export default EmailList;
