'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../css/Lister/AccountSettings.module.css';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className={styles.fieldIcon} aria-hidden="true">
    <path d={d} />
  </svg>
);

const icons = {
  user:     'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  lock:     'M17 11V7a5 5 0 0 0-10 0v4M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z',
  mail:     'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0l8 8 8-8',
  building: 'M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4',
  phone:    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  map:      'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
};

const FieldDisplay = ({ icon, label, value, masked = false }) => (
  <div className={styles.fieldRow}>
    <Icon d={icons[icon]} />
    <div className={styles.fieldBody}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={`${styles.fieldValue} ${masked ? styles.masked : ''}`}>
        {masked ? '••••••••••' : (value || '—')}
      </span>
    </div>
  </div>
);

const FieldEdit = ({ icon, label, name, type = 'text', value, onChange, hint }) => (
  <div className={styles.fieldRow}>
    <Icon d={icons[icon]} />
    <div className={styles.fieldBody}>
      <label className={styles.fieldLabel} htmlFor={name}>{label}</label>
      <input
        id={name} name={name} type={type} value={value}
        onChange={onChange} className={styles.fieldInput} autoComplete="off"
      />
      {hint && <span className={styles.fieldHint}>{hint}</span>}
    </div>
  </div>
);

const Section = ({ title, children, editing, onEdit, onSave, onCancel, saved, loading }) => (
  <div className={styles.section}>
    <div className={styles.sectionHeader}>
      <span className={styles.sectionTitle}>{title}</span>
      <div className={styles.headerActions}>
        {saved && <span className={styles.savedBadge}>saved</span>}
        {editing ? (
          <>
            <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>Cancel</button>
            <button className={styles.saveBtn} onClick={onSave} disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </>
        ) : (
          <button className={styles.editBtn} onClick={onEdit}>Edit</button>
        )}
      </div>
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </div>
);

const EMPTY = { username: '', email: '', contact: '', organisationName: '', ward: '' };

export default function AccountSettings() {
  const [data,     setData]     = useState(EMPTY);
  const [draft,    setDraft]    = useState({ ...EMPTY, password: '' });
  const [editing,  setEditing]  = useState({ personal: false, org: false });
  const [saved,    setSaved]    = useState({ personal: false, org: false });
  const [loading,  setLoading]  = useState({ personal: false, org: false });
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    fetch('/api/account')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load account data.');
        return res.json();
      })
      .then(json => {
        setData(json);
        setDraft({ ...json, password: '' });
      })
      .catch(err => setError(err.message))
      .finally(() => setFetching(false));
  }, []);

  const initials = data.username ? data.username.slice(0, 2).toUpperCase() : '..';

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setDraft(prev => ({ ...prev, [name]: value }));
  }, []);

  const startEdit = section => {
    setDraft({ ...data, password: '' });
    setEditing(prev => ({ ...prev, [section]: true }));
    setError(null);
  };

  const cancelEdit = section => {
    setDraft({ ...data, password: '' });
    setEditing(prev => ({ ...prev, [section]: false }));
    setError(null);
  };

  const saveSection = async section => {
    setLoading(prev => ({ ...prev, [section]: true }));
    setError(null);

    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, fields: draft }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to save.');

      /* Update local data — only non-password fields */
      setData(prev => ({
        ...prev,
        ...(section === 'personal' ? {
          username: draft.username,
          email:    draft.email,
          contact:  draft.contact,
        } : {
          organisationName: draft.organisationName,
          ward:             draft.ward,
        }),
      }));

      setEditing(prev => ({ ...prev, [section]: false }));
      setSaved(prev => ({ ...prev, [section]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [section]: false })), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  if (fetching) return <div className={styles.loading}>Loading account…</div>;

  return (
    <div className={styles.root}>

      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.profileMeta}>
          <h1 className={styles.profileName}>{data.username}</h1>
          <p className={styles.profileEmail}>{data.email}</p>
        </div>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      <div className={styles.sectionsGrid}>

        <Section
          title="Personal account"
          editing={editing.personal}
          onEdit={() => startEdit('personal')}
          onSave={() => saveSection('personal')}
          onCancel={() => cancelEdit('personal')}
          saved={saved.personal}
          loading={loading.personal}
        >
          {editing.personal ? (
            <>
              <FieldEdit icon="user"  label="Username" name="username" value={draft.username} onChange={handleChange} />
              <FieldEdit icon="mail"  label="Email"    name="email"    value={draft.email}    onChange={handleChange} type="email" />
              <FieldEdit icon="phone" label="Contact"  name="contact"  value={draft.contact}  onChange={handleChange} type="tel" />
              <FieldEdit icon="lock"  label="New password" name="password" value={draft.password} onChange={handleChange} type="password" hint="Leave blank to keep current password." />
            </>
          ) : (
            <>
              <FieldDisplay icon="user"  label="Username" value={data.username} />
              <FieldDisplay icon="mail"  label="Email"    value={data.email} />
              <FieldDisplay icon="phone" label="Contact"  value={data.contact} />
              <FieldDisplay icon="lock"  label="Password" masked />
            </>
          )}
        </Section>

        <Section
          title="Organisation"
          editing={editing.org}
          onEdit={() => startEdit('org')}
          onSave={() => saveSection('org')}
          onCancel={() => cancelEdit('org')}
          saved={saved.org}
          loading={loading.org}
        >
          {editing.org ? (
            <>
              <FieldEdit icon="building" label="Organisation name" name="organisationName" value={draft.organisationName} onChange={handleChange} />
              <FieldEdit icon="map"      label="Ward"              name="ward"             value={draft.ward}             onChange={handleChange} hint="Helps match you to relevant listings." />
            </>
          ) : (
            <>
              <FieldDisplay icon="building" label="Organisation name" value={data.organisationName} />
              <FieldDisplay icon="map"      label="Ward"              value={data.ward} />
            </>
          )}
        </Section>

      </div>

      <div className={styles.dangerZone}>
        <div>
          <p className={styles.dangerTitle}>Delete account</p>
          <p className={styles.dangerSub}>Permanently removes your account and all listings. This cannot be undone.</p>
        </div>
        <button className={styles.deleteBtn}>Delete account</button>
      </div>

    </div>
  );
}