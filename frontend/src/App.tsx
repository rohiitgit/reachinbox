import React, { useState, useEffect } from 'react';
import { Email, SearchParams } from './types';
import { emailApi } from './services/api';
import SearchBar from './components/SearchBar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';

const App: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadEmails({});
    loadConnectionStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadEmails({});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadEmails = async (params: SearchParams) => {
    setLoading(true);
    try {
      const response = await emailApi.searchEmails(params);
      if (response.success && response.data) {
        setEmails(response.data);

        // Update selected email if it exists in the new results
        if (selectedEmail) {
          const updatedEmail = response.data.find(e => e.id === selectedEmail.id);
          if (updatedEmail) {
            setSelectedEmail(updatedEmail);
          }
        }
      }
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnectionStatus = async () => {
    try {
      const response = await emailApi.getConnectionStatus();
      if (response.success && response.data) {
        setConnectionStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading connection status:', error);
    }
  };

  const handleSearch = (params: SearchParams) => {
    loadEmails(params);
  };

  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail(email);

    // Fetch full email details
    try {
      const response = await emailApi.getEmailById(email.id);
      if (response.success && response.data) {
        setSelectedEmail(response.data);
      }
    } catch (error) {
      console.error('Error loading email details:', error);
    }
  };

  const handleEmailUpdated = () => {
    // Reload emails and selected email
    loadEmails({});
    if (selectedEmail) {
      handleSelectEmail(selectedEmail);
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Reachinbox Email Onebox</h1>
        <div style={styles.status}>
          {Object.entries(connectionStatus).map(([account, connected]) => (
            <div key={account} style={styles.statusItem}>
              <span
                style={{
                  ...styles.statusDot,
                  backgroundColor: connected ? '#10b981' : '#ef4444'
                }}
              />
              {account}
            </div>
          ))}
        </div>
      </header>

      <SearchBar onSearch={handleSearch} />

      <div style={styles.main}>
        <div style={styles.listContainer}>
          {loading ? (
            <div style={styles.loading}>Loading emails...</div>
          ) : (
            <EmailList
              emails={emails}
              selectedEmail={selectedEmail}
              onSelectEmail={handleSelectEmail}
            />
          )}
        </div>

        <div style={styles.detailContainer}>
          {selectedEmail ? (
            <EmailDetail email={selectedEmail} onEmailUpdated={handleEmailUpdated} />
          ) : (
            <div style={styles.placeholder}>
              <p>Select an email to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f9fafb'
  },
  header: {
    padding: '16px 24px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827'
  },
  status: {
    display: 'flex',
    gap: '16px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6b7280'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  listContainer: {
    width: '400px',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column'
  },
  detailContainer: {
    flex: 1,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column'
  },
  loading: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6b7280'
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: '16px'
  }
};

export default App;
