'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TABS = ['Hero & Bio', 'Skills', 'Experience', 'Projects', 'Edits (Reels)', 'Design (Flyers)', 'Contact'];

export default function Dashboard({ initialContent }) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState(TABS[0]);
  const [status, setStatus] = useState('');
  const router = useRouter();

  function setHero(field, value) {
    setContent((c) => ({ ...c, hero: { ...c.hero, [field]: value } }));
  }
  function setAbout(field, value) {
    setContent((c) => ({ ...c, about: { ...c.about, [field]: value } }));
  }
  function setSkillGroup(group, value) {
    // Comma-separated input -> array of trimmed strings
    const arr = value.split(',').map((s) => s.trim()).filter(Boolean);
    setContent((c) => ({ ...c, about: { ...c.about, skills: { ...c.about.skills, [group]: arr } } }));
  }
  function setContact(field, value) {
    setContent((c) => ({ ...c, contact: { ...c.contact, [field]: value } }));
  }

  function updateArrayItem(key, index, field, value) {
    setContent((c) => {
      const arr = [...c[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...c, [key]: arr };
    });
  }
  function addArrayItem(key, newItem) {
    setContent((c) => ({ ...c, [key]: [...c[key], newItem] }));
  }
  function removeArrayItem(key, index) {
    setContent((c) => ({ ...c, [key]: c[key].filter((_, i) => i !== index) }));
  }

  // Experience is nested (groups -> positions), so it gets its own
  // small set of update helpers rather than reusing the flat-array ones.
  function updateGroupField(gi, field, value) {
    setContent((c) => {
      const groups = [...c.experience];
      groups[gi] = { ...groups[gi], [field]: value };
      return { ...c, experience: groups };
    });
  }
  function updatePosition(gi, pi, field, value) {
    setContent((c) => {
      const groups = [...c.experience];
      const positions = [...groups[gi].positions];
      positions[pi] = { ...positions[pi], [field]: value };
      groups[gi] = { ...groups[gi], positions };
      return { ...c, experience: groups };
    });
  }
  function addPosition(gi) {
    setContent((c) => {
      const groups = [...c.experience];
      groups[gi] = { ...groups[gi], positions: [...groups[gi].positions, { time: '', role: '', company: '', bullets: [''] }] };
      return { ...c, experience: groups };
    });
  }
  function removePosition(gi, pi) {
    setContent((c) => {
      const groups = [...c.experience];
      groups[gi] = { ...groups[gi], positions: groups[gi].positions.filter((_, i) => i !== pi) };
      return { ...c, experience: groups };
    });
  }
  function addGroup() {
    setContent((c) => ({
      ...c,
      experience: [...c.experience, { groupName: '', logo: '', positions: [{ time: '', role: '', company: '', bullets: [''] }] }],
    }));
  }
  function removeGroup(gi) {
    setContent((c) => ({ ...c, experience: c.experience.filter((_, i) => i !== gi) }));
  }
  async function uploadGroupLogo(gi, file) {
    const fd = new FormData();
    fd.append('file', file);
    setStatus('Uploading logo…');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) {
      updateGroupField(gi, 'logo', data.url);
      setStatus('Logo uploaded — remember to Save.');
    } else {
      setStatus(data.error || 'Upload failed');
    }
  }

  async function uploadImage(key, index, file) {
    const fd = new FormData();
    fd.append('file', file);
    setStatus('Uploading image…');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) {
      updateArrayItem(key, index, 'image', data.url);
      setStatus('Image uploaded — remember to Save.');
    } else {
      setStatus(data.error || 'Upload failed');
    }
  }

  async function uploadHeroPhoto(file) {
    const fd = new FormData();
    fd.append('file', file);
    setStatus('Uploading photo…');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) {
      setHero('portraitImage', data.url);
      setStatus('Photo uploaded — remember to Save.');
    } else {
      setStatus(data.error || 'Upload failed');
    }
  }

  async function save() {
    setStatus('Saving…');
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    setStatus(res.ok ? 'Saved ✓' : 'Save failed — try again.');
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  }

  return (
    <div>
      <div className="dash-top">
        <div className="nav-logo">MZ Admin</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a className="btn btn-ghost" href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <button className="btn btn-ghost" onClick={logout}>Log out</button>
        </div>
      </div>

      <div className="dash">
        <div className="dash-tabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'Hero & Bio' && (
          <div className="dash-section">
            <h3>Hero</h3>
            <div className="field"><label>Status line (eyebrow)</label>
              <input value={content.hero.eyebrow} onChange={(e) => setHero('eyebrow', e.target.value)} /></div>
            <div className="field"><label>Full name</label>
              <input value={content.hero.name} onChange={(e) => setHero('name', e.target.value)} /></div>
            <div className="field"><label>Role / title</label>
              <input value={content.hero.role} onChange={(e) => setHero('role', e.target.value)} /></div>
            <div className="field"><label>Tagline</label>
              <textarea value={content.hero.tagline} onChange={(e) => setHero('tagline', e.target.value)} /></div>
            <div className="field"><label>Portrait photo</label>
              <div className="item-row">
                {content.hero.portraitImage && <img className="thumb-preview" src={content.hero.portraitImage} alt="" />}
                <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadHeroPhoto(e.target.files[0])} />
                {content.hero.portraitImage && <button className="remove-btn" onClick={() => setHero('portraitImage', '')}>Remove photo</button>}
              </div>
            </div>
            <div className="field"><label>Photo caption</label>
              <input value={content.hero.portraitCaption} onChange={(e) => setHero('portraitCaption', e.target.value)} /></div>

            <h3 style={{ marginTop: 32 }}>About</h3>
            <div className="field"><label>Summary (first line)</label>
              <textarea value={content.about.summary} onChange={(e) => setAbout('summary', e.target.value)} /></div>
            <div className="field"><label>Detail paragraph</label>
              <textarea value={content.about.detail} onChange={(e) => setAbout('detail', e.target.value)} /></div>
          </div>
        )}

        {tab === 'Skills' && (
          <div className="dash-section">
            <h3>Skills (comma-separated)</h3>
            <div className="field"><label>Web Technologies</label>
              <input value={content.about.skills.web.join(', ')} onChange={(e) => setSkillGroup('web', e.target.value)} /></div>
            <div className="field"><label>Editing &amp; Design Tools</label>
              <input value={content.about.skills.editing.join(', ')} onChange={(e) => setSkillGroup('editing', e.target.value)} /></div>
            <div className="field"><label>Other Tools</label>
              <input value={content.about.skills.other.join(', ')} onChange={(e) => setSkillGroup('other', e.target.value)} /></div>
            <div className="field"><label>Soft Skills</label>
              <input value={content.about.skills.soft.join(', ')} onChange={(e) => setSkillGroup('soft', e.target.value)} /></div>
          </div>
        )}

        {tab === 'Edits (Reels)' && (
          <div className="dash-section">
            <h3>Reels &amp; videos</h3>
            <p className="status-text" style={{ marginBottom: 16 }}>
              Upload a preview image per item to show a real thumbnail on the site — without one, it shows a simple "watch on Instagram/LinkedIn" card instead.
            </p>
            {content.reels.map((r, i) => (
              <div className="item-card" key={i}>
                <div className="field"><label>Type</label>
                  <select
                    value={r.type}
                    onChange={(e) => updateArrayItem('reels', i, 'type', e.target.value)}
                    style={{ background: 'var(--panel-2)', color: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', width: '100%' }}
                  >
                    <option value="instagram-reel">Instagram Reel</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
                <div className="field"><label>URL</label>
                  <input value={r.url} onChange={(e) => updateArrayItem('reels', i, 'url', e.target.value)} /></div>
                <div className="field"><label>Label (optional)</label>
                  <input value={r.label} onChange={(e) => updateArrayItem('reels', i, 'label', e.target.value)} /></div>
                <div className="field">
                  <label>
                    Preview image {r.type === 'youtube' && '(optional — YouTube thumbnails load automatically)'}
                  </label>
                  <div className="item-row">
                    {r.image && <img className="thumb-preview" src={r.image} alt="" />}
                    <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadImage('reels', i, e.target.files[0])} />
                    {r.image && <button className="remove-btn" onClick={() => updateArrayItem('reels', i, 'image', '')}>Remove image</button>}
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeArrayItem('reels', i)}>Remove item</button>
              </div>
            ))}
            <button className="add-btn" onClick={() => addArrayItem('reels', { type: 'instagram-reel', url: '', label: '', image: '' })}>
              + Add reel/video
            </button>
          </div>
        )}

        {tab === 'Design (Flyers)' && (
          <div className="dash-section">
            <h3>Flyers &amp; posters</h3>
            <p className="status-text" style={{ marginBottom: 16 }}>
              Upload the actual design image for each item so it shows directly on the site.
            </p>
            {content.flyers.map((f, i) => (
              <div className="item-card" key={i}>
                <div className="field"><label>Source URL</label>
                  <input value={f.url} onChange={(e) => updateArrayItem('flyers', i, 'url', e.target.value)} /></div>
                <div className="field"><label>Caption</label>
                  <input value={f.caption} onChange={(e) => updateArrayItem('flyers', i, 'caption', e.target.value)} /></div>
                <div className="field"><label>Design image</label>
                  <div className="item-row">
                    {f.image && <img className="thumb-preview" src={f.image} alt="" />}
                    <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadImage('flyers', i, e.target.files[0])} />
                    {f.image && <button className="remove-btn" onClick={() => updateArrayItem('flyers', i, 'image', '')}>Remove image</button>}
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeArrayItem('flyers', i)}>Remove item</button>
              </div>
            ))}
            <button className="add-btn" onClick={() => addArrayItem('flyers', { url: '', caption: '', image: '' })}>
              + Add flyer
            </button>
          </div>
        )}

        {tab === 'Experience' && (
          <div className="dash-section">
            <h3>Experience — grouped by company</h3>
            <p className="status-text" style={{ marginBottom: 16 }}>
              Use one group per company (e.g. "CT Smith Group"), and add a position for each role or sub-company transfer inside it. Upload a logo per group if you have one.
            </p>
            {content.experience.map((group, gi) => (
              <div className="item-card" key={gi} style={{ borderColor: 'var(--amber)' }}>
                <div className="field"><label>Company / group name</label>
                  <input value={group.groupName} onChange={(e) => updateGroupField(gi, 'groupName', e.target.value)} /></div>
                <div className="field"><label>Company logo</label>
                  <div className="item-row">
                    {group.logo && <img className="thumb-preview" src={group.logo} alt="" />}
                    <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadGroupLogo(gi, e.target.files[0])} />
                    {group.logo && <button className="remove-btn" onClick={() => updateGroupField(gi, 'logo', '')}>Remove logo</button>}
                  </div>
                </div>

                <div style={{ marginTop: 18, marginLeft: 16, paddingLeft: 16, borderLeft: '1px solid var(--line)' }}>
                  {group.positions.map((p, pi) => (
                    <div className="item-card" key={pi}>
                      <div className="field"><label>Dates</label>
                        <input value={p.time} onChange={(e) => updatePosition(gi, pi, 'time', e.target.value)} /></div>
                      <div className="field"><label>Role</label>
                        <input value={p.role} onChange={(e) => updatePosition(gi, pi, 'role', e.target.value)} /></div>
                      <div className="field"><label>Sub-company / entity (optional — leave blank if same as group name)</label>
                        <input value={p.company} onChange={(e) => updatePosition(gi, pi, 'company', e.target.value)} /></div>
                      <div className="field"><label>Bullet points (one per line)</label>
                        <textarea
                          value={p.bullets.join('\n')}
                          onChange={(e) => updatePosition(gi, pi, 'bullets', e.target.value.split('\n'))}
                          style={{ minHeight: 100 }}
                        />
                      </div>
                      <button className="remove-btn" onClick={() => removePosition(gi, pi)}>Remove this position</button>
                    </div>
                  ))}
                  <button className="add-btn" onClick={() => addPosition(gi)}>+ Add position under this company</button>
                </div>

                <button className="remove-btn" style={{ marginTop: 14 }} onClick={() => removeGroup(gi)}>Remove entire company group</button>
              </div>
            ))}
            <button className="add-btn" onClick={addGroup}>+ Add company group</button>
          </div>
        )}

        {tab === 'Projects' && (
          <div className="dash-section">
            <h3>Projects</h3>
            {content.projects.map((p, i) => (
              <div className="item-card" key={i}>
                <div className="field"><label>Title</label>
                  <input value={p.title} onChange={(e) => updateArrayItem('projects', i, 'title', e.target.value)} /></div>
                <div className="field"><label>Description</label>
                  <input value={p.desc} onChange={(e) => updateArrayItem('projects', i, 'desc', e.target.value)} /></div>
                <div className="field"><label>Tech stack (comma-separated)</label>
                  <input
                    value={p.stack.join(', ')}
                    onChange={(e) => updateArrayItem('projects', i, 'stack', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  />
                </div>
                <div className="field"><label>Link (optional)</label>
                  <input value={p.link} onChange={(e) => updateArrayItem('projects', i, 'link', e.target.value)} /></div>
                <button className="remove-btn" onClick={() => removeArrayItem('projects', i)}>Remove item</button>
              </div>
            ))}
            <button className="add-btn" onClick={() => addArrayItem('projects', { title: '', desc: '', stack: [], link: '' })}>
              + Add project
            </button>
          </div>
        )}

        {tab === 'Contact' && (
          <div className="dash-section">
            <h3>Contact details</h3>
            <div className="field"><label>Email</label>
              <input value={content.contact.email} onChange={(e) => setContact('email', e.target.value)} /></div>
            <div className="field"><label>Phone</label>
              <input value={content.contact.phone} onChange={(e) => setContact('phone', e.target.value)} /></div>
            <div className="field"><label>LinkedIn URL</label>
              <input value={content.contact.linkedin} onChange={(e) => setContact('linkedin', e.target.value)} /></div>
          </div>
        )}
      </div>

      <div className="save-bar">
        <span className="status-text">{status}</span>
        <button className="btn btn-primary" onClick={save}>Save changes</button>
      </div>
    </div>
  );
}
