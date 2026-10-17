import './ProjectDetail.scss';

const blockHtml = (b) => {
  switch (b.type) {
    case 'text':
      return `<p class="pd-text">${b.text}</p>`;
    case 'image':
      return `<img class="pd-media" src="${b.src}" alt="">`;
    case 'video':
      return `<video class="pd-media" src="${b.src}" controls muted playsinline></video>`;
    case 'split':
      return `
        <div class="pd-split ${b.reverse ? 'reverse' : ''}">
          <p class="pd-text">${b.text}</p>
          <img class="pd-media" src="${b.src}" alt="">
        </div>`;
    case 'gallery':
      return `<div class="pd-gallery">${b.images.map((s) => `<img src="${s}" alt="">`).join('')}</div>`;
    default:
      return '';
  }
};

export function createProjectDetail(projects) {
  const panel = document.createElement('div');
  panel.id = 'project-detail';
  panel.className = 'project-detail';
  document.body.appendChild(panel);

  let index = 0;

  function render() {
    const p = projects[index];
    const next = projects[(index + 1) % projects.length];
    const pad = (n) => String(n).padStart(2, '0');

    panel.innerHTML = `
      <div class="pd-bar">
        <span>${pad(index + 1)} / ${pad(projects.length)}</span>
        <button class="pd-back" type="button">← Back</button>
      </div>

      <div class="pd-scroll">
        <video class="pd-hero" src="${p.video}" controls autoplay muted loop playsinline></video>

        <div class="pd-head">
          <div>
            <span class="pd-kicker">PROJECT ${pad(index + 1)}</span>
            <h1 class="pd-title">${p.title}</h1>
          </div>
          <div class="pd-meta">
            <div><h4>ROLE</h4>${(p.role || []).map((r) => `<p>${r}</p>`).join('')}</div>
            <div><h4>TIME</h4><p>${p.time || ''}</p></div>
            <div><h4>TOOLS</h4>${(p.tools || []).map((t) => `<p>${t}</p>`).join('')}</div>
          </div>
        </div>

        <div class="pd-body">
          ${(p.sections || []).map((s) => `
            <section class="pd-section">
              <h3 class="pd-label">${s.label}</h3>
              ${s.blocks.map(blockHtml).join('')}
            </section>
          `).join('')}
        </div>

        <button class="pd-next" type="button">
          <span>UP NEXT</span>
          <strong>${next.title}</strong>
        </button>
      </div>
    `;

    panel.querySelector('.pd-back').addEventListener('click', close);
    panel.querySelector('.pd-next').addEventListener('click', () => open((index + 1) % projects.length));
    panel.querySelector('.pd-scroll').scrollTop = 0;
  }

  function open(i) {
    index = i;
    render();
    panel.classList.add('show');
  }

  function close() {
    panel.classList.remove('show');
    panel.querySelectorAll('video').forEach((v) => v.pause());
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { el: panel, open, close };
}