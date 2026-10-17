export function WorkCard(project) {
  const card = document.createElement('div');

  card.className = 'video-card';

  const video = document.createElement('video');

  video.src = project.video;

  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'metadata';

  card.appendChild(video);

  return card;
}