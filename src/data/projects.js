export const projects = [

  // ======================================================
  // PROJECT 1
  // ======================================================
  {
    title: 'Video Edit 01',
    video: 'https://media.arpitmagar.com.np/ani1.mp4',

    // Top-right info on the page
    role: ['Creative Direction', 'Storyboard', 'Motion Design', 'Sound Design'],
    time: 'May 2026',
    tools: ['After Effects', 'Premiere Pro'],

    sections: [

      // ---- SECTION 1: text + a full-width video ----
      {
        label: 'Overview',
        blocks: [
          { type: 'text',  text: 'Write the intro about Video Edit 01 here.' },
          { type: 'video', src: '/video/ani1.mp4' }
        ]
      },

      // ---- SECTION 2: text beside an image, flipping sides ----
      {
        label: 'Starting with the story',
        blocks: [
          { type: 'split', text: 'Text on the left, image on the right.', src: '/video/original.gif' },
          { type: 'split', reverse: true, text: 'Text on the right, image on the left.', src: '/video/original.gif' }
        ]
      },

      // ---- SECTION 3: row of 3 images + a final image ----
      {
        label: 'Small details',
        blocks: [
          { type: 'text', text: 'A few details from this edit.' },
          { type: 'gallery', images: [  
              '/video/original.gif',
              '/video/original.gif',
              '/video/original.gif'
          ]},
          { type: 'image', src: '/video/original.gif' }
        ]
      }

    ]
  },

  // ======================================================
  // PROJECT 2 (same structure, different content)
  // ======================================================
  {
    title: 'Video Edit 02',
    video: 'https://media.arpitmagar.com.np/ani2.mp4',

    role: ['Editing', 'Motion Design'],
    time: 'June 2026',
    tools: ['After Effects'],

    sections: [
      {
        label: 'Overview',
        blocks: [
          { type: 'text',  text: 'Write the intro about Video Edit 02 here.' },
          { type: 'video', src: '/video/ani2.mp4' }
        ]
      },
      {
        label: 'Behind the scenes',
        blocks: [
          { type: 'split', text: 'How this one was made.', src: '/work/video-edit-02/process.jpg' },
          { type: 'image', src: '/video/download.jpg' }
        ]
      }
    ]
  }

];