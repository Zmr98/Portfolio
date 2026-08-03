'use client';

import { useEffect, useRef } from 'react';

const ICONS = {
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="7.5" y1="10" x2="7.5" y2="17"/><circle cx="7.5" cy="6.8" r="1"/><path d="M11.5 17v-4.2c0-1.6 1-2.6 2.4-2.6 1.4 0 2.1 1 2.1 2.6V17"/></svg>',
  youtube:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.2v5.6l5-2.8z" fill="currentColor" stroke="none"/></svg>',
};

const PLATFORM_META = {
  'instagram-reel': { icon: 'instagram', label: 'Instagram Reel' },
  linkedin: { icon: 'linkedin', label: 'LinkedIn' },
  youtube: { icon: 'youtube', label: 'YouTube' },
};

// YouTube (unlike Instagram/LinkedIn) exposes a stable, public thumbnail
// URL for any video with no login or API key — so unlike the others,
// this one can be fetched automatically instead of needing a manual upload.
function youtubeThumb(url) {
  const match = url.match(/(?:youtu\.be\/|v=|shorts\/)([a-zA-Z0-9_-]{6,})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function PlatformCard({ href, icon, type, cta, className = '', style }) {
  return (
    <a className={`platform-card ${className}`} style={style} href={href} target="_blank" rel="noopener noreferrer">
      <div className="pc-icon" dangerouslySetInnerHTML={{ __html: ICONS[icon] }} />
      <div className="pc-type">{type}</div>
      <div className="pc-cta">{cta} →</div>
    </a>
  );
}

export default function PortfolioView({ content }) {
  const scrubFillRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem('mz-theme') || 'dark';
    root.setAttribute('data-theme', saved);
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('mz-theme', next);
  }

  // Parallax — viewport-relative so it stays visibly bounded no matter
  // how far down the page an element sits.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll('.parallax')).map((el) => ({
      el,
      speed: parseFloat(el.dataset.speed || '0.2'),
      centered: el.dataset.center === 'true',
    }));

    let ticking = false;
    function update() {
      const y = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (scrubFillRef.current) {
        scrubFillRef.current.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + '%';
      }
      if (!reduceMotion) {
        const viewportCenter = window.innerHeight / 2;
        els.forEach(({ el, speed, centered }) => {
          const rect = el.getBoundingClientRect();
          const elCenter = rect.top + rect.height / 2;
          const offset = (viewportCenter - elCenter) * speed;
          el.style.transform = (centered ? 'translateX(-50%) ' : '') + 'translateY(' + offset + 'px)';
        });
      }
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll reveal — separate, lighter effect from parallax: each
  // .reveal element fades + rises into place the first time it enters
  // the viewport, then stays visible (no re-hiding on scroll back up,
  // which would feel gimmicky rather than charming).
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('.reveal');
    if (reduceMotion) {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [content]);

  const { hero, about, reels, flyers, experience, projects, contact } = content;

  return (
    <>
      <div className="scrub-bar">
        <div className="scrub-fill" ref={scrubFillRef} />
      </div>

      <nav className="nav">
        <div className="wrap">
          <div className="nav-logo">MZ</div>
          <div className="nav-right">
            <div className="nav-links">
              <a href="#about">About</a>
              <a href="#experience">Experience</a>
              <a href="#edits">Edits</a>
              <a href="#design">Design</a>
              <a href="#contact">Contact</a>
            </div>
            <button className="theme-toggle" type="button" onClick={toggleTheme}>Toggle theme</button>
          </div>
        </div>
      </nav>

      <header className="hero" id="hero">
        <div className="hero-grid-lines parallax" data-speed="0.25" />
        <div className="hero-frames parallax" data-speed="0.45">
          <div className="frame-corner f1" />
          <div className="frame-corner f2" />
          <div className="frame-corner f3" />
        </div>

        <div className="wrap">
          <div>
            <div className="eyebrow"><span className="dot" /> {hero.eyebrow}</div>
            <h1 dangerouslySetInnerHTML={{ __html: hero.name.replace(' ', '<br>') }} />
            <p className="hero-role">{hero.role}</p>
            <p className="hero-tag">{hero.tagline}</p>
            <div className="hero-cta">
              <a href="#experience" className="btn btn-primary">See my work ↓</a>
              <a href={`mailto:${contact.email}`} className="btn btn-ghost">Get in touch</a>
            </div>
          </div>

          <div className="hero-portrait parallax" data-speed="-0.08">
            <div className="portrait-frame">
              <span className="portrait-corner pc1" />
              <span className="portrait-corner pc2" />
              {hero.portraitImage && <img src={hero.portraitImage} alt={hero.name} />}
              {hero.portraitCaption && <div className="portrait-caption">{hero.portraitCaption}</div>}
            </div>
          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="watermark parallax" data-speed="0.22" data-center="true">ABOUT</div>
        <div className="wrap">
          <div className="section-label reveal">
            <span className="label-kicker">Who I am</span>
            <h2>About</h2>
          </div>
          <div className="about-grid">
            <div className="about-text reveal">
              <p>{about.summary}</p>
              <p className="dim">{about.detail}</p>
            </div>
            <div className="about-skills reveal">
              {[
                ['Web Technologies', about.skills.web],
                ['Editing & Design Tools', about.skills.editing],
                ['Other Tools', about.skills.other],
                ['Soft Skills', about.skills.soft],
              ].map(([title, items]) => (
                <div className="skill-group" key={title}>
                  <h4>{title}</h4>
                  <div className="skill-pills">
                    {items.map((s) => <span key={s}>{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE — grouped by company, with sub-positions nested
          underneath (covers moving between sister companies within the
          same group, or being promoted within one company). */}
      <section className="section alt" id="experience">
        <div className="watermark parallax" data-speed="0.26" data-center="true">WORK</div>
        <div className="wrap">
          <div className="section-label reveal">
            <span className="label-kicker">Career</span>
            <h2>Experience</h2>
          </div>

          {experience.map((group, gi) => (
            <div className="exp-group reveal" key={gi} style={{ transitionDelay: `${gi * 0.06}s` }}>
              <div className="exp-group-head">
                {group.logo ? (
                  <div
                    className="exp-logo-box"
                    style={{
                      width: 52, height: 52, borderRadius: 10, border: '1px solid var(--line)',
                      background: 'var(--panel-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 7, flexShrink: 0, overflow: 'hidden',
                    }}
                  >
                    <img
                      src={group.logo}
                      alt={group.groupName || ''}
                      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                ) : (
                  <div className="exp-logo-placeholder">{(group.groupName || '?').charAt(0)}</div>
                )}
                <div className="exp-group-name">{group.groupName || 'Untitled company'}</div>
              </div>
              <div className="exp-positions">
                {(group.positions || []).map((p, pi) => (
                  <div className="exp-position" key={pi}>
                    <span className="exp-time">{p.time}</span>
                    <div className="exp-role">{p.role}</div>
                    {p.company && <div className="exp-company">{p.company}</div>}
                    <ul>{(p.bullets || []).map((b, bi) => <li key={bi}>{b}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 60 }}>
            <div className="section-label reveal" style={{ marginBottom: 28 }}>
              <span className="label-kicker">Side builds</span>
              <h2 style={{ fontSize: 22 }}>Projects</h2>
            </div>
            <div className="project-grid">
              {projects.map((p, i) => (
                <div className="project-card reveal" key={i} style={{ transitionDelay: `${i * 0.05}s` }}>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                  <div className="project-stack">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
                  {p.link && <a className="gh" href={p.link} target="_blank" rel="noopener noreferrer">View on GitHub →</a>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EDITS (reels) — now placed after career, as the "other work" */}
      <section className="section" id="edits">
        <div className="watermark parallax" data-speed="0.28" data-center="true">EDITS</div>
        <div className="wrap">
          <div className="section-label reveal">
            <span className="label-kicker">Showreel</span>
            <h2>Video &amp; podcast edits</h2>
            <p className="section-sub">Podcast production and short-form reels — shot, cut and captioned end to end.</p>
          </div>
          <div className="reel-grid">
            {reels.map((r, i) => {
              const delay = { transitionDelay: `${(i % 6) * 0.05}s` };
              const meta = PLATFORM_META[r.type] || PLATFORM_META['instagram-reel'];
              const autoThumb = r.type === 'youtube' ? youtubeThumb(r.url) : null;
              const thumb = r.image || autoThumb;

              if (thumb) {
                return (
                  <a className="reel-card reveal" key={i} style={delay} href={r.url} target="_blank" rel="noopener noreferrer">
                    <img src={thumb} alt={r.label || meta.label} />
                    <div className="card-badge" dangerouslySetInnerHTML={{
                      __html: `${ICONS[meta.icon]}<span>${meta.label}</span>`,
                    }} />
                    <div className="card-overlay"><span>Watch →</span></div>
                    {r.label && <div className="card-label">{r.label}</div>}
                  </a>
                );
              }
              return <PlatformCard key={i} href={r.url} icon={meta.icon} type={meta.label} cta={r.label || 'Watch'} className="reveal" style={delay} />;
            })}
          </div>
        </div>
      </section>

      {/* DESIGN (flyers) */}
      <section className="section alt" id="design">
        <div className="watermark parallax" data-speed="0.24" data-center="true">DESIGN</div>
        <div className="wrap">
          <div className="section-label reveal">
            <span className="label-kicker">Print &amp; social</span>
            <h2>Flyer &amp; poster design</h2>
            <p className="section-sub">Posters, flyers and social assets designed for CT Smith's campaigns and announcements.</p>
          </div>
          <div className="flyer-grid">
            {flyers.map((f, i) => {
              const delay = { transitionDelay: `${(i % 6) * 0.05}s` };
              const isInstagram = /instagram\.com/.test(f.url || '');
              return f.image ? (
                <a className="flyer-card reveal" key={i} style={delay} href={f.url} target="_blank" rel="noopener noreferrer">
                  <img src={f.image} alt={f.caption || 'Flyer design'} />
                  {isInstagram && (
                    <div className="card-badge" dangerouslySetInnerHTML={{ __html: `${ICONS.instagram}<span>Design post</span>` }} />
                  )}
                  <div className="card-overlay"><span>View →</span></div>
                  <div className="card-label">{f.caption || 'Design'}</div>
                </a>
              ) : (
                <PlatformCard key={i} href={f.url} icon="instagram" type="Design post" cta="View on Instagram" className="reveal" style={delay} />
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section contact" id="contact">
        <div className="watermark parallax" data-speed="0.24" data-center="true">TALK</div>
        <div className="wrap">
          <div className="section-label reveal">
            <span className="label-kicker">Get in touch</span>
            <h2>Contact</h2>
          </div>
          <h2 className="reveal">Let's cut something<br />together.</h2>
          <p className="reveal" style={{ color: 'var(--muted)', maxWidth: '46ch', marginBottom: 10 }}>
            Open to IT/digital roles and freelance video &amp; design work. Based in Colombo, Sri Lanka.
          </p>
          <div className="contact-links reveal">
            <a className="btn btn-primary" href={`mailto:${contact.email}`}>{contact.email}</a>
            <a className="btn btn-ghost" href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
            <a className="btn btn-ghost" href={contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap"><span>© 2026 {hero.name}</span></div>
      </footer>
    </>
  );
}
