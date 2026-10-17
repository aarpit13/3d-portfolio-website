import './ContactPanel.scss';
import { contact } from '../data/contact.js';


// ============================================================
// ICONS (inline SVG, colored with currentColor)
// ============================================================

const svg = (inner) => `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">${inner}</svg>
`;

const ICONS = {

  copy: svg(`
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  `),

  check: svg(`<polyline points="20 6 9 17 4 12"/>`),

  instagram: svg(`
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  `),

  github: svg(`
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  `),

  linkedin: svg(`
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  `)
};


// ============================================================
// CONTACT PANEL COMPONENT
// ============================================================

/**
 * Builds the Contact panel, adds it to the page and returns
 * the panel element.
 *
 * Show it:  panel.classList.add('show')
 * Hide it:  panel.classList.remove('show')
 *
 * @param {object} data - Contact data (defaults to data/contact.js)
 * @returns {HTMLElement}
 */
export function createContactPanel(data = contact) {

  const panel = document.createElement('div');

  panel.id = 'contact-panel';
  panel.className = 'contact-overlay';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', data.title);


  // Social icon links.
  const socialsHtml = data.socials
    .map((s) => `
      <a class="contact-social"
         href="${s.url}"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="${s.name}"
         title="${s.name}">
        ${ICONS[s.icon] || ''}
      </a>
    `)
    .join('');


  panel.innerHTML = `
   <button class="contact-close" type="button" aria-label="Close">×</button>

    <section class="contact-card">
  
    

      <h2 class="contact-title">${data.title}</h2>

      <p class="contact-message">${data.message}</p>

      <div class="contact-email-row">
        <span class="contact-email">${data.email}</span>

        <button class="contact-copy"
                type="button"
                aria-label="Copy email">
          <span class="icon-copy">${ICONS.copy}</span>
          <span class="icon-check">${ICONS.check}</span>
        </button>
      </div>

      <div class="contact-actions">
        <a class="contact-btn" href="mailto:${data.email}">Say Hello</a>
        <a class="contact-btn" href="${data.resumeUrl}" download>Get Resume</a>
      </div>

      <div class="contact-socials">
        ${socialsHtml}
      </div>

    </section>
  `;

  document.body.appendChild(panel);


  // ----------------------------------------------------------
  // Copy email
  // ----------------------------------------------------------

  const copyBtn = panel.querySelector('.contact-copy');

  copyBtn.addEventListener('click', async () => {

    try {

      await navigator.clipboard.writeText(data.email);

      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.classList.remove('copied');
      }, 1200);

    } catch (err) {

      console.warn('Could not copy email to clipboard:', err);
    }

  });


  // ----------------------------------------------------------
  // Close: click outside the card, or press Escape
  // ----------------------------------------------------------

  panel.addEventListener('click', (event) => {

    if (event.target === panel) {
      panel.classList.remove('show');
    }

  });

  window.addEventListener('keydown', (event) => {

    if (event.key === 'Escape') {
      panel.classList.remove('show');
    }

  });
  
  panel.querySelector('.contact-close').addEventListener('click', () => {
  panel.classList.remove('show');
});


  return panel;
}