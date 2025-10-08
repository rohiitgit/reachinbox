import React, { useState } from 'react';
import { EmailCategory, SearchParams } from '../types';

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState<EmailCategory | ''>('');

  const handleSearch = () => {
    onSearch({
      q: query || undefined,
      accountId: accountId || undefined,
      category: category || undefined
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Search emails..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        style={styles.input}
      />

      <select
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        style={styles.select}
      >
        <option value="">All Accounts</option>
        <option value="account_1">Account 1</option>
        <option value="account_2">Account 2</option>
      </select>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as EmailCategory | '')}
        style={styles.select}
      >
        <option value="">All Categories</option>
        <option value={EmailCategory.INTERESTED}>Interested</option>
        <option value={EmailCategory.MEETING_BOOKED}>Meeting Booked</option>
        <option value={EmailCategory.NOT_INTERESTED}>Not Interested</option>
        <option value={EmailCategory.SPAM}>Spam</option>
        <option value={EmailCategory.OUT_OF_OFFICE}>Out of Office</option>
      </select>

      <button onClick={handleSearch} style={styles.button}>
        Search
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: 'white'
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer'
  }
};

export default SearchBar;
