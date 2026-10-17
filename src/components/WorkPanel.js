import { WorkCard } from './WorkCard.js';

// Renders `projects` into `container` by mapping each item through the
// WorkCard component — the same shape as `{projects.map(p => <WorkCard ... />)}`
// in React, just with manual DOM instead of JSX/a virtual DOM.
export function renderWorkPanel(container, projects) {
  if (!container) {
    console.warn('renderWorkPanel: no container element passed.');
    return;
  }

  container.innerHTML = ''; // clear before (re-)rendering
  projects.forEach((project) => {
    container.appendChild(WorkCard(project));
  });
}