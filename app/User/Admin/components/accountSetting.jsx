'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../css/accountSettings.module.css';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className={styles.adminFieldIcon} aria-hidden="true">
    <path d={d} />
  </svg>
);

const icons = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0l8 8 8-8',
  lock: 'M17 11V7a5 5 0 0 0-10 0v4M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z',
};

const FieldDisplay = ({ icon, label, value, masked = false }) => (
  <div className={styles.adminFieldRow}>
    <Icon d={icons[icon]} />
    <div className={styles.adminFieldBody}>
      <span className={styles.adminFieldLabel}>{label}</span>
      <span className={`${styles.adminFieldValue} ${masked ? styles.adminMasked : ''}`}>
        {masked ? '••••••••••' : (value || '—')}
      </span>
    </div>
  </div>
);

const FieldEdit = ({ icon, label, name, type = 'text', value, onChange, hint }) => (
  <div className={styles.adminFieldRow}>
    <Icon d={icons[icon]} />
    <div className={styles.adminFieldBody}>
      <label className={styles.adminFieldLabel} htmlFor={name}>{label}</label>
      <input
        id={name} name={name} type={type} value={value}
        onChange={onChange} className={styles.adminFieldInput} autoComplete="off"
      />
      {hint && <span className={styles.adminFieldHint}>{hint}</span>}
    </div>
  </div>
);

const Section = ({ title, children, editing, onEdit, onSave, onCancel, saved, loading, dirty }) => (
  <div className={styles.adminSection}>
    <div className={styles.adminSectionHeader}>
      <span className={styles.adminSectionTitle}>{title}</span>
      <div className={styles.adminHeaderActions}>
        {saved && <span className={styles.adminSavedBadge}>saved</span>}
        {editing ? (
          <>
            <button className={styles.adminCancelBtn} onClick={onCancel} disabled={loading}>Cancel</button>
            <button className={styles.adminSaveBtn} onClick={onSave} disabled={loading || !dirty}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </>
        ) : (
          <button className={styles.adminEditBtn} onClick={onEdit}>Edit</button>
        )}
      </div>
    </div>
    <div className={styles.adminSectionBody}>{children}</div>
  </div>
);

const EMPTY = { username: '', email: '' };

export default function AdminAccountSettings() {
  const [data, setData] = useState(EMPTY);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  const [accountDraft, setAccountDraft] = useState({ username: '', email: '', password: '' });

  const [editing, setEditing] = useState({ account: false });
  const [loading, setLoading] = useState({ account: false });
  const [saved, setSaved] = useState({ account: false });
  const [dirty, setDirty] = useState({ account: false });

  const fetchAccount = () =>
    fetch('/api/adminRo/account')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load account data.');
        return res.json();
      })
      .then(json => {
        setData(json);
        setAccountDraft({ username: json.username, email: json.email, password: '' });
      })
      .catch(err => setError(err.message))
      .finally(() => setFetching(false));

  useEffect(() => {
    fetchAccount();
  }, []);

  const initials = data.username ? data.username.slice(0, 2).toUpperCase() : '..';

  const handleAccountChange = useCallback(e => {
    const { name, value } = e.target;
    setAccountDraft(prev => ({ ...prev, [name]: value }));
    setDirty(prev => ({ ...prev, account: true }));
  }, []);

  const startEdit = section => {
    if (section === 'account') setAccountDraft({ username: data.username, email: data.email, password: '' });
    setEditing(prev => ({ ...prev, [section]: true }));
    setDirty(prev => ({ ...prev, [section]: false }));
    setError(null);
  };

  const cancelEdit = section => {
    setEditing(prev => ({ ...prev, [section]: false }));
    setDirty(prev => ({ ...prev, [section]: false }));
    setError(null);
  };

  const saveAccount = async () => {
    setLoading(prev => ({ ...prev, account: true }));
    setError(null);

    try {
      const res = await fetch('/api/admin/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: accountDraft.username.trim() || null,
          email: accountDraft.email.trim() || null,
          password: accountDraft.password.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to save.');

      await fetchAccount();
      setEditing(prev => ({ ...prev, account: false }));
      setDirty(prev => ({ ...prev, account: false }));
      setSaved(prev => ({ ...prev, account: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, account: false })), 2500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, account: false }));
    }
  };

  if (fetching) return <div className={styles.adminLoading}>Loading account…</div>;

  return (
    <div className={styles.adminRoot}>

      <div className={styles.adminProfileHeader}>
        <div className={styles.adminAvatar}>{initials}</div>
        <div className={styles.adminProfileMeta}>
          <h1 className={styles.adminProfileName}>{data.username}</h1>
          <p className={styles.adminProfileEmail}>{data.email}</p>
        </div>
      </div>

      {error && <p className={styles.adminErrorBanner}>{error}</p>}

      <div className={styles.adminSectionsGrid}>

        <Section
          title="Account Details"
          editing={editing.account}
          onEdit={() => startEdit('account')}
          onSave={saveAccount}
          onCancel={() => cancelEdit('account')}
          saved={saved.account}
          loading={loading.account}
          dirty={dirty.account}
        >
          {editing.account ? (
            <>
              <FieldEdit icon="user" label="Username" name="username"
                value={accountDraft.username} onChange={handleAccountChange} />
              <FieldEdit icon="mail" label="Email" name="email" type="email"
                value={accountDraft.email} onChange={handleAccountChange} />
              <FieldEdit icon="lock" label="New Password" name="password" type="password"
                value={accountDraft.password} onChange={handleAccountChange}
                hint="Leave blank to keep current password." />
            </>
          ) : (
            <>
              <FieldDisplay icon="user" label="Username" value={data.username} />
              <FieldDisplay icon="mail" label="Email" value={data.email} />
              <FieldDisplay icon="lock" label="Password" masked />
            </>
          )}
        </Section>

      </div>
    </div>
  );
}