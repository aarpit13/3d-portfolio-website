import * as THREE from 'three';
import './style.scss';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const projects = [];

fetch('https://media.arpitmagar.com.np/projects.json?t=' + Date.now())
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .catch(() => fallbackProjects)
  .then((list) => {
    projects.push(...list);
    renderWorkPanel(workGrid, projects);
  });import { renderWorkPanel } from './components/WorkPanel.js';
import { createContactPanel } from './components/ContactPanel.js';

import { contact } from './data/contact.js';
import { createProjectDetail } from './components/ProjectDetail.js';

// ============================================================
// BASIC THREE.JS SETUP
// ============================================================

// Canvas element where Three.js will render the 3D scene.
const canvas = document.querySelector('#exp-canvas');

// Store the current browser window size.
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};


// ------------------------------------------------------------
// Scene
// ------------------------------------------------------------

const scene = new THREE.Scene();


// ------------------------------------------------------------
// Camera
// ------------------------------------------------------------

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  1000
);

scene.add(camera);


// ------------------------------------------------------------
// Renderer
// ------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Correct color handling for textures and rendering.
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Gives the scene a more cinematic/high-quality appearance.
renderer.toneMapping = THREE.ACESFilmicToneMapping;


// ============================================================
// LIGHTING
// ============================================================

// General light that affects the entire scene.
scene.add(new THREE.AmbientLight(0xffffff, 1));


// Main directional light.
const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(5, 5, 5);
scene.add(mainLight);


// Secondary light used to brighten darker areas.
const fillLight = new THREE.DirectionalLight(0xffffff, 1);
fillLight.position.set(-5, 2, 3);
scene.add(fillLight);


// ============================================================
// ENVIRONMENT
// ============================================================

// Environment lighting is used mainly for reflections,
// especially on the glass material.
const pmremGenerator = new THREE.PMREMGenerator(renderer);

scene.environment = pmremGenerator
  .fromScene(new THREE.Scene())
  .texture;


// ============================================================
// ORBIT CONTROLS
// ============================================================

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;

// These limits are replaced with model-based values
// once the model has loaded (see the model loading section).
controls.minDistance = 0.005;
controls.maxDistance = 5;

controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = -Math.PI / 2;  // -90°
controls.maxAzimuthAngle = Math.PI / 2;   // +90°

controls.update();


// ============================================================
// CAMERA ANIMATION
// ============================================================

// Used to cancel an older camera animation when a new
// camera animation starts.
let currentAnimationId = 0;


/**
 * Smoothly moves the camera to a new position and target.
 *
 * @param {THREE.Vector3} targetPos - Final camera position
 * @param {THREE.Vector3} targetLookAt - Final camera target
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCameraTo(
  targetPos,
  targetLookAt,
  duration = 1500
) {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  // Every new animation gets a new ID.
  // This allows the previous animation to stop automatically.
  const animationId = ++currentAnimationId;


  // Smooth acceleration/deceleration.
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }


  function step(now) {

    // Stop this animation if another animation has started.
    if (animationId !== currentAnimationId) return;


    const elapsed = now - startTime;

    const t = Math.min(elapsed / duration, 1);

    const eased = easeInOutCubic(t);


    // Move camera position.
    camera.position.lerpVectors(startPos, targetPos, eased);

    // Move camera's look-at target.
    controls.target.lerpVectors(startTarget, targetLookAt, eased);

    controls.update();


    // Continue animation until it reaches 100%.
    if (t < 1) {
      requestAnimationFrame(step);
    }
  }


  requestAnimationFrame(step);
}


// ============================================================
// OBJECT SCALE-IN ANIMATION
// ============================================================

// Currently disabled in the model-loading section.
// Kept here in case you want the pop-in animation later.

function animateScaleIn(
  object,
  targetScale,
  duration = 1000,
  delay = 0
) {

  // Creates a small overshoot at the end of the animation.
  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return (
      1 +
      c3 * Math.pow(t - 1, 3) +
      c1 * Math.pow(t - 1, 2)
    );
  }


  function start() {

    const startTime = performance.now();


    function step(now) {

      const elapsed = now - startTime;

      const t = Math.min(elapsed / duration, 1);

      const eased = easeOutBack(t);


      object.scale.set(
        targetScale.x * eased,
        targetScale.y * eased,
        targetScale.z * eased
      );


      if (t < 1) {

        requestAnimationFrame(step);

      } else {

        // Make sure the final scale is exactly correct.
        object.scale.copy(targetScale);
      }
    }


    requestAnimationFrame(step);
  }


  // Wait before starting if a delay was requested.
  if (delay > 0) {

    setTimeout(start, delay);

  } else {

    start();
  }
}

// Default view the camera starts in (also used by the Home button).
const INITIAL_VIEW = {
  position: new THREE.Vector3(-0.18295804361581175, -0.4931830266991646, 0.21296933781885213),
  target: new THREE.Vector3(-0.10034343069922978, -0.5759444587088405, 0.07496934940972748)
};
// ============================================================
// CAMERA VIEWS
// ============================================================

// Each object that should have its own camera view
// gets a position and target here.
//
// position = where the camera moves to
// target   = what the camera looks toward
//
// NOTE: these values were recorded against the OLD model
// placement. If the model now sits in a slightly different
// spot, re-record them with the "P" key helper at the bottom
// of this file.

const cameraViews = {

  // WORK
  Text_baked: {
    position: new THREE.Vector3(
      -0.21812142366178516,
       -0.5093168851959811,
        -0.01816630726002993
    ),

    target: new THREE.Vector3(
   -0.21208248328084162,
    -0.5153665577188384, 
    -0.028253792671540396
    )
  },


  // ABOUT
  Text001_baked: {
    position: new THREE.Vector3(
      -0.15706058548512541, 
      -0.5483029858668028,
       -0.0164233964521334
    ),

    target: new THREE.Vector3(
     -0.20070289555008636,
      -0.5569506703239425, 
      -0.03962038270108208
    )
  },


  // CONTACT
  Text002_baked: {
    position: new THREE.Vector3(
     -0.23524242402000886,
      -0.5497826824590044,
       -0.010242748815135115
    ),

    target: new THREE.Vector3(
     -0.20942017187148967, 
     -0.5578799038062724,
      -0.04654968137660981
    )
  },


  // DOOR
  Book013_DoorWhite_0_baked: {
    position: new THREE.Vector3(
      0.09812759814905014,
      0.6407696872013174,
      -0.34956514260642646
    ),

    target: new THREE.Vector3(
      0.10737590530592499,
      0.6263252421724653,
      -0.3736319942748276
    )
  },


  // LAMP
  Lampshade_LampShade_0_baked: {
    position: new THREE.Vector3(
      0.7562432873896185,
      0.3714553925819198,
      0.555702532970023
    ),

    target: new THREE.Vector3(
      1.173480218811021,
      0.012163459019558913,
      0.3445040668617101
    )
  }
};


// ============================================================
// NAVIGATION → 3D OBJECT MAPPING
// ============================================================

// Connects the HTML navigation buttons to the corresponding
// 3D objects/camera views.

const navToObjectMap = {

  work: 'Text_baked',

  about: 'Text001_baked',

  contact: 'Text002_baked'

};


// ============================================================
// LOADING SCREEN
// ============================================================

const loadingScreen =
  document.getElementById('loading-screen');


// Three.js manager tracks model/texture loading.
const loadingManager = new THREE.LoadingManager();


// Runs when everything handled by the loading manager
// has finished loading.
loadingManager.onLoad = () => {

  setTimeout(() => {

    if (loadingScreen) {
      loadingScreen.classList.add('hide');
    }

  }, 300);
};


// ============================================================
// ABOUT PANEL
// ============================================================

const aboutPanel =
  document.getElementById('about-panel');

const aboutCloseBtn =
  document.querySelector('.about-close');


// Close About panel.
if (aboutCloseBtn && aboutPanel) {

  aboutCloseBtn.addEventListener('click', () => {

    aboutPanel.classList.remove('show');

  });

} else {

  console.warn(
    'About panel elements not found in the DOM (#about-panel / .about-close).'
  );
}


// ============================================================
// WORK PANEL
// ============================================================

const workPanel =
  document.getElementById('work-panel');

const workCloseBtn =
  document.querySelector('.work-close');

const workGrid =
  document.getElementById('work-grid');


// Render project cards when the page starts.
renderWorkPanel(
  workGrid,
  projects
);

const projectDetail = createProjectDetail(projects);

// Open the detail page for whichever video card was clicked.
workGrid.addEventListener('click', (event) => {
  const card = event.target.closest('.video-card');
  if (!card) return;

  const index = [...workGrid.querySelectorAll('.video-card')].indexOf(card);
  if (index > -1) projectDetail.open(index);
});


// Close Work panel.
if (workCloseBtn && workPanel) {

  workCloseBtn.addEventListener('click', () => {

    workPanel.classList.remove('show');

  });

} else {

  console.warn(
    'Work panel elements not found in the DOM (#work-panel / .work-close).'
  );
}


// ============================================================
// CONTACT PANEL
// ============================================================

// The panel HTML, styles, copy-email button and close behavior
// all live in components/ContactPanel.js. Its text and links
// are in data/contact.js.
const contactPanel = createContactPanel();


// ============================================================
// HEADER NAVIGATION
// ============================================================

document
  .querySelectorAll('.nav-link')
  .forEach((btn) => {

    btn.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();


      // Read which navigation item was clicked.
      const key = btn.dataset.view;

      // HOME: close any open panel and return to the default view.
if (key === 'home') {
  aboutPanel?.classList.remove('show');
  workPanel?.classList.remove('show');
  contactPanel?.classList.remove('show');

  animateCameraTo(
    INITIAL_VIEW.position,
    INITIAL_VIEW.target,
    1500
  );

  return;
}


      // Find the matching 3D object.
      const objectName = navToObjectMap[key];


      // Find that object's camera view.
      const view =
        objectName
          ? cameraViews[objectName]
          : null;


      // Move camera if a view exists.
      if (view) {

        animateCameraTo(
          view.position,
          view.target,
          1500
        );

      } else {

        console.warn(
          `No camera view found for nav item "${key}" (object "${objectName}")`
        );
      }


      // Open the corresponding HTML panel.
      if (key === 'about' && aboutPanel) {

        aboutPanel.classList.add('show');

      } else if (key === 'work' && workPanel) {

        workPanel.classList.add('show');

      } else if (key === 'contact' && contactPanel) {

        contactPanel.classList.add('show');
      }

    });

  });


// ============================================================
// 3D MODEL LOADING
// ============================================================

// Draco loader allows Three.js to load compressed GLB/GLTF models.
const dracoLoader =
  new DRACOLoader(loadingManager);

dracoLoader.setDecoderPath('/draco/');


// GLTF loader loads the main 3D model.
const loader =
  new GLTFLoader(loadingManager);

loader.setDRACOLoader(dracoLoader);


// Store the loaded model here.
let model = null;


// ============================================================
// VIDEO TEXTURE
// ============================================================

// Create the video element used on the monitor/screen.
const videoElement =
  document.createElement('video');

videoElement.src = '/video/ani2.mp4';

videoElement.loop = true;

videoElement.muted = true;

videoElement.playsInline = true;

videoElement.autoplay = true;


// Start video playback (ignore autoplay rejections).
videoElement.play().catch(() => {});


// Convert the video into a Three.js texture.
const videoTexture =
  new THREE.VideoTexture(videoElement);


// Video was exported in sRGB color space.
videoTexture.colorSpace =
  THREE.SRGBColorSpace;


// GLB screen orientation requires Y flipping to be disabled.
videoTexture.flipY = false;


// ============================================================
// LOAD THE ROOM MODEL
// ============================================================

loader.load(
  '/model/test2.glb',
  (gltf) => {

    // Store the loaded scene.
    model = gltf.scene;

    scene.add(model);


    // --------------------------------------------------------
    // PROCESS MODEL OBJECTS
    // --------------------------------------------------------

    model.traverse((child) => {

      // Only process mesh objects.
      if (child.isMesh) {

        child.castShadow = true;

        child.receiveShadow = true;


        // Make sure existing textures use the correct
        // color space.
        if (child.material?.map) {

          child.material.map.colorSpace =
            THREE.SRGBColorSpace;
        }


        // ----------------------------------------------------
        // GLASS MATERIAL
        // ----------------------------------------------------

        // Replace the original glass material with a
        // physically based transparent glass material.
        if (child.name === 'aqu-glass_baked') {

          child.material =
            new THREE.MeshPhysicalMaterial({

              color: 0xffffff,

              transmission: 1,

              opacity: 1,

              metalness: 0,

              roughness: 0,

              ior: 1.5,

              thickness: 0.01,

              specularIntensity: 1,

              specularColor: 0xffffff,

              envMapIntensity: 1,

              transmissionResolutionScale: 1

            });
        }
      }

    });


    // --------------------------------------------------------
    // SCALE FIRST, THEN CENTER
    // --------------------------------------------------------

    // Scale the model so its largest side is about 3 units.
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);

    model.scale.setScalar(maxSize > 0 ? 3 / maxSize : 1);
    model.updateMatrixWorld(true);

    // Measure again AFTER scaling, then move the center
    // of the model to the origin.
    const scaledBox = new THREE.Box3().setFromObject(model);
    const center = scaledBox.getCenter(new THREE.Vector3());

    model.position.sub(center);
    model.updateMatrixWorld(true);


   // --------------------------------------------------------
// INITIAL CAMERA VIEW (your own position + target)
// --------------------------------------------------------



camera.position.copy(INITIAL_VIEW.position);
controls.target.copy(INITIAL_VIEW.target);

// Zoom limits based on how far your view is from its target,
// so the camera is never clamped and you can still zoom in and out.
const startDistance = INITIAL_VIEW.position.distanceTo(INITIAL_VIEW.target);
controls.minDistance = startDistance * 0.05;
controls.maxDistance = startDistance * 3;


controls.update();


    // --------------------------------------------------------
    // OPTIONAL OBJECT POP-IN ANIMATION
    // --------------------------------------------------------

    // This animation is currently disabled.
    //
    // If you want it later, remove the comment markers
    // around this block.

    /*
    model.children.forEach((child, index) => {

      const originalScale =
        child.scale.clone();

      child.scale.setScalar(0);

      animateScaleIn(
        child,
        originalScale,
        900,
        index * 80
      );

    });
    */


    // --------------------------------------------------------
    // PUT VIDEO ON MONITOR SCREEN
    // --------------------------------------------------------

    const screen =
      model.getObjectByName('Screen_baked');


    if (screen) {

      screen.material =
        new THREE.MeshBasicMaterial({
          map: videoTexture
        });

    }

  }
);


// ============================================================
// POPUP SYSTEM
// ============================================================

/**
 * Creates a reusable popup.
 *
 * Instead of manually creating every popup's HTML,
 * we can create them using this function.
 */
function createPopup({
  icon,
  title,
  text,
  buttonLabel,
  onButtonClick
}) {

  const el = document.createElement('div');

  el.className = 'demo-popup';


  // Build the popup HTML.
  el.innerHTML = `
    <button class="popup-close">×</button>

    <div class="popup-content">

      <div class="popup-icon">${icon}</div>

      <h2>${title}</h2>

      <p>${text}</p>

      <button class="popup-action">
        ${buttonLabel}
      </button>

    </div>
  `;


  // Add popup to the page.
  document.body.appendChild(el);


  // Close button.
  el
    .querySelector('.popup-close')
    .addEventListener('click', () => {

      el.classList.remove('show');

    });


  // Main action button.
  el
    .querySelector('.popup-action')
    .addEventListener('click', onButtonClick);


  return el;
}


// ============================================================
// POPUP DEFINITIONS
// ============================================================

// Each popup is connected to a specific 3D object name.

const popups = {

  // ----------------------------------------------------------
  // Room
  // ----------------------------------------------------------

  room_baked: createPopup({

    icon: 'RM',

    title: 'Room',

    text:
      'This popup is connected to the <strong>room_baked</strong> object.',

    buttonLabel: 'View Room',

    onButtonClick: () => {

      window.open('https://example.com/room', '_blank');

    }

  }),


  // ----------------------------------------------------------
  // Book
  // ----------------------------------------------------------

  Book013_Notebook003_0_baked: createPopup({

    icon: 'BK',

    title: 'Book',

    text:
      'This popup is connected to the <strong>Book013_Notebook003_0_baked</strong> object.',

    buttonLabel: 'View Book',

    onButtonClick: () => {

      window.open('https://example.com/book', '_blank');

    }

  })

};

// ============================================================
// 3D OBJECT LINKS
// ============================================================

const socialUrl = (name) =>
  contact.socials.find((s) => s.name === name)?.url;

// 3D object name -> page it opens
const objectLinks = {
  Curve_baked: socialUrl('LinkedIn'),
  Curve001_baked: socialUrl('GitHub'),
  Curve004_baked: socialUrl('Instagram')
};



// ============================================================
// CLICK VS DRAG DETECTION
// ============================================================

// OrbitControls uses dragging to rotate the model.
// We don't want a drag to accidentally trigger a 3D click.

let pointerDownPos = {
  x: 0,
  y: 0
};


// Maximum movement allowed before we consider the action
// to be a drag instead of a click.
const DRAG_THRESHOLD = 5;


// Remember where the pointer started.
window.addEventListener(
  'pointerdown',
  (event) => {

    pointerDownPos = {
      x: event.clientX,
      y: event.clientY
    };

  }
);


// ============================================================
// RAYCASTING
// ============================================================

// Raycaster detects which 3D object the user clicked.
const raycaster = new THREE.Raycaster();


// Stores the mouse position in normalized device coordinates.
const mouse = new THREE.Vector2();


// Currently hovered popup object.
let hoveredObject = null;


// ============================================================
// 3D OBJECT CLICK DETECTION
// ============================================================

window.addEventListener(
  'click',
  (event) => {

    // --------------------------------------------------------
    // CHECK IF THIS WAS A DRAG
    // --------------------------------------------------------

    const dx = event.clientX - pointerDownPos.x;
    const dy = event.clientY - pointerDownPos.y;

    const movedDist = Math.sqrt(dx * dx + dy * dy);


    // Ignore clicks that were actually drags.
    if (movedDist > DRAG_THRESHOLD) {
      return;
    }


    // --------------------------------------------------------
    // IGNORE POPUP CLICKS
    // --------------------------------------------------------

    const clickedInsidePopup =
      Object.values(popups).some(
        (popup) => popup.contains(event.target)
      );


    // Don't raycast if the click was inside a popup
    // or if the model hasn't loaded yet.
    if (clickedInsidePopup || contactPanel.contains(event.target) || !model) {
      return;
    }


    // --------------------------------------------------------
    // CONVERT MOUSE POSITION
    // --------------------------------------------------------

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    // Shoot the ray from the camera through the mouse.
    raycaster.setFromCamera(mouse, camera);


    // Find all model objects intersected by the ray.
    const intersects =
      raycaster.intersectObject(model, true);


    // Nothing was clicked.
    if (intersects.length === 0) {
      return;
    }


    // Start with the actual mesh that was clicked.
    let obj = intersects[0].object;


    // --------------------------------------------------------
    // WALK UP THE PARENT CHAIN
    // --------------------------------------------------------

    // Sometimes the clicked mesh is inside a parent object.
    // We check the parent chain until we find a matching name.

    while (obj) {
        //to check the object name in console
        console.log('Checking object:', obj.name);


      // ------------------------------------------------------
      // CAMERA VIEW
      // ------------------------------------------------------

      const view = cameraViews[obj.name];

      if (view) {

        animateCameraTo(
          view.position,
          view.target,
          1500
        );

      }


      // ------------------------------------------------------
      // ABOUT
      // ------------------------------------------------------

      if (obj.name === 'Text001_baked' && aboutPanel) {

        aboutPanel.classList.add('show');

      }


      // ------------------------------------------------------
      // WORK
      // ------------------------------------------------------

      if (obj.name === 'Text_baked' && workPanel) {

        workPanel.classList.add('show');

      }


      // ------------------------------------------------------
      // CONTACT
      // ------------------------------------------------------

      if (obj.name === 'Text002_baked' && contactPanel) {

        contactPanel.classList.add('show');

      }

      // ------------------------------------------------------
// SOCIAL LINK OBJECTS
// ------------------------------------------------------

if (objectLinks[obj.name]) {

  window.open(
    objectLinks[obj.name],
    '_blank',
    'noopener,noreferrer'
  );

  return;
}


      // ------------------------------------------------------
      // POPUP
      // ------------------------------------------------------

      if (popups[obj.name]) {

        popups[obj.name].classList.add('show');

        // Stop checking parents once a popup was found.
        return;
      }


      // Move to the object's parent.
      obj = obj.parent;
    }

  }
);


// ============================================================
// 3D OBJECT HOVER DETECTION
// ============================================================

window.addEventListener(
  'mousemove',
  (event) => {

    // Don't do anything until the model exists.
    if (!model) return;


    // --------------------------------------------------------
    // UPDATE MOUSE POSITION
    // --------------------------------------------------------

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    // Shoot ray from camera.
    raycaster.setFromCamera(mouse, camera);


    // Check which model object is underneath the mouse.
    const intersects =
      raycaster.intersectObject(model, true);


    let matched = null;


    // --------------------------------------------------------
    // FIND HOVERED POPUP OBJECT
    // --------------------------------------------------------

    if (intersects.length > 0) {

      let obj = intersects[0].object;


      while (obj) {

        // Check if this object has a popup.
      if (popups[obj.name] || objectLinks[obj.name]) {

  matched = obj;

  break;
}


        obj = obj.parent;
      }

    }


    // Don't update anything if the hovered object
    // hasn't changed.
    if (matched === hoveredObject) {
      return;
    }


    hoveredObject = matched;


    // Change cursor when hovering over an interactive object.
    canvas.style.cursor =
      matched
        ? 'pointer'
        : 'default';

  }
);


// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
  'resize',
  () => {

    // Update stored window dimensions.
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;


    // Update camera aspect ratio.
    camera.aspect = sizes.width / sizes.height;

    camera.updateProjectionMatrix();


    // Update renderer size.
    renderer.setSize(sizes.width, sizes.height);


    // Keep pixel ratio limited for performance.
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

  }
);


// ============================================================
// HOVER SCALE SETTINGS
// ============================================================

// These objects become slightly larger when hovered.
const scalableNames = Object.keys(objectLinks);

// Remember each object's original scale so it returns to it exactly.
const baseScales = new Map();


// ============================================================
// DEV HELPER: PRESS "P" TO PRINT THE CURRENT CAMERA VIEW
// ============================================================

// Orbit to a view you like, press P, then copy the printed
// position/target into cameraViews. Safe to delete later.
window.addEventListener('keydown', (e) => {

  if (e.key.toLowerCase() !== 'p') return;

  const p = camera.position;
  const t = controls.target;

  console.log(
    `position: new THREE.Vector3(${p.x}, ${p.y}, ${p.z}),\n` +
    `target: new THREE.Vector3(${t.x}, ${t.y}, ${t.z})`
  );

});


// ============================================================
// MAIN RENDER LOOP
// ============================================================

function render() {

  // Update OrbitControls every frame because
  // damping is enabled.
  controls.update();


  // ----------------------------------------------------------
  // HOVER SCALE ANIMATION
  // ----------------------------------------------------------

 scalableNames.forEach((name) => {

  if (!model) return;

  const obj = model.getObjectByName(name);

  if (!obj) return;

  if (!baseScales.has(obj)) {
    baseScales.set(obj, obj.scale.clone());
  }

  const factor = hoveredObject === obj ? 1.15 : 1;

  obj.scale.lerp(
    baseScales.get(obj).clone().multiplyScalar(factor),
    0.1
  );

});


  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  renderer.render(scene, camera);


  // Run render again on the next frame.
  requestAnimationFrame(render);
}


// ============================================================
// START APPLICATION
// ============================================================

render();