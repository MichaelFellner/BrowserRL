// This is a test comment to increment the version
let isTutorialMode = true;
let currentTutorialPart = 1;

// Step-by-step functionality variables
let stepByStepPaused = false;
let stepByStepResolver = null;

// Enhanced function to handle highlighting for any tutorial part with multiple color options
function handleTutorialHighlighting(partNumber) {
  console.log(`🎯 Handling highlighting for tutorial part ${partNumber}`);
  
  // Remove all existing highlights first
  for (let i = 1; i <= 4; i++) {
    // Remove primary highlights
    const primaryElements = document.querySelectorAll(`.part-${i}-highlight-active`);
    primaryElements.forEach(element => {
      element.classList.remove(`part-${i}-highlight-active`);
    });
    
    // Remove alternative highlights
    const altElements = document.querySelectorAll(`.part-${i}-alt-highlight-active`);
    altElements.forEach(element => {
      element.classList.remove(`part-${i}-alt-highlight-active`);
    });
    
    // Remove tertiary highlights
    const tertiaryElements = document.querySelectorAll(`.part-${i}-tertiary-highlight-active`);
    tertiaryElements.forEach(element => {
      element.classList.remove(`part-${i}-tertiary-highlight-active`);
    });
    
    console.log(`🔄 Removed part-${i} highlighting from all variants`);
  }
  
  // Add highlighting for the current part - support multiple color variants
  const colorVariants = ['', '-alt', '-tertiary'];
  
  colorVariants.forEach(variant => {
    const selector = variant === '' ? `[data-highlight-part="${partNumber}"]` : `[data-highlight-part="${partNumber}${variant}"]`;
    const elementsToHighlight = document.querySelectorAll(selector);
    
    elementsToHighlight.forEach(element => {
      const className = variant === '' ? `part-${partNumber}-highlight-active` : `part-${partNumber}${variant}-highlight-active`;
      element.classList.add(className);
      console.log(`✨ Added ${className} to element`);
    });
  });
}

// Function to remove all tutorial highlighting (enhanced for multiple colors)
function removeAllTutorialHighlighting() {
  for (let i = 1; i <= 4; i++) {
    const colorVariants = ['', '-alt', '-tertiary'];
    
    colorVariants.forEach(variant => {
      const className = variant === '' ? `part-${i}-highlight-active` : `part-${i}${variant}-highlight-active`;
      const elementsToUnhighlight = document.querySelectorAll(`.${className}`);
      elementsToUnhighlight.forEach(element => {
        element.classList.remove(className);
      });
    });
  }
  console.log("🧹 Cleared all tutorial highlighting (all color variants)");
}

// Modified function to handle algorithm highlighting for tutorial part 2 (backwards compatibility)
function handleAlgorithmHighlighting(partNumber) {
  // Call the new general highlighting function
  handleTutorialHighlighting(partNumber);
  
  // Keep the old specific logic for backwards compatibility
  const forEachElement = document.getElementById('algorithm-for-each');
  const valueUpdateElement = document.getElementById('algorithm-value-update');
  
  if (forEachElement && valueUpdateElement) {
    if (partNumber === 2) {
      // Add highlighting for part 2
      forEachElement.classList.add('algorithm-highlight');
      valueUpdateElement.classList.add('algorithm-highlight');
      console.log("✨ Added algorithm highlighting for part 2 (legacy)");
    } else {
      // Remove highlighting for other parts
      forEachElement.classList.remove('algorithm-highlight');
      valueUpdateElement.classList.remove('algorithm-highlight');
      console.log("🔄 Removed algorithm highlighting (legacy)");
    }
  }
}

// Function to remove all algorithm highlighting (backwards compatibility)
function removeAlgorithmHighlighting() {
  removeAllTutorialHighlighting();
  
  // Keep old logic for backwards compatibility
  const forEachElement = document.getElementById('algorithm-for-each');
  const valueUpdateElement = document.getElementById('algorithm-value-update');
  
  if (forEachElement && valueUpdateElement) {
    forEachElement.classList.remove('algorithm-highlight');
    valueUpdateElement.classList.remove('algorithm-highlight');
    console.log("🧹 Cleared algorithm highlighting (legacy)");
  }
}

function switchTutorialPart(partNumber) {
  // Stop step-by-step if it's running
  if (window._isLiveRunning && (stepByStepPaused || stepByStepResolver)) {
    console.log("🛑 Stopping step-by-step due to navigation");
    stopStepByStep();
  }
  
  currentTutorialPart = partNumber;
  console.log("🔄 Switching to tutorial part", partNumber);
  resetEverything();
  
  // Update body class for mathematical term visibility
  document.body.className = document.body.className.replace(/tutorial-part-\d+/g, '');
  document.body.classList.remove('playground-mode');
  document.body.classList.add(`tutorial-part-${partNumber}`);
  console.log(`📐 Updated body class for math visibility: tutorial-part-${partNumber}`);
  
  // Hide all tutorial parts
  document.querySelectorAll('.tutorial-part').forEach(part => {
    part.style.display = 'none';
  });
  
  // Hide all tutorial control parts
  document.querySelectorAll('.tutorial-controls-part').forEach(controls => {
    controls.style.display = 'none';
  });
  
  // Hide all additional content for all parts FIRST - updated for 4 parts
  for (let i = 1; i <= 4; i++) {
    const additionalContent = document.getElementById(`tutorial-part-${i}-additional`);
    if (additionalContent) {
      additionalContent.style.display = 'none';
    }
  }
  
  // Handle canvas and controls visibility based on part
  const canvasOuter = document.querySelector('.canvas-outer');
  const controlsPanel = document.querySelector('.controls-panel');
  
  if (partNumber === 4) {
    // Hide canvas and controls for part 4
    if (canvasOuter) canvasOuter.style.display = 'none';
    if (controlsPanel) controlsPanel.style.display = 'none';
    console.log("🎯 Hidden canvas and controls for Part 4");
  } else {
    // Show canvas and controls for parts 1-3
    if (canvasOuter) canvasOuter.style.display = 'flex';
    if (controlsPanel) controlsPanel.style.display = 'grid';
    console.log("👁️ Shown canvas and controls for Part", partNumber);
  }
  
  // Show selected tutorial part
  const selectedPart = document.getElementById(`tutorial-part-${partNumber}`);
  const selectedControls = document.getElementById(`tutorial-part-${partNumber}-controls`);
  
  console.log("🔍 Looking for tutorial part element:", selectedPart);
  console.log("🔍 Looking for tutorial controls element:", selectedControls);
  
  if (selectedPart) {
    selectedPart.style.display = 'block';
    console.log("✅ Showed tutorial part", partNumber);
  } else {
    console.error("❌ Tutorial part element not found:", `tutorial-part-${partNumber}`);
  }
  
  if (selectedControls && partNumber !== 4) {
    // Only show controls if not part 4 (part 4 has no controls)
    selectedControls.style.display = 'block';
    console.log("✅ Showed tutorial controls", partNumber);
  } else if (partNumber === 4) {
    console.log("📝 Part 4 has no controls (expected)");
  } else {
    console.error("❌ Tutorial controls element not found:", `tutorial-part-${partNumber}-controls`);
  }
  
  // Show additional content for the current part (if it exists)
  const additionalContent = document.getElementById(`tutorial-part-${partNumber}-additional`);
  if (additionalContent) {
    additionalContent.style.display = 'block';
    console.log("✅ Showed additional content for part", partNumber);
  }
  
  // Update navigation buttons - include all part 4 variants
  document.querySelectorAll('.tutorial-nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Update all navigation buttons across all parts - updated for part 4
  const navButtons = [
    `part-${partNumber}-btn`,
    `part-${partNumber}-btn-2`, 
    `part-${partNumber}-btn-3`,
    `part-${partNumber}-btn-4`
  ];
  
  navButtons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.classList.add('active');
      console.log("✅ Activated button:", btnId);
    }
  });
  
  // Handle highlighting for the current part using the new system
  handleTutorialHighlighting(partNumber);
  
  // Keep the old algorithm highlighting for backwards compatibility
  handleAlgorithmHighlighting(partNumber);
  
  // Smooth scroll to top after all content changes are complete
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, 100); // Small delay to ensure DOM updates are complete
}

function switchToTutorialMode() {
  // Stop step-by-step if it's running
  if (window._isLiveRunning && (stepByStepPaused || stepByStepResolver)) {
    console.log("🛑 Stopping step-by-step due to navigation");
    stopStepByStep();
  }
  
  isTutorialMode = true;
  document.body.className = 'tutorial-mode';
  
  // Update button states
  document.getElementById('introduction-mode-btn').classList.remove('active');
  document.getElementById('tutorial-mode-btn').classList.add('active');
  document.getElementById('playground-mode-btn').classList.remove('active');
  
  // Hide introduction elements
  document.querySelectorAll('.introduction-only').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show tutorial elements, hide playground elements
  document.querySelectorAll('.tutorial-only').forEach(el => {
    el.classList.remove('hidden');
    el.classList.add('show');
    el.style.display = 'block'; // Add this line
  });
  document.querySelectorAll('.playground-only').forEach(el => {
    el.classList.add('hidden');
    el.classList.remove('show');
    el.style.display = 'none'; // Add this line
  });
  
  // Initialize tutorial part 1
  switchTutorialPart(1);
  
  // Update header subtitle
  document.getElementById('header-subtitle').textContent = 'Learn how value iteration works step by step';
}

// Simple fix for switchToPlaygroundMode - just ensure proper visibility
function switchToPlaygroundMode() {
  // Stop step-by-step if it's running
  if (window._isLiveRunning && (stepByStepPaused || stepByStepResolver)) {
    console.log("🛑 Stopping step-by-step due to navigation");
    stopStepByStep();
  }
  
  isTutorialMode = false;
  document.body.className = 'playground-mode';
  
  // Update button states
  document.getElementById('introduction-mode-btn').classList.remove('active');
  document.getElementById('tutorial-mode-btn').classList.remove('active');
  document.getElementById('playground-mode-btn').classList.add('active');
  
  // Hide introduction elements
  document.querySelectorAll('.introduction-only').forEach(el => {
    el.style.display = 'none';
  });
  
  // Hide all tutorial parts and additional content sections
  document.querySelectorAll('.tutorial-part').forEach(part => {
    part.style.display = 'none';
  });
  
  document.querySelectorAll('.tutorial-controls-part').forEach(controls => {
    controls.style.display = 'none';
  });
  
  // Hide all additional content for all parts
  for (let i = 1; i <= 4; i++) {
    const additionalContent = document.getElementById(`tutorial-part-${i}-additional`);
    if (additionalContent) {
      additionalContent.style.display = 'none';
    }
  }
  
  // Show playground elements, hide tutorial elements
  document.querySelectorAll('.tutorial-only').forEach(el => {
    el.classList.add('hidden');
    el.classList.remove('show');
    el.style.display = 'none';
  });
  document.querySelectorAll('.playground-only').forEach(el => {
    el.classList.remove('hidden');
    el.classList.add('show');
    el.style.display = 'block';
  });
  
  // Ensure the playground controls are visible and properly styled
  const playgroundControls = document.querySelector('.playground-controls');
  if (playgroundControls) {
    playgroundControls.style.display = 'block';
    console.log("✅ Playground controls are now visible");
  }
  
  // Update header subtitle
  document.getElementById('header-subtitle').textContent = 'Experiment with value iteration parameters';
  
  // Update body class for mathematical term visibility
  document.body.classList.add('playground-mode');
}

// Initialize in INTRODUCTION mode when DOM is loaded (UPDATED)
document.addEventListener('DOMContentLoaded', function() {
  // Set initial state to INTRODUCTION mode
  isTutorialMode = false;
  currentTutorialPart = 1;
  
  // Initialize global variables
  if (typeof liveValues === 'undefined') liveValues = new Map();
  if (typeof yellowMap === 'undefined') yellowMap = new Map();
  if (typeof liveDeltaMap === 'undefined') liveDeltaMap = new Map();
  if (typeof liveMaxValueSeen === 'undefined') liveMaxValueSeen = 1;
  
  // Set default canvas size to small
  resizeCanvas('small');
  
  // Start in introduction mode
  switchToIntroductionMode();
  
  // Initialize agent position display
  updateAgentPositionDisplay(greenStartX, greenStartY);
  
  // Initialize delta display
  updateDeltaDisplay(null);
});

// Tutorial-specific live value iteration function
// Tutorial-specific live value iteration function
async function runTutorialLiveValueIteration() {
  if (window._isLiveRunning) {
    console.warn("⚠️ Already running. Ignoring duplicate call.");
    return;
  }
  window._isLiveRunning = true;
  console.log("🔁 Tutorial live value iteration triggered");

  // Use tutorial-specific settings based on which part we're in
  const gamma = 0.99;
  const threshold = 1e-4;
  let delayMs, totalIterations;
  
  if (currentTutorialPart === 2) {
    // Part 2 uses its own controls
    delayMs = parseInt(document.getElementById("tutorialDelayMs").value) || 50;
    totalIterations = parseInt(document.getElementById("tutorialLiveIters").value) || 1;
  } else if (currentTutorialPart === 3) {
    // Part 3 uses its own controls
    delayMs = parseInt(document.getElementById("tutorialLiveDelayMs").value) || 50;
    totalIterations = parseInt(document.getElementById("tutorialLiveIters").value) || 1;
  } else {
    // Default values
    delayMs = 50;
    totalIterations = 1;
  }

  if (!liveValueIterationState) {
    liveValueIterationState = await parseCanvasToState();
  }

  const { walkableMask, goal_pos } = liveValueIterationState;
  const boxSize = 20;
  const goalKey = `${goal_pos[0]},${goal_pos[1]}`;

  const directions = {
    0: [0, -boxSize],
    1: [0, boxSize],
    2: [-boxSize, 0],
    3: [boxSize, 0],
  };

  function isCellWalkable(cx, cy) {
    if (cx - 10 < 0 || cy - 10 < 0 || cx + 9 >= walkableMask[0].length || cy + 9 >= walkableMask.length) {
      return false;
    }
    return (
      walkableMask[cy - 10][cx - 10] &&
      walkableMask[cy - 10][cx + 9] &&
      walkableMask[cy + 9][cx - 10] &&
      walkableMask[cy + 9][cx + 9]
    );
  }

  const validStates = [];
  for (let cy = 0; cy < walkableMask.length; cy += boxSize) {
    for (let cx = 0; cx < walkableMask[0].length; cx += boxSize) {
      if (isCellWalkable(cx, cy)) {
        validStates.push([cx, cy]);
      }
    }
  }

  const validSet = new Set(validStates.map(([x, y]) => `${x},${y}`));

  // Initialize or reset all live iteration maps
  if (!liveValues || liveValues === null) {
    liveValues = new Map();
  }
  if (!livePolicyMap || livePolicyMap === null) {
    livePolicyMap = new Map();
  }
  if (!liveArrowMap || liveArrowMap === null) {
    liveArrowMap = new Map();
  }
  if (typeof liveIterationCount === 'undefined' || liveIterationCount === null) {
    liveIterationCount = 0;
  }

  if (typeof liveDeltaMap === 'undefined') liveDeltaMap = new Map();
  if (typeof liveMaxValueSeen === 'undefined') liveMaxValueSeen = 1;

  for (const [x, y] of validStates) {
    const key = `${x},${y}`;
    if (key !== goalKey && !liveValues.has(key)) {
      liveValues.set(key, -1000);
    }
  }

  try {
    for (let iter = 0; iter < totalIterations; iter++) {
      let delta = 0;

      for (const [x, y] of validStates) {
        const stateKey = `${x},${y}`;
        if (stateKey === goalKey) {
          liveValues.set(stateKey, 10); // Use consistent goal value
          continue;
        }

        const lastDelta = liveDeltaMap.get(stateKey);
        if (lastDelta !== undefined && lastDelta < threshold) {
          continue;
        }

        greenBox.set({ left: x - boxSize / 2, top: y - boxSize / 2 });
        canvas.bringToFront(greenBox);
        canvas.requestRenderAll();
        await new Promise(r => setTimeout(r, delayMs));

        let maxVal = -Infinity;
        let bestAction = null;

        for (const [action, [dx, dy]] of Object.entries(directions)) {
          const nx = x + dx;
          const ny = y + dy;
          const neighborKey = `${nx},${ny}`;
          if (!validSet.has(neighborKey)) continue;

          const nextDist = Math.hypot(nx - goal_pos[0], ny - goal_pos[1]);
          const reward = calculateReward([x, y], [nx, ny], goal_pos); // Use new reward function

          const val = reward + gamma * (liveValues.get(neighborKey) || -1000);

          if (val > maxVal) {
            maxVal = val;
            bestAction = parseInt(action);
          }
        }

        const prevVal = liveValues.get(stateKey) || -1000;
        const deltaLocal = Math.abs(prevVal - maxVal);
        liveDeltaMap.set(stateKey, deltaLocal);
        delta = Math.max(delta, deltaLocal);

        liveValues.set(stateKey, maxVal);
        livePolicyMap.set(stateKey, bestAction);

        liveMaxValueSeen = Math.max(liveMaxValueSeen, maxVal);
        const color = deltaToColor(maxVal, liveMaxValueSeen || 1);

        if (yellowMap.has(stateKey)) {
          yellowMap.get(stateKey).set({ fill: color });
        } else {
          const heatRect = new fabric.Rect({
            left: x - boxSize / 2,
            top: y - boxSize / 2,
            width: boxSize,
            height: boxSize,
            fill: color,
            selectable: false,
            evented: false,
            hoverCursor: 'default'
          });
          yellowMap.set(stateKey, heatRect);
          canvas.add(heatRect);
        }

        const arrowChar = ["↑", "↓", "←", "→"][bestAction];
        if (liveArrowMap.has(stateKey)) {
          liveArrowMap.get(stateKey).set({ text: arrowChar });
        } else {
          const arrow = new fabric.Text(arrowChar, {
            left: x,
            top: y,
            fontSize: 16,
            originX: 'center',
            originY: 'center',
            fill: 'black',
            selectable: false,
            evented: false
          });
          liveArrowMap.set(stateKey, arrow);
          canvas.add(arrow);
        }

        canvas.bringToFront(greenBox);
        canvas.requestRenderAll();
      }

      liveIterationCount++;
      valuePolicy = Object.fromEntries(livePolicyMap);
      iterationDisplay.innerText = "Iterations: " + liveIterationCount;
      // Update delta display
      updateDeltaDisplay(delta);
      checkPolicyPathLength();
    }
  } finally {
    resetGreenBox();
    
    // Update current state displays after algorithm completes
    const centerX = greenBox.left + BOX / 2;
    const centerY = greenBox.top + BOX / 2;
    updateCurrentStateDisplays(centerX, centerY);
    
    window._isLiveRunning = false;
  }
}

//Consts 
window.runValueIterationClientSide = runValueIterationClientSide;
let tfModel = null;

//Arrow images for functions that display arrows
const arrowImages = {
  0: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAVElEQVR4nN3TMQ4AIAgDQOL//4yTi6FSDXSQlSIXEs2+KXd3JjeqF1MPLh2j1At3VabUCpHmpNQJs1uhvkbI/ooo1y9kdSjfK7zVRXN9wldd1TysCW4VQ92yzXMJAAAAAElFTkSuQmCC", // up
  1: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAYElEQVR4nM2USRIAEAwEJ/7/5zipshtb6BNlZLocAL8jYaGquj1MRFy82R0GAG4UnCUZuGoZ37trmLcx5Pn7hrXWFrWcjWGrnTm3M+xZ9OxtDYHSZvS2xw1p2O/tnSGLB+FACFQuVF8qAAAAAElFTkSuQmCC", // down
  2: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAWklEQVR4nOXSKQ4AMQxDUXfU+185JQ1pFMVZ2Hxk9JCB3yQiAgB7CtLK4AuVQQ9KgxFEgywUglnIBauQAbuQ9ulYtzFwCjZgF3bBKhyCWZgGWTgNsnC7qR+bDlYlKD/HRuTJAAAAAElFTkSuQmCC", // left
  3: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAXUlEQVR4nNXUMQ4AIAhDUTDe/8o4mRglBGgX/9QwvBGRbzIzYzjjRlF4eEcEdkEEDsEOnAIrcAnMwC0wgiHQgycDVFXdGwJPCAI9qAVGUAnMQCmwAoVgB3pi/UN6C91sSAEM+763AAAAAElFTkSuQmCC"  // right
};
const canvas = new fabric.Canvas('c', {
  isDrawingMode: true,
  backgroundColor: 'black',
});

// Canvas size variables (instead of constants)
// Canvas size variables (change default to small)
let W = 600, H = 360; // Default to small instead of large
const R = 50;
const BOX = 20;

// Canvas size options
const CANVAS_SIZES = {
  small: { width: 600, height: 360 },
  medium: { width: 800, height: 480 },
  large: { width: 1000, height: 600 }
};

let stopFollowingPolicy = false;

let liveValues = null;
let livePolicyMap = null;
let liveArrowMap = null;
let liveIterationCount = 0;

const arrowMap = new Map(); // Ensures it's always available

// Define initial white areas at start and goal positions
const bottomLeft = new fabric.Circle({
  left: R + 10 - R,              // 10
  top: H - R - 10 - R,           // 490
  radius: R,
  fill: 'white',
  selectable: false,
  evented: false,
});
const topRight = new fabric.Circle({
  left: W - R - 10 - R,          // 890
  top: R + 10 - R,               // 10
  radius: R,
  fill: 'white',
  selectable: false,
  evented: false,
});
const redBox = new fabric.Rect({
  left: W - R - 10 - BOX / 2,    // 930
  top: R + 10 - BOX / 2,         // 50
  width: BOX,
  height: BOX,
  fill: 'purple',
  selectable: false,
  evented: false,
});
canvas.add(bottomLeft, topRight, redBox);

// Initialize green box (agent) at the bottom-left white area
// Change these from const to let so they can be updated
let greenStartX = Math.round((R + 10) / BOX) * BOX;   // 60 (center x of start)
let greenStartY = Math.round((H - R - 10) / BOX) * BOX; // 540 (center y of start)
const greenBox = new fabric.Rect({
  left: greenStartX - BOX / 2,   // 50
  top: greenStartY - BOX / 2,    // 530
  width: BOX,
  height: BOX,
  fill: 'green',
  selectable: false,
  evented: false,
});
canvas.add(greenBox);

canvas.renderAll();

// Keep goal and agent on top of any drawn paths
canvas.on('path:created', () => {
    canvas.bringToFront(redBox);
    canvas.bringToFront(greenBox);
    if (liveArrowMap) {
      for (const arrow of liveArrowMap.values()) {
        canvas.bringToFront(arrow);
      }
    }
  });
  

// Configure drawing brush for obstacles (white paths)
const brush = canvas.freeDrawingBrush;
brush.color = 'white';
brush.width = 60;


let iterationDisplay = document.getElementById("iterationCount");

let valuePolicy = {};

/** Get the center coordinates of the red goal box */
function getGoalCenter() {
  return {
    x: redBox.left + redBox.width / 2,
    y: redBox.top + redBox.height / 2
  };
}

/** Check if the 20x20 area at (x,y) is entirely white (walkable) */
async function isWhiteUnderBox(x, y) {
  // Temporarily hide the green box, red box, AND heatmap rectangles to inspect underlying pixels
  greenBox.visible = false;
  redBox.visible = false;
  
  // Hide all heatmap rectangles added by live value iteration
  const hiddenHeatRects = [];
  if (typeof yellowMap !== 'undefined' && yellowMap) {
    for (const [key, heatRect] of yellowMap.entries()) {
      if (heatRect.visible !== false) {
        heatRect.visible = false;
        hiddenHeatRects.push(heatRect);
      }
    }
  }
  
  // Hide all arrow/value text added by live value iteration
  const hiddenArrows = [];
  if (typeof liveArrowMap !== 'undefined' && liveArrowMap) {
    for (const [key, arrow] of liveArrowMap.entries()) {
      if (arrow.visible !== false) {
        arrow.visible = false;
        hiddenArrows.push(arrow);
      }
    }
  }
  
  canvas.requestRenderAll();

  // Render the entire canvas to an image (PNG)
  const dataURL = canvas.toDataURL({ format: 'png' });
  const img = new Image();
  img.src = dataURL;
  await new Promise(r => img.onload = r);

  const tmp = document.createElement('canvas');
  tmp.width = BOX;
  tmp.height = BOX;
  const ctx = tmp.getContext('2d');
  // Draw the image such that the top-left of the box area aligns at (0,0)
  ctx.drawImage(img, -x, -y);

  // Restore green box, red box, and all hidden elements
  greenBox.visible = true;
  redBox.visible = true;
  
  // Restore heatmap rectangles
  hiddenHeatRects.forEach(heatRect => {
    heatRect.visible = true;
  });
  
  // Restore arrows/value text
  hiddenArrows.forEach(arrow => {
    arrow.visible = true;
  });
  
  canvas.requestRenderAll();

  // Check the corner pixels of the 20x20 area for whiteness
  const data = ctx.getImageData(0, 0, BOX, BOX).data;
  const corners = [
    { cx: 0, cy: 0 },                 // top-left corner pixel
    { cx: BOX - 1, cy: 0 },           // top-right corner
    { cx: 0, cy: BOX - 1 },           // bottom-left corner
    { cx: BOX - 1, cy: BOX - 1 }      // bottom-right corner
  ];
  for (let { cx, cy } of corners) {
    const i = (cy * BOX + cx) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    // Consider a pixel "white" if it's very close to white (to allow for any aliasing)
    if (!(r > 240 && g > 240 && b > 240 && a > 200)) {
      return false;
    }
  }
  return true;
}

/** Manually move the green box in one of four directions (0=Up,1=Down,2=Left,3=Right) */
async function manualMove(action) {
  const [dx, dy] = {
    0: [0, -BOX],
    1: [0, BOX],
    2: [-BOX, 0],
    3: [BOX, 0],
  }[action];

  const nx = greenBox.left + dx;
  const ny = greenBox.top + dy;

  // Ensure the move stays within bounds and on white (walkable) area
  if (
    nx >= 0 && nx + BOX <= W &&
    ny >= 0 && ny + BOX <= H &&
    await isWhiteUnderBox(nx, ny)
  ) {
    // Update green box position
    greenBox.set({ left: nx, top: ny });
    canvas.renderAll();

    // Log the new position and distance to goal
    const centerX = nx + BOX / 2;
    const centerY = ny + BOX / 2;
    const goal = getGoalCenter();
    const dist = Math.sqrt((centerX - goal.x) ** 2 + (centerY - goal.y) ** 2).toFixed(2);
    console.log(`📦 Green box moved to (${centerX}, ${centerY})`);
    console.log(`🎯 Distance to goal: ${dist} pixels`);
    
    // Update agent position display
    updateAgentPositionDisplay(centerX, centerY);
    
    if (dist < BOX + 1) {
      console.log("🏁 Goal reached (manual)!");
    }
  } else {
    console.warn("❌ Invalid move or hit a black area.");
  }
}

/** Update the agent position display in the UI */
function updateAgentPositionDisplay(x, y) {
  // Update playground mode display
  const playgroundDisplay = document.getElementById("agentPosition");
  if (playgroundDisplay) {
    playgroundDisplay.textContent = `The agent is currently at state (${x}, ${y})`;
  }
  
  // Update tutorial mode display
  const tutorialDisplay = document.getElementById("tutorialAgentPosition");
  if (tutorialDisplay) {
    tutorialDisplay.textContent = `The agent is currently at state (${x}, ${y})`;
  }
  
  // Update compact displays (reward and value)
  if (typeof updateCurrentStateDisplays === 'function') {
    updateCurrentStateDisplays(x, y);
  }
}

/** Reset the green box back to its starting position */
function resetGreenBox() {
  stopFollowingPolicy = true;
  greenBox.set({
    left: greenStartX - BOX / 2,
    top: greenStartY - BOX / 2
  });
  canvas.renderAll();
  
  // Update position displays
  updateAgentPositionDisplay(greenStartX, greenStartY);
}

/** Convert the canvas image into a state object for value iteration */
async function parseCanvasToState() {
  // Hide the agent and goal while capturing the canvas for walkable area
  greenBox.visible = false;
  redBox.visible = false;
  canvas.requestRenderAll();

  // Render the entire canvas to an image (PNG)
  const dataURL = canvas.toDataURL({ format: 'png' });
  const img = new Image();
  await new Promise(resolve => {
    img.onload = resolve;
    img.src = dataURL;
  });
  // Draw the image onto a temporary canvas to access pixel data
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = img.width;
  tmpCanvas.height = img.height;
  const ctx = tmpCanvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, img.width, img.height).data;

  // Restore visibility of agent and goal
  greenBox.visible = true;
  redBox.visible = true;
  canvas.requestRenderAll();

  const walkable = [];
  for (let y = 0; y < img.height; y++) {
    walkable[y] = [];
    for (let x = 0; x < img.width; x++) {
      // A pixel is walkable if it's white (RGB all >240)
      const idx = (y * img.width + x) * 4;
      const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
      walkable[y][x] = (r > 240 && g > 240 && b > 240);
    }
  }
  // Determine agent (green) and goal (red) positions using their objects
  const agentCenterX = Math.floor(greenBox.left + BOX / 2);
  const agentCenterY = Math.floor(greenBox.top + BOX / 2);
  const agentPos = [Math.round(agentCenterX / BOX) * BOX, Math.round(agentCenterY / BOX) * BOX];
  const goalCenter = getGoalCenter();
  const goalPos = [Math.round(goalCenter.x / BOX) * BOX, Math.round(goalCenter.y / BOX) * BOX];

  return { agent_pos: agentPos, goal_pos: goalPos, walkableMask: walkable };
}

/** Follow the pre-computed optimal policy step-by-step */
async function followValuePolicy() {
    if (!valuePolicy || Object.keys(valuePolicy).length === 0) {
      console.warn("⚠️ No policy loaded. Run value iteration first.");
      alert("Please run value iteration first.");
      return;
    }
  
    stopFollowingPolicy = false;  // reset flag before starting
    console.log("📌 Policy Keys:", Object.keys(valuePolicy));
  
    let steps = 0;
    while (steps < 1000) {
      if (stopFollowingPolicy) {
        console.log("🛑 Policy execution stopped.");
        break;
      }
  
      const cx = Math.floor((greenBox.left + BOX / 2) / BOX) * BOX;
      const cy = Math.floor((greenBox.top + BOX / 2) / BOX) * BOX;
      const key = `${cx},${cy}`;
      const action = valuePolicy[key];
      console.log(`🔍 At (${cx}, ${cy}) → action:`, action);
  
      if (action === undefined) {
        console.warn("❌ No action found in policy for current position.");
        break;
      }
  
      const [dx, dy] = { 0: [0, -BOX], 1: [0, BOX], 2: [-BOX, 0], 3: [BOX, 0] }[action];
      const nx = greenBox.left + dx;
      const ny = greenBox.top + dy;
  
      greenBox.set({ left: nx, top: ny });
      canvas.renderAll();
  
      const goal = getGoalCenter();
      const dist = Math.sqrt((nx + BOX / 2 - goal.x) ** 2 + (ny + BOX / 2 - goal.y) ** 2);
      console.log(`📏 Distance to goal: ${dist.toFixed(2)}`);
      if (dist < BOX + 1) {
        console.log("🏁 Goal reached!");
        break;
      }
  
      await new Promise(r => setTimeout(r, 100));
      steps++;
    }
  
    console.log("🛑 Finished following policy.");
  }

function resizeCanvas(size) {
  // Update dimensions
  W = CANVAS_SIZES[size].width;
  H = CANVAS_SIZES[size].height;
  
  // Resize the actual canvas element
  canvas.setDimensions({ width: W, height: H });
  
  // Recalculate agent start position based on new canvas size
  greenStartX = Math.round((R + 10) / BOX) * BOX;
  greenStartY = Math.round((H - R - 10) / BOX) * BOX;
  
  // Clear and recreate everything
  resetEverything();
  
  // Update agent position display
  updateAgentPositionDisplay(greenStartX, greenStartY);
  
  console.log(`Canvas resized to ${size}: ${W}x${H}, agent at (${greenStartX}, ${greenStartY})`);
}

/** Perform value iteration on the given state (walkable grid) to compute optimal policy */
function runValueIterationOnState(state, gamma = 0.99, threshold = 1e-8) {
  const { walkableMask, goal_pos } = state;
  const boxSize = 20;
  const goalKey = `${goal_pos[0]},${goal_pos[1]}`;
  const values = new Map();
  const policyMap = new Map();
  let iterationCount = 0;
  let finalDelta = 0;
  const directions = {
    0: [0, -boxSize],   // up
    1: [0, boxSize],    // down
    2: [-boxSize, 0],   // left
    3: [boxSize, 0]     // right
  };
  // Helper to check if a 20x20 cell centered at (cx,cy) is fully walkable
  function isCellWalkable(cx, cy) {
    // Ensure the cell is fully inside canvas
    if (cx - 10 < 0 || cy - 10 < 0 || cx + 9 >= walkableMask[0].length || cy + 9 >= walkableMask.length) {
      return false;
    }
    // Check four corner pixels of that cell area
    return (
      walkableMask[cy - 10][cx - 10] &&
      walkableMask[cy - 10][cx + 9] &&
      walkableMask[cy + 9][cx - 10] &&
      walkableMask[cy + 9][cx + 9]
    );
  }
  // Build the list of valid state positions (centers of 20x20 cells that are walkable)
  const validStates = [];
  for (let cy = 0; cy < walkableMask.length; cy += boxSize) {
    for (let cx = 0; cx < walkableMask[0].length; cx += boxSize) {
      if (isCellWalkable(cx, cy)) {
        validStates.push([cx, cy]);
      }
    }
  }
  const validSet = new Set(validStates.map(([x, y]) => `${x},${y}`));

  // Value iteration loop
  const stepCost = 1;  // small penalty per move to discourage oscillation
  while (true) {
    iterationCount++;
    let delta = 0;
    const newValues = new Map();
    // Evaluate each state
    for (const [x, y] of validStates) {
      const stateKey = `${x},${y}`;
      // If this state is the goal, treat it as terminal (no action needed)
      if (stateKey === goalKey) {
        // Terminal state's value stays at 10 (goal reward)
        newValues.set(stateKey, 10);
        // No policy action for goal
        continue;
      }
      let maxVal = -Infinity;
      let bestAction = null;
      // Current distance to goal from this state
      const currDist = Math.hypot(x - goal_pos[0], y - goal_pos[1]);
      // Consider all possible actions
      for (const [action, [dx, dy]] of Object.entries(directions)) {
        const nx = x + dx;
        const ny = y + dy;
        const neighborKey = `${nx},${ny}`;
        if (!validSet.has(neighborKey)) continue;  // skip if neighbor cell is not walkable
        // Compute reward: positive if moving closer to goal, negative if farther
        const nextDist = Math.hypot(nx - goal_pos[0], ny - goal_pos[1]);
        let reward = calculateReward([x, y], [nx, ny], goal_pos); // Use new reward function
        // Apply a small step penalty for any move
        //reward -= stepCost;
        // Calculate value for this action
        let val;
        if (nextDist < boxSize) {
          // If this move reaches (or comes within one cell of) the goal, treat as terminal
          val = reward;  // Use reward from calculateReward function
        } else {
          val = reward + gamma * (values.get(neighborKey) || 0);
        }
        if (val > maxVal) {
          maxVal = val;
          bestAction = parseInt(action);
        }
      }
      if (bestAction !== null) {
        newValues.set(stateKey, maxVal);
        policyMap.set(stateKey, bestAction);
        delta = Math.max(delta, Math.abs((values.get(stateKey) || 0) - maxVal));
      }
    }
    // Update values for next iteration
    values.clear();
    for (const [key, val] of newValues.entries()) {
      values.set(key, val);
    }
    // Store the final delta for this iteration
    finalDelta = delta;
    // Check for convergence
    if (delta < threshold) break;
  }
  
  // Store values in global liveValues map so UI can access them
  if (!liveValues) {
    liveValues = new Map();
  } else {
    liveValues.clear(); // Clear any previous values
  }
  
  // Copy computed values to global map
  for (const [key, val] of values.entries()) {
    liveValues.set(key, val);
  }
  
  return {
    policy: Object.fromEntries(policyMap),
    iterations: iterationCount,
    finalDelta: finalDelta
  };
}

/** Run value iteration on the current canvas state (computes the optimal policy) */
async function runValueIterationClientSide() {
  // Use default values for tutorial mode, or get from inputs for playground mode
  let gamma, threshold;
  if (isTutorialMode) {
    gamma = 0.99;
    threshold = 1e-4;
  } else {
    const gammaInput = parseFloat(document.getElementById("gamma").value);
    const epsInput = parseFloat(document.getElementById("threshold").value);
    gamma = isNaN(gammaInput) ? 0.99 : gammaInput;
    threshold = isNaN(epsInput) ? 1e-4 : epsInput;
  }

  // Parse the canvas into a state representation
  const state = await parseCanvasToState();
  // Perform value iteration on the state
  const result = runValueIterationOnState(state, gamma, threshold);
  valuePolicy = result.policy;
  iterationDisplay.innerText = "Iterations: " + result.iterations;
  
  // Update delta display after convergence
  updateDeltaDisplay(result.finalDelta);
  
  console.log("📌 Policy Keys:", Object.keys(valuePolicy));
  await checkPolicyPathLength();
  const centerX = greenBox.left + BOX / 2;
  const centerY = greenBox.top + BOX / 2;
  updateCurrentStateDisplays(centerX, centerY);
}

function deltaToColor(value, max) {
  if (max === 0) return 'rgb(0,0,0)';
  const ratio = Math.min(Math.max(value / max, 0), 1.0);
  const r = Math.floor(255 * (1 - ratio));
  const g = Math.floor(255 * ratio);
  return `rgb(${r},${g},0)`; // red to green
}

// Helper function to update delta display consistently across all algorithms
function updateDeltaDisplay(delta) {
  const deltaDisplay = document.getElementById("deltaDisplay");
  if (deltaDisplay) {
    if (delta === null || delta === undefined) {
      deltaDisplay.innerText = "Δ: -";
    } else {
      deltaDisplay.innerText = `Δ: ${delta.toFixed(6)}`;
    }
  }
}

// Function to update displays when parameters change
function updateParameterDisplays() {
  const gamma = parseFloat(document.getElementById("gamma")?.value) || 0.99;
  const threshold = parseFloat(document.getElementById("threshold")?.value) || 1e-4;
  const rewardFunction = document.getElementById("rewardFunction")?.value || 'zero';
  
  console.log(`📊 Parameters updated: γ=${gamma}, ε=${threshold}, reward=${rewardFunction}`);
  
  // Update current state displays when reward function changes
  const centerX = greenBox.left + BOX / 2;
  const centerY = greenBox.top + BOX / 2;
  updateCurrentStateDisplays(centerX, centerY);
  
  // Update any running step-by-step displays
  if (window._isLiveRunning && stepByStepPaused) {
    // Refresh the current step-by-step display with new parameters
    console.log("🔄 Refreshing step-by-step with new parameters");
  }
}

// Get current reward function setting
function getCurrentRewardFunction() {
  return document.getElementById("rewardFunction")?.value || 'zero';
}

// Calculate reward based on current reward function setting
function calculateReward(currentPos, nextPos, goalPos) {
  const rewardFunction = getCurrentRewardFunction();
  
  // Check if reaching goal
  const nextDist = Math.hypot(nextPos[0] - goalPos[0], nextPos[1] - goalPos[1]);
  if (nextDist < 20) { // BOX size
    return 10; // Always give positive reward for reaching goal
  }
  
  if (rewardFunction === 'negative_distance') {
    // Negative distance to goal
    const distanceToGoal = Math.hypot(nextPos[0] - goalPos[0], nextPos[1] - goalPos[1]);
    return -distanceToGoal / 20; // Normalize by box size
  } else if (rewardFunction === 'positive_distance') {
    // Positive reward for getting closer to goal
    const currentDist = Math.hypot(currentPos[0] - goalPos[0], currentPos[1] - goalPos[1]);
    const nextDist = Math.hypot(nextPos[0] - goalPos[0], nextPos[1] - goalPos[1]);
    return (currentDist - nextDist) / 20; // Positive if getting closer
  } else {
    // Zero reward (default)
    return 0;
  }
}

// Format numbers for step-by-step display: >=10 shows whole numbers, <10 shows 1 decimal
function formatStepByStepNumber(num) {
  if (Math.abs(num) >= 10) {
    return Math.round(num).toString();
  } else {
    return num.toFixed(1);
  }
}

// Function to switch reward function and update any running algorithms
function switchRewardFunction(newRewardFunction) {
  const rewardSelect = document.getElementById("rewardFunction");
  if (rewardSelect) {
    rewardSelect.value = newRewardFunction;
  }
  
  console.log(`🎯 Switched to reward function: ${newRewardFunction}`);
  updateParameterDisplays();
  
  // If we're in live mode, we might want to restart or update
  if (window._isLiveRunning) {
    console.log("⚠️ Reward function changed during live execution");
  }
}

if (typeof yellowMap === 'undefined') yellowMap = new Map();
if (typeof liveValueIterationState === 'undefined') liveValueIterationState = null;
if (typeof deltaTextMap === 'undefined') deltaTextMap = new Map();
if (typeof liveMaxValueSeen === 'undefined') liveMaxValueSeen = 1;
if (typeof liveDeltaMap === 'undefined') liveDeltaMap = new Map();

async function runLiveValueIteration() {
  if (window._isLiveRunning) {
    console.warn("⚠️ Already running. Ignoring duplicate call.");
    return;
  }
  window._isLiveRunning = true;
  console.log("🔁 runLiveValueIteration triggered");

  const gammaInput = parseFloat(document.getElementById("gamma").value);
  const epsInput = parseFloat(document.getElementById("threshold").value);
  const gamma = isNaN(gammaInput) ? 0.99 : gammaInput;
  const threshold = isNaN(epsInput) ? 1e-4 : epsInput;
  const delayMs = parseInt(document.getElementById("delayMs").value) || 120;
  const totalIterations = parseInt(document.getElementById("liveIters").value) || 1;

  if (!liveValueIterationState) {
    liveValueIterationState = await parseCanvasToState();
  }

  const { walkableMask, goal_pos } = liveValueIterationState;
  const boxSize = 20;
  const goalKey = `${goal_pos[0]},${goal_pos[1]}`;

  const directions = {
    0: [0, -boxSize],
    1: [0, boxSize],
    2: [-boxSize, 0],
    3: [boxSize, 0],
  };

  function isCellWalkable(cx, cy) {
    if (cx - 10 < 0 || cy - 10 < 0 || cx + 9 >= walkableMask[0].length || cy + 9 >= walkableMask.length) {
      return false;
    }
    return (
      walkableMask[cy - 10][cx - 10] &&
      walkableMask[cy - 10][cx + 9] &&
      walkableMask[cy + 9][cx - 10] &&
      walkableMask[cy + 9][cx + 9]
    );
  }

  const validStates = [];
  for (let cy = 0; cy < walkableMask.length; cy += boxSize) {
    for (let cx = 0; cx < walkableMask[0].length; cx += boxSize) {
      if (isCellWalkable(cx, cy)) {
        validStates.push([cx, cy]);
      }
    }
  }

  const validSet = new Set(validStates.map(([x, y]) => `${x},${y}`));

  // Initialize or reset all live iteration maps
  if (!liveValues || liveValues === null) {
    liveValues = new Map();
  }
  if (!livePolicyMap || livePolicyMap === null) {
    livePolicyMap = new Map();
  }
  if (!liveArrowMap || liveArrowMap === null) {
    liveArrowMap = new Map();
  }
  if (typeof liveIterationCount === 'undefined' || liveIterationCount === null) {
    liveIterationCount = 0;
  }

  if (typeof liveDeltaMap === 'undefined') liveDeltaMap = new Map();
  if (typeof liveMaxValueSeen === 'undefined') liveMaxValueSeen = 1;

  for (const [x, y] of validStates) {
    const key = `${x},${y}`;
    if (key !== goalKey && !liveValues.has(key)) {
      liveValues.set(key, -1000);
    }
  }

  try {
    for (let iter = 0; iter < totalIterations; iter++) {
      let delta = 0;

      for (const [x, y] of validStates) {
        const stateKey = `${x},${y}`;
        if (stateKey === goalKey) {
          liveValues.set(stateKey, 10); // Use consistent goal value
          continue;
        }

        // const lastDelta = liveDeltaMap.get(stateKey);
        // if (lastDelta !== undefined && lastDelta < threshold) {
        //   continue;
        // }

        greenBox.set({ left: x - boxSize / 2, top: y - boxSize / 2 });
        canvas.bringToFront(greenBox);
        canvas.requestRenderAll();
        await new Promise(r => setTimeout(r, delayMs));

        let maxVal = -Infinity;
        let bestAction = null;

        for (const [action, [dx, dy]] of Object.entries(directions)) {
          const nx = x + dx;
          const ny = y + dy;
          const neighborKey = `${nx},${ny}`;
          if (!validSet.has(neighborKey)) continue;

          const nextDist = Math.hypot(nx - goal_pos[0], ny - goal_pos[1]);
          const reward = calculateReward([x, y], [nx, ny], goal_pos); // Use new reward function

          const val = nextDist < boxSize
            ? 10 // Simple goal reward for tutorial
            : reward + gamma * (liveValues.get(neighborKey) || -1000);

          if (val > maxVal) {
            maxVal = val;
            bestAction = parseInt(action);
          }
        }

        const prevVal = liveValues.get(stateKey) || -1000;
        const deltaLocal = Math.abs(prevVal - maxVal);
        liveDeltaMap.set(stateKey, deltaLocal);
        delta = Math.max(delta, deltaLocal);

        liveValues.set(stateKey, maxVal);
        livePolicyMap.set(stateKey, bestAction);

        liveMaxValueSeen = Math.max(liveMaxValueSeen, maxVal);
        const color = deltaToColor(maxVal, liveMaxValueSeen || 1);

        if (yellowMap.has(stateKey)) {
          yellowMap.get(stateKey).set({ fill: color });
        } else {
          const heatRect = new fabric.Rect({
            left: x - boxSize / 2,
            top: y - boxSize / 2,
            width: boxSize,
            height: boxSize,
            fill: color,
            selectable: false,
            evented: false,
            hoverCursor: 'default'
          });
          yellowMap.set(stateKey, heatRect);
          canvas.add(heatRect);
        }

        const arrowChar = ["↑", "↓", "←", "→"][bestAction];
        if (liveArrowMap.has(stateKey)) {
          liveArrowMap.get(stateKey).set({ text: arrowChar });
        } else {
          const arrow = new fabric.Text(arrowChar, {
            left: x,
            top: y,
            fontSize: 16,
            originX: 'center',
            originY: 'center',
            fill: 'black',
            selectable: false,
            evented: false
          });
          liveArrowMap.set(stateKey, arrow);
          canvas.add(arrow);
        }

        canvas.bringToFront(greenBox);
        canvas.requestRenderAll();
      }

      liveIterationCount++;
      valuePolicy = Object.fromEntries(livePolicyMap);
      iterationDisplay.innerText = "Iterations: " + liveIterationCount;
      // Update delta display
      updateDeltaDisplay(delta);
      checkPolicyPathLength();
    }
  } finally {
    resetGreenBox();
    
    // Update current state displays after algorithm completes
    const centerX = greenBox.left + BOX / 2;
    const centerY = greenBox.top + BOX / 2;
    updateCurrentStateDisplays(centerX, centerY);
    
    window._isLiveRunning = false;
  }
}
async function prepareLiveValueIteration() {
  const state = await parseCanvasToState();
  await runLiveValueIteration(state);
}

function resetEverything() {
  // Stop live value iteration if it's running
  if (window._isLiveRunning) {
    window._isLiveRunning = false;
  }
  if (window._liveLoop) {
    cancelAnimationFrame(window._liveLoop);
    window._liveLoop = null;
  }
  liveValueIterationState = null;

  // Clear canvas
  canvas.clear();
  canvas.backgroundColor = 'black';

  // Reset globals
  valuePolicy = {};
  liveValues = new Map(); // Reset to empty map instead of null
  livePolicyMap = new Map();
  liveArrowMap = new Map();
  liveIterationCount = 0;
  
  // Clear maps
  if (typeof yellowMap !== 'undefined') yellowMap.clear();
  if (typeof arrowMap !== 'undefined') arrowMap.clear();
  if (typeof liveDeltaMap !== 'undefined') liveDeltaMap.clear();
  
  // Reset other globals
  if (typeof liveMaxValueSeen !== 'undefined') liveMaxValueSeen = 1;
  
  // Reset displays
  iterationDisplay.innerText = "Iterations: -";
  updateDeltaDisplay(null); // Reset delta to show "-"
  
  // Reset path check result
  const pathCheckResult = document.getElementById("pathCheckResult");
  if (pathCheckResult) {
    pathCheckResult.innerText = "Path length: -";
  }

  // Recalculate positions based on current canvas size
  greenStartX = Math.round((R + 10) / BOX) * BOX;
  greenStartY = Math.round((H - R - 10) / BOX) * BOX;

  // Recreate white circles (start and goal areas)
  const bottomLeft = new fabric.Circle({
    left: R + 10 - R,              // 10
    top: H - R - 10 - R,           // varies with H
    radius: R,
    fill: 'white',
    selectable: false,
    evented: false,
  });

  const topRight = new fabric.Circle({
    left: W - R - 10 - R,          // varies with W
    top: R + 10 - R,               // 10
    radius: R,
    fill: 'white',
    selectable: false,
    evented: false,
  });

  // Recreate red goal box
  redBox.set({
    left: W - R - 10 - BOX / 2,    // varies with W
    top: R + 10 - BOX / 2,         // 50
  });

  // Recreate green agent box
  greenBox.set({
    left: greenStartX - BOX / 2,
    top: greenStartY - BOX / 2,
  });

  // Re-add to canvas
  canvas.add(bottomLeft, topRight, redBox, greenBox);
  canvas.renderAll();
  
  // Update displays with reset agent position
  updateAgentPositionDisplay(greenStartX, greenStartY);
  
  console.log(`Reset everything for canvas ${W}x${H}, agent at (${greenStartX}, ${greenStartY})`);
}


async function checkPolicyPathLength() {
  const resultElement = document.getElementById("pathCheckResult");

  // ✅ Helper to verify 20x20 cell walkability
  function isCellWalkable(cx, cy, mask) {
    if (
      cx - 10 < 0 || cy - 10 < 0 ||
      cy + 9 >= mask.length || cx + 9 >= mask[0].length
    ) return false;

    return (
      mask[cy - 10][cx - 10] &&
      mask[cy - 10][cx + 9] &&
      mask[cy + 9][cx - 10] &&
      mask[cy + 9][cx + 9]
    );
  }

  if (!valuePolicy || Object.keys(valuePolicy).length === 0) {
    resultElement.innerText = "Path length: - (no policy yet)";
    console.log("🔍 No policy found");
    return;
  }

  const state = await parseCanvasToState();
  const { agent_pos, goal_pos, walkableMask } = state;
  let [x, y] = agent_pos;
  const goalX = goal_pos[0], goalY = goal_pos[1];

  const visited = new Set();
  const getKey = (x, y) => `${x},${y}`;
  const directions = {
    0: [0, -BOX],  // up
    1: [0, BOX],   // down
    2: [-BOX, 0],  // left
    3: [BOX, 0],   // right
  };

  console.log(`🚦 Starting policy validation from (${x}, ${y}) to goal at (${goalX}, ${goalY})`);

  for (let step = 0; step < 500; step++) {
    const key = getKey(x, y);
    console.log(`🔄 Step ${step}: at (${x}, ${y}), key = ${key}`);

    // ✅ Check if agent is adjacent to goal
    if (
      (Math.abs(x - goalX) === BOX && y === goalY) ||
      (Math.abs(y - goalY) === BOX && x === goalX)
    ) {
      resultElement.innerText = `✅ Valid path found! Length: ${step}`;
      console.log("✅ Adjacent to goal — path is valid");
      return;
    }

    if (visited.has(key)) {
      resultElement.innerText = "❌ Policy loops or is invalid (cycle detected)";
      console.warn("🔁 Cycle detected at", key);
      return;
    }
    visited.add(key);

    const action = valuePolicy[key];
    if (action === undefined) {
      resultElement.innerText = "❌ Policy incomplete — no path to goal";
      console.warn("⛔ No action for key:", key);
      return;
    }

    const [dx, dy] = directions[action];
    const nextX = x + dx, nextY = y + dy;

    console.log(`➡️ Action: ${action}, moving to (${nextX}, ${nextY})`);

    // ✅ Use correct full-cell walkability check
    if (!isCellWalkable(nextX, nextY, walkableMask)) {
      resultElement.innerText = "❌ Invalid move encountered (not walkable)";
      console.error("❌ Move to", nextX, nextY, "is not walkable");
      return;
    } else {
      console.log(`✅ Move to (${nextX}, ${nextY}) is walkable`);
    }

    // Step to next position
    x = nextX;
    y = nextY;
  }

  resultElement.innerText = "❌ Path not found within step limit";
  console.warn("🕓 Max steps exceeded without reaching goal");
}

// Step-by-Step Value Iteration with Status Bar
async function runLiveValueIteration_step_by_step() {
  console.log("🔍 Step-by-step function called");
  
  if (window._isLiveRunning) {
    console.warn("⚠️ Already running. Ignoring duplicate call.");
    return;
  }
  window._isLiveRunning = true;
  console.log("🔁 runLiveValueIteration_step_by_step triggered");

  // Use different input sources depending on mode
  let gamma, threshold, delayMs, totalIterations;
  
  if (isTutorialMode) {
    gamma = 0.99;
    threshold = 1e-4;
    delayMs = 50; // Faster for tutorial to avoid waiting
    totalIterations = 1;
  } else {
    // Playground mode - use the input fields
    gamma = parseFloat(document.getElementById("gamma")?.value) || 0.99;
    threshold = parseFloat(document.getElementById("threshold")?.value) || 1e-4;
    delayMs = parseInt(document.getElementById("delayMs")?.value) || 120;
    totalIterations = parseInt(document.getElementById("liveIters")?.value) || 1;
  }

  console.log("📊 Parameters:", { gamma, threshold, delayMs, totalIterations });

  liveValueIterationState = await parseCanvasToState();

  const { walkableMask, goal_pos } = liveValueIterationState;
  const boxSize = 20;
  const goalKey = `${goal_pos[0]},${goal_pos[1]}`;
  console.log("🎯 Goal position:", goal_pos);

  const directions = {
    0: [0, -boxSize],   // up
    1: [0, boxSize],    // down
    2: [-boxSize, 0],   // left
    3: [boxSize, 0],    // right
  };

  const actionNames = ["up", "down", "left", "right"];

  function isCellWalkable(cx, cy) {
    if (cx - 10 < 0 || cy - 10 < 0 || cx + 9 >= walkableMask[0].length || cy + 9 >= walkableMask.length) {
      return false;
    }
    return (
      walkableMask[cy - 10][cx - 10] &&
      walkableMask[cy - 10][cx + 9] &&
      walkableMask[cy + 9][cx - 10] &&
      walkableMask[cy + 9][cx + 9]
    );
  }

  const validStates = [];
  for (let cy = 0; cy < walkableMask.length; cy += boxSize) {
    for (let cx = 0; cx < walkableMask[0].length; cx += boxSize) {
      if (isCellWalkable(cx, cy)) {
        validStates.push([cx, cy]);
      }
    }
  }
  console.log("📍 Found", validStates.length, "valid states");

  const validSet = new Set(validStates.map(([x, y]) => `${x},${y}`));

  // Initialize or reset all live iteration maps
  if (!liveValues || liveValues === null) {
    liveValues = new Map();
  }
  if (!livePolicyMap || livePolicyMap === null) {
    livePolicyMap = new Map();
  }
  if (!liveArrowMap || liveArrowMap === null) {
    liveArrowMap = new Map();
  }
  if (typeof liveIterationCount === 'undefined' || liveIterationCount === null) {
    liveIterationCount = 0;
  }

  if (typeof liveDeltaMap === 'undefined') liveDeltaMap = new Map();
  if (typeof liveMaxValueSeen === 'undefined') liveMaxValueSeen = 1;

  // Initialize values - use smaller starting values for step-by-step mode
  for (const [x, y] of validStates) {
    const key = `${x},${y}`;
    if (key !== goalKey && !liveValues.has(key)) {
      liveValues.set(key, 0); // Start with 0 instead of -1000 for cleaner display
    }
  }

  // Show step-by-step controls and status bar
  showStepByStepControls();
  showStepByStepStatusBar();
  updateStepByStepStatusBar("<b>🚀 Starting step-by-step analysis...</b> Click 'Next Step' to begin!");

  try {
    console.log("🔄 Starting infinite step-by-step loop");
    
    // Infinite loop - user can keep stepping through states forever
    while (true) {
      let delta = 0;
      console.log(`📊 Starting iteration ${liveIterationCount + 1}`);

      for (let stateIndex = 0; stateIndex < validStates.length; stateIndex++) {
        // Check if user stopped the process
        if (!window._isLiveRunning) {
          console.log("🛑 Step-by-step stopped by user");
          return;
        }

        const [x, y] = validStates[stateIndex];
        const stateKey = `${x},${y}`;
        
        console.log(`🔍 Processing state ${stateIndex + 1}/${validStates.length}: (${x}, ${y})`);
        
        if (stateKey === goalKey) {
          liveValues.set(stateKey, 10); // Set goal value to 10 for step-by-step mode
          
          // Display the goal value
          if (liveArrowMap.has(stateKey)) {
            liveArrowMap.get(stateKey).set({ 
              text: "10",
              fontSize: 12,
              fill: 'white',
              stroke: 'black',
              strokeWidth: 1
            });
          } else {
            const goalValueDisplay = new fabric.Text("10", {
              left: x,
              top: y,
              fontSize: 12,
              originX: 'center',
              originY: 'center',
              fill: 'white',
              stroke: 'black',
              strokeWidth: 1,
              selectable: false,
              evented: false
            });
            liveArrowMap.set(stateKey, goalValueDisplay);
            canvas.add(goalValueDisplay);
          }
          
          console.log("🎯 Updated goal state value display");
          continue;
        }

        // Move green box to current state
        greenBox.set({ left: x - boxSize / 2, top: y - boxSize / 2 });
        canvas.bringToFront(greenBox);
        canvas.requestRenderAll();
        
        // Update agent position display in status bar
        updateAgentPositionDisplay(x, y);
        
        // Small delay to show movement
        if (delayMs > 0) {
          await new Promise(r => setTimeout(r, delayMs));
        }

        const prevVal = liveValues.get(stateKey) || 0; // Use 0 as default for step-by-step
        
        let maxVal = -Infinity;
        let bestActions = [];
        let bestReward = 0;
        let bestNextValue = 0;
        let bestNextState = '';
        
        // Find all actions that lead to the maximum value
        for (const [action, [dx, dy]] of Object.entries(directions)) {
          const actionNum = parseInt(action);
          const nx = x + dx;
          const ny = y + dy;
          const neighborKey = `${nx},${ny}`;
          let val;
          let reward; // Single declaration of reward here
          let nextStateValue = 0;
          
          if (!validSet.has(neighborKey)) {
            val = -Infinity;
            reward = 0;
          } else {
            const nextDist = Math.hypot(nx - goal_pos[0], ny - goal_pos[1]);
            nextStateValue = liveValues.get(neighborKey) || 0;
            
            reward = calculateReward([x, y], [nx, ny], goal_pos); // Just assign, don't redeclare
            val = reward + gamma * nextStateValue;
          }
          
          if (val > maxVal) {
            maxVal = val;
            bestActions = [actionNum];
            bestReward = reward;
            bestNextValue = nextStateValue;
            bestNextState = `${nx},${ny}`;
          } else if (val === maxVal && val !== -Infinity) {
            bestActions.push(actionNum);
          }
        }
        
        const deltaLocal = Math.abs(prevVal - maxVal);
        
        // Create action list string (e.g., "up/left/right")
        const actionString = bestActions.map(a => actionNames[a]).join('/');
        
        // Get next state coordinates for display
        const [nextX, nextY] = bestNextState.split(',').map(Number);
        
        // Update step-by-step status bar with two-line format and color coding
        const line1 = `<b>V(${x},${y})</b> = ${prevVal.toFixed(2)} | <b>Max action</b> = ${actionString} | <b>S'</b> = (${nextX},${nextY}) | <span style="background-color: yellow; padding: 2px 4px; border-radius: 3px;"><b>r(s')</b> = ${bestReward.toFixed(2)}</span> | <span style="background-color: cyan; padding: 2px 4px; border-radius: 3px;"><b>V(s')</b> = ${bestNextValue.toFixed(2)}</span> | <b>γ</b> = ${gamma.toFixed(2)}`;
        const line2 = `<b>V'(${x},${y})</b> ← <span style="background-color: yellow; padding: 2px 4px; border-radius: 3px;">${bestReward.toFixed(2)}</span> + ${gamma.toFixed(2)} * <span style="background-color: cyan; padding: 2px 4px; border-radius: 3px;">${bestNextValue.toFixed(2)}</span> = ${maxVal.toFixed(2)}`;
        updateStepByStepStatusBar(line1, line2);

        // Wait for user to click "Next Step"
        console.log("⏸️ Waiting for user to click Next Step...");
        stepByStepPaused = true;
        await new Promise(resolve => {
          stepByStepResolver = resolve;
        });
        console.log("▶️ User clicked Next Step, continuing...");

        // Check again if user stopped while waiting
        if (!window._isLiveRunning) {
          console.log("🛑 Step-by-step stopped by user during wait");
          return;
        }

        // Update values and visualization
        liveDeltaMap.set(stateKey, deltaLocal);
        delta = Math.max(delta, deltaLocal);
        liveValues.set(stateKey, maxVal);
        livePolicyMap.set(stateKey, bestActions[0]); // Use first best action for policy

        // Update delta display after each state
        updateDeltaDisplay(delta);

        // Update heatmap visualization (adjust for smaller values)
        liveMaxValueSeen = Math.max(liveMaxValueSeen, Math.max(maxVal, 10)); // Include goal value in max
        const color = deltaToColor(maxVal, liveMaxValueSeen || 10);

        if (yellowMap.has(stateKey)) {
          yellowMap.get(stateKey).set({ fill: color });
        } else {
          const heatRect = new fabric.Rect({
            left: x - boxSize / 2,
            top: y - boxSize / 2,
            width: boxSize,
            height: boxSize,
            fill: color,
            selectable: false,
            evented: false,
            hoverCursor: 'default'
          });
          yellowMap.set(stateKey, heatRect);
          canvas.add(heatRect);
        }

        // Add value text instead of arrow for step-by-step mode
        const valueText = formatStepByStepNumber(maxVal);
        if (liveArrowMap.has(stateKey)) {
          liveArrowMap.get(stateKey).set({ 
            text: valueText,
            fontSize: 12,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1
          });
        } else {
          const valueDisplay = new fabric.Text(valueText, {
            left: x,
            top: y,
            fontSize: 12,
            originX: 'center',
            originY: 'center',
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1,
            selectable: false,
            evented: false
          });
          liveArrowMap.set(stateKey, valueDisplay);
          canvas.add(valueDisplay);
        }

        canvas.bringToFront(greenBox);
        canvas.requestRenderAll();
      }

      // Completed one full iteration through all states
      liveIterationCount++;
      valuePolicy = Object.fromEntries(livePolicyMap);
      iterationDisplay.innerText = "Iterations: " + liveIterationCount;
      // Update delta display
      updateDeltaDisplay(delta);
      checkPolicyPathLength();
      
      // Show iteration completion message in status bar
      updateStepByStepStatusBar(`<b>📋 Iteration ${liveIterationCount} Complete!</b> Δ = ${delta.toFixed(6)} - Click "Next Step" to start iteration ${liveIterationCount + 1}`);
      
      // Wait for user to start next iteration
      console.log("⏸️ Waiting for user to start next iteration...");
      stepByStepPaused = true;
      await new Promise(resolve => {
        stepByStepResolver = resolve;
      });
      
      // Check if user stopped during iteration break
      if (!window._isLiveRunning) {
        console.log("🛑 Step-by-step stopped by user");
        return;
      }
      
      console.log(`▶️ Starting iteration ${liveIterationCount + 1}...`);
    }
  } catch (error) {
    console.error("❌ Error in step-by-step iteration:", error);
  } finally {
    resetGreenBox();
    window._isLiveRunning = false;
    
    // Show final message when stopped
    updateStepByStepStatusBar("<b>🛑 Step-by-step stopped</b> - You can restart step-by-step mode or use 'Follow Optimal Policy' to see the agent navigate.");
    
    // Hide step-by-step controls when stopped
    hideStepByStepControls();
    
    // Hide status bar after a short delay to show the final message
    setTimeout(() => {
      hideStepByStepStatusBar();
    }, 3000);
  }
}

// Function to handle the "Next Step" button click
function nextStepClick() {
  console.log("🔄 Next step clicked");
  if (stepByStepPaused && stepByStepResolver) {
    stepByStepPaused = false;
    stepByStepResolver();
    stepByStepResolver = null;
  } else {
    console.warn("⚠️ Next step clicked but not in paused state");
  }
}

// Show/hide step-by-step controls in the new locations
function showStepByStepControls() {
  // Show buttons beside the canvas status bar (now external)
  const stopContainer = document.getElementById('stepByStepStopContainer');
  const nextContainer = document.getElementById('stepByStepNextContainer');
  
  if (stopContainer) {
    stopContainer.style.display = 'block';
  }
  if (nextContainer) {
    nextContainer.style.display = 'block';
  }
  
  console.log("👁️ Step-by-step controls shown external to canvas status bar");
}

function hideStepByStepControls() {
  // Hide buttons beside the canvas status bar
  const stopContainer = document.getElementById('stepByStepStopContainer');
  const nextContainer = document.getElementById('stepByStepNextContainer');
  
  if (stopContainer) {
    stopContainer.style.display = 'none';
  }
  if (nextContainer) {
    nextContainer.style.display = 'none';
  }
  
  console.log("🙈 Step-by-step controls hidden");
}

// Add these new functions to show/hide the step-by-step status bar
function showStepByStepStatusBar() {
  const statusBar = document.getElementById('stepByStepStatusBar');
  if (statusBar) {
    statusBar.style.display = 'flex';
  }
}

function hideStepByStepStatusBar() {
  const statusBar = document.getElementById('stepByStepStatusBar');
  if (statusBar) {
    statusBar.style.display = 'none';
  }
}

function updateStepByStepStatusBar(line1, line2 = null) {
  const statusText = document.getElementById('stepByStepStatus');
  if (statusText) {
    if (line2) {
      // Two-line format for step analysis
      statusText.innerHTML = `<div style="margin-bottom: 4px;">${line1}</div><div>${line2}</div>`;
    } else {
      // Single line format for other messages
      statusText.innerHTML = `<div>${line1}</div>`;
    }
    statusText.style.color = 'black';
    statusText.style.fontWeight = '500';
    statusText.style.lineHeight = '1.4';
    statusText.style.fontSize = '12px';
    statusText.style.whiteSpace = 'nowrap'; // Prevent wrapping within each line
  }
}

// Also modify the stopStepByStep function to hide the status bar
function stopStepByStep() {
  console.log("🛑 Stop step-by-step clicked");
  
  // Stop the running loop
  window._isLiveRunning = false;
  
  // If currently waiting for user input, resolve it to exit cleanly
  if (stepByStepResolver) {
    stepByStepResolver();
    stepByStepResolver = null;
  }
  stepByStepPaused = false;
  
  // Hide step-by-step controls and status bar
  hideStepByStepControls();
  hideStepByStepStatusBar();
  
  resetGreenBox();
}

// Introduction Mode Variables
let hasRunValueIteration = false;

// Switch to Introduction Mode Function
function switchToIntroductionMode() {
  // Stop step-by-step if it's running
  if (window._isLiveRunning && (stepByStepPaused || stepByStepResolver)) {
    console.log("🛑 Stopping step-by-step due to navigation");
    stopStepByStep();
  }
  
  // Remove all mode classes
  document.body.className = '';
  
  // Update button states
  document.getElementById('introduction-mode-btn').classList.add('active');
  document.getElementById('tutorial-mode-btn').classList.remove('active');
  document.getElementById('playground-mode-btn').classList.remove('active');
  
  // Update header subtitle
  document.getElementById('header-subtitle').textContent = 'Interactive introduction to reinforcement learning algorithms';
  
  // Show introduction elements, hide others
  // Show introduction elements, hide others
document.querySelectorAll('.introduction-only').forEach(el => {
  el.style.display = 'block';
});
document.querySelectorAll('.tutorial-only').forEach(el => {
  el.style.display = 'none';  // Force hide with inline style
});
document.querySelectorAll('.playground-only').forEach(el => {
  el.style.display = 'none';
});
  
  // Explicitly hide all tutorial parts that might have been shown
  document.querySelectorAll('.tutorial-part').forEach(part => {
    part.style.display = 'none';
  });
  
  // Hide all tutorial control parts
  document.querySelectorAll('.tutorial-controls-part').forEach(controls => {
    controls.style.display = 'none';
  });
  
  // Hide all additional content for all parts
  for (let i = 1; i <= 4; i++) {
    const additionalContent = document.getElementById(`tutorial-part-${i}-additional`);
    if (additionalContent) {
      additionalContent.style.display = 'none';
    }
  }
  
  // EXPLICITLY hide the algorithm section that might have inline styles
  const algorithmSection = document.querySelector('section[style*="background: #2c3e50"]');
  if (algorithmSection) {
    algorithmSection.style.display = 'none';
  }
  
  // Remove all tutorial highlighting
  removeAllTutorialHighlighting();
  
  // Reset introduction demo state
  resetIntroductionDemo();
  
  console.log('Switched to Introduction Mode');
}

// Demo Functions for Introduction Mode
async function runValueIterationDemo() {
  const statusDiv = document.getElementById('intro-status');
  const statusText = document.getElementById('status-text');
  const followBtn = document.getElementById('follow-path-btn');
  
  // Show status
//   statusDiv.style.display = 'block';
//   statusText.textContent = 'Running value iteration...';
  
//   // Use your existing value iteration function
//   runValueIterationClientSide().then(() => {
//     statusText.textContent = 'Value iteration complete! Optimal policy computed.';
//     followBtn.style.display = 'inline-block';
//     hasRunValueIteration = true;
//   }).catch(() => {
//     // Fallback if your function doesn't return a promise
//     setTimeout(() => {
//       statusText.textContent = 'Value iteration complete! Optimal policy computed.';
//       followBtn.style.display = 'inline-block';
//       hasRunValueIteration = true;
//     }, 2000);
//   });

    
    runValueIterationClientSide().then(() => followValuePolicy());
}

function followOptimalPath() {
  if (!hasRunValueIteration) {
    //alert('Please run value iteration first!');
    return;
  }
  
  const statusText = document.getElementById('status-text');
  statusText.textContent = 'Agent following optimal path to goal...';
  
  // Use your existing follow policy function
  followValuePolicy();
  
  // Update status after a delay
  setTimeout(() => {
    statusText.textContent = 'Path complete! 🎉 Ready to learn how it works?';
  }, 3000);
}

function resetIntroductionDemo() {
  hasRunValueIteration = false;
  const statusDiv = document.getElementById('intro-status');
  const followBtn = document.getElementById('follow-path-btn');
  
  if (statusDiv) statusDiv.style.display = 'none';
  if (followBtn) followBtn.style.display = 'none';
}