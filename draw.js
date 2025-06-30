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

const W = 1000, H = 600;
const R = 50;
const BOX = 20;


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
const greenStartX = Math.round((R + 10) / BOX) * BOX;   // 60 (center x of start)
const greenStartY = Math.round((H - R - 10) / BOX) * BOX; // 540 (center y of start)
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
brush.width = parseInt(document.getElementById("strokeWidth").value);
document.getElementById("strokeWidth").addEventListener("input", e => {
  brush.width = parseInt(e.target.value);
});

let iterationDisplay = document.getElementById("iterationCount");

/**
 * 
 * 
 * Part 2, Util Functions
 * 
 * 
 */


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
  // Temporarily hide the green box AND red box to inspect underlying pixels
  greenBox.visible = false;
  redBox.visible = false;
  canvas.requestRenderAll();

  // Render canvas to an image and extract the region under the box
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

  // Restore green and red box visibility
  greenBox.visible = true;
  redBox.visible = true;
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
    // Consider a pixel "white" if it’s very close to white (to allow for any aliasing)
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
    if (dist < BOX + 1) {
      console.log("🏁 Goal reached (manual)!");
    }
  } else {
    console.warn("❌ Invalid move or hit a black area.");
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
      // A pixel is walkable if it’s white (RGB all >240)
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
  

/** Perform value iteration on the given state (walkable grid) to compute optimal policy */
function runValueIterationOnState(state, gamma = 0.99, threshold = 1e-8) {
  const { walkableMask, goal_pos } = state;
  const boxSize = 20;
  const goalKey = `${goal_pos[0]},${goal_pos[1]}`;
  const values = new Map();
  const policyMap = new Map();
  let iterationCount = 0;
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
  const stepCost = 1;  // small penalty per move to discourage oscillation:contentReference[oaicite:3]{index=3}
  while (true) {
    iterationCount++;
    let delta = 0;
    const newValues = new Map();
    // Evaluate each state
    for (const [x, y] of validStates) {
      const stateKey = `${x},${y}`;
      // If this state is the goal, treat it as terminal (no action needed)
      if (stateKey === goalKey) {
        // Terminal state's value stays at 0 (no future reward beyond reaching goal)
        newValues.set(stateKey, 0);
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
        let reward = 0;//currDist - nextDist;
        // Apply a small step penalty for any move
        //reward -= stepCost;
        // Calculate value for this action
        let val;
        if (nextDist < boxSize) {
          // If this move reaches (or comes within one cell of) the goal, treat as terminal
          val = 10000;  // no future value since goal would be reached
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
    // Check for convergence
    if (delta < threshold) break;
  }
  return {
    policy: Object.fromEntries(policyMap),
    iterations: iterationCount
  };
}

/** Run value iteration on the current canvas state (computes the optimal policy) */
async function runValueIterationClientSide() {
  const gammaInput = parseFloat(document.getElementById("gamma").value);
  const epsInput = parseFloat(document.getElementById("threshold").value);
  const gamma = isNaN(gammaInput) ? 0.99 : gammaInput;
  const threshold = isNaN(epsInput) ? 1e-4 : epsInput;

  // Parse the canvas into a state representation
  const state = await parseCanvasToState();
  // Perform value iteration on the state
  const result = runValueIterationOnState(state, gamma, threshold);
  valuePolicy = result.policy;
  iterationDisplay.innerText = "Iterations: " + result.iterations;
  alert("✅ Value iteration done!");
  console.log("📌 Policy Keys:", Object.keys(valuePolicy));
  await checkPolicyPathLength();

}

function deltaToColor(value, max) {
  if (max === 0) return 'rgb(0,0,0)';
  const ratio = Math.min(Math.max(value / max, 0), 1.0);
  const r = Math.floor(255 * (1 - ratio));
  const g = Math.floor(255 * ratio);
  return `rgb(${r},${g},0)`; // red to green
}

if (typeof yellowMap === 'undefined') yellowMap = new Map();
if (typeof liveValueIterationState === 'undefined') liveValueIterationState = null;
if (typeof deltaTextMap === 'undefined') deltaTextMap = new Map();
if (typeof liveMaxValueSeen === 'undefined') liveMaxValueSeen = 1;

async function runLiveValueIteration() {
  if (window._isLiveRunning) {
    console.warn("⚠️ Already running. Ignoring duplicate call.");
    return;
  }
  window._isLiveRunning = true;
  console.log("🔁 runLiveValueIteration triggered");

  const gammaInput = parseFloat(document.getElementById("gamma").value);
  const gamma = isNaN(gammaInput) ? 0.99 : gammaInput;
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

  if (!liveValues) {
    liveValues = new Map();
    livePolicyMap = new Map();
    liveArrowMap = new Map();
    liveIterationCount = 0;
  }

  // Initialize low default values for all valid states (except goal)
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
          liveValues.set(stateKey, 0);
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
          let reward = 0;

          const val = nextDist < boxSize
            ? 10000
            : reward + gamma * (liveValues.get(neighborKey) || -1000);

          if (val > maxVal) {
            maxVal = val;
            bestAction = parseInt(action);
          }
        }

        const prevVal = liveValues.get(stateKey) || -1000;
        const deltaLocal = Math.abs(prevVal - maxVal);
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

        // Removed delta value debug label display

        canvas.bringToFront(greenBox);
        canvas.requestRenderAll();
      }

      liveIterationCount++;
      valuePolicy = Object.fromEntries(livePolicyMap);
      iterationDisplay.innerText = "Iterations: " + liveIterationCount;
      document.getElementById("deltaDisplay").innerText = `Δ: ${delta.toFixed(6)}`;
      checkPolicyPathLength();
    }
  } finally {
    resetGreenBox();
    window._isLiveRunning = false;
  }
}



async function prepareLiveValueIteration() {
  const state = await parseCanvasToState();
  await runLiveValueIteration(state);
}


function resetEverything() {
  // Clear canvas
  canvas.clear();
  canvas.backgroundColor = 'black';

  // Reset globals
  valuePolicy = {};
  liveValues = null;
  livePolicyMap = null;
  liveArrowMap = null;
  liveIterationCount = 0;
  iterationDisplay.innerText = "Iterations: -";
  document.getElementById("deltaDisplay").innerText = "Δ: -";

  // Recreate white circles (start and goal areas)
  const bottomLeft = new fabric.Circle({
    left: R + 10 - R,
    top: H - R - 10 - R,
    radius: R,
    fill: 'white',
    selectable: false,
    evented: false,
  });

  const topRight = new fabric.Circle({
    left: W - R - 10 - R,
    top: R + 10 - R,
    radius: R,
    fill: 'white',
    selectable: false,
    evented: false,
  });

  // Recreate red goal box
  redBox.set({
    left: W - R - 10 - BOX / 2,
    top: R + 10 - BOX / 2,
  });

  // Recreate green agent box
  greenBox.set({
    left: greenStartX - BOX / 2,
    top: greenStartY - BOX / 2,
  });

  // Re-add to canvas
  canvas.add(bottomLeft, topRight, redBox, greenBox);
  canvas.renderAll();
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

  // draw.js


  
let trainingInputs = [];
let trainingLabels = [];

let legalPositions = []; // add this near top
function getAlignedLegalPositions() {
  return legalPositions.map(([x, y]) => [
    Math.round(x / BOX) * BOX,
    Math.round(y / BOX) * BOX
  ]);
}


async function generateTrainingDataFromPolicy() {
  const state = await parseCanvasToState();
  const { walkableMask } = state;
  const result = runValueIterationOnState(state, 0.99, 1e-9);
  valuePolicy = result.policy;

  trainingInputs = [];
  trainingLabels = [];
  legalPositions = [];  // <-- add this

  for (const key in valuePolicy) {
    const [x, y] = key.split(",").map(Number);
    const normX = x / canvas.width;
    const normY = y / canvas.height;
    const action = valuePolicy[key];

    const oneHot = [0, 0, 0, 0];
    oneHot[action] = 1;

    trainingInputs.push([normX, normY]);
    trainingLabels.push(oneHot);
    legalPositions.push([x, y]);  // <-- add this
  }

  console.log("📊 Training data size:", trainingInputs.length);
}


  function isCellWalkable(cx, cy, mask) {
    if (cx - 10 < 0 || cy - 10 < 0 || cy + 9 >= mask.length || cx + 9 >= mask[0].length) return false;
    return (
      mask[cy - 10][cx - 10] &&
      mask[cy - 10][cx + 9] &&
      mask[cy + 9][cx - 10] &&
      mask[cy + 9][cx + 9]
    );
  }

  const nnArrowMap = new Map();
  function drawNNArrowAtState(x, y, action) {
    const key = `${x},${y}`;
    if (nnArrowMap.has(key)) {
      canvas.remove(nnArrowMap.get(key));
    }
  
    const arrow = new fabric.Text("→", {
      left: x + 2,
      top: y - 8,
      fontSize: 16,
      fill: "purple",
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      angle: [-90, 90, 180, 0][action],  // ✅ Corrected mapping
    });
  
    canvas.add(arrow);
    canvas.bringToFront(arrow);
    nnArrowMap.set(key, arrow);
  }
  
  function createAndStoreModel() {
    const lrInput = parseFloat(document.getElementById("learningRateInput").value);
    const learningRate = isNaN(lrInput) || lrInput <= 0 ? 0.01 : lrInput;
  
    tfModel = tf.sequential();
  
    // First dense + activation
    tfModel.add(tf.layers.dense({
      inputShape: [2],
      units: 64,
      kernelInitializer: 'heNormal'
    }));
    tfModel.add(tf.layers.leakyReLU());
  
    // Second dense + activation
    tfModel.add(tf.layers.dense({
      units: 32,
      kernelInitializer: 'heNormal'
    }));
    tfModel.add(tf.layers.leakyReLU());
  
    // Third dense + activation
    tfModel.add(tf.layers.dense({
      units: 16,
      kernelInitializer: 'heNormal'
    }));
    tfModel.add(tf.layers.leakyReLU());
  
    // Output layer (softmax)
    tfModel.add(tf.layers.dense({
      units: 4,
      activation: 'softmax',
      kernelInitializer: 'glorotUniform'
    }));
  
    const optimizer = tf.train.adam(learningRate);
  
    tfModel.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  
    console.log(`✅ Model created with learning rate: ${learningRate}`);
  }
  
  
  function drawNNPolicyArrows(outputTensor, positions) {
    outputTensor.array().then(predictions => {
      positions.forEach(([x, y], i) => {
        const action = predictions[i].indexOf(Math.max(...predictions[i]));
        drawNNArrowAtState(x, y, action);
      });
    });
  }
  

  async function checkNNPolicyPathLength(nnModel, alignedLegalPositions) {
    const resultElement = document.getElementById("pathCheckResult");
  
    const state = await parseCanvasToState();
    const { agent_pos, goal_pos, walkableMask } = state;
    const goalX = goal_pos[0], goalY = goal_pos[1];
    let [x, y] = agent_pos;
  
    const getKey = (x, y) => `${x},${y}`;
    const directions = {
      0: [0, -BOX], 1: [0, BOX], 2: [-BOX, 0], 3: [BOX, 0]
    };
  
    const inputs = tf.tensor2d(alignedLegalPositions.map(([x, y]) => [
      x / canvas.width,
      y / canvas.height
    ]));
    const predictions = await nnModel.predict(inputs).array();
    inputs.dispose();
  
    const nnPolicy = new Map();
    for (let i = 0; i < alignedLegalPositions.length; i++) {
      const [x, y] = alignedLegalPositions[i];
      const action = predictions[i].indexOf(Math.max(...predictions[i]));
      nnPolicy.set(getKey(x, y), action);
    }
  
    const visited = new Set();
    for (let step = 0; step < 500; step++) {
      const key = getKey(x, y);
      if (
        (Math.abs(x - goalX) === BOX && y === goalY) ||
        (Math.abs(y - goalY) === BOX && x === goalX)
      ) {
        resultElement.innerText = `✅ NN path found! Length: ${step}`;
        alert(`🎉 NN reached the goal in ${step} steps! Training stopped.`);
        return true;
      }
  
      if (visited.has(key)) {
        resultElement.innerText = "❌ NN policy loops or is invalid (cycle)";
        return false;
      }
  
      visited.add(key);
      const action = nnPolicy.get(key);
      if (action === undefined) {
        resultElement.innerText = "❌ NN policy missing action at: " + key;
        return false;
      }
  
      const [dx, dy] = directions[action];
      const nextX = x + dx, nextY = y + dy;
  
      if (!isCellWalkable(nextX, nextY, walkableMask)) {
        resultElement.innerText = `❌ NN step to (${nextX},${nextY}) is not walkable`;
        return false;
      }
  
      x = nextX;
      y = nextY;
    }
  
    resultElement.innerText = "❌ NN policy failed within step limit";
    return false;
  }
  
  async function trainNEpochs() {
    if (!tfModel) {
      alert("⚠️ Create the model first.");
      return;
    }
  
    const n = parseInt(document.getElementById("epochsInput").value);
    const lr = parseFloat(document.getElementById("learningRateInput").value);
    if (isNaN(n) || isNaN(lr)) {
      alert("Please enter valid values for epochs and learning rate.");
      return;
    }
  
    const BATCH_SIZE = 1;
  
    for (let epoch = 0; epoch < n; epoch++) {
      // Shuffle data
      const shuffled = tf.util.createShuffledIndices(legalPositions.length);
  
      for (let i = 0; i < legalPositions.length; i += BATCH_SIZE) {
        const batchIndices = shuffled.slice(i, i + BATCH_SIZE);
        
        const batchInputsArray = [];
        const batchLabelsArray = [];
        
        for (const idx of batchIndices) {
          const [x, y] = legalPositions[idx];
          const key = `${x},${y}`;
          const action = valuePolicy[key];
        
          if (action !== undefined && !isNaN(x) && !isNaN(y)) {
            const input = [x / canvas.width, y / canvas.height];
            const label = [0, 0, 0, 0];
            label[action] = 1;
        
            batchInputsArray.push(input);
            batchLabelsArray.push(label);
          }
        }
        
        if (batchInputsArray.length === 0) continue; // skip empty batches
        
        const batchInputs = tf.tensor2d(batchInputsArray);
        const batchLabels = tf.tensor2d(batchLabelsArray);
        
        // Train on this batch
        const history = await tfModel.trainOnBatch(batchInputs, batchLabels);
  
        batchInputs.dispose();
        batchLabels.dispose();
      }
  
      // Log loss after full epoch
      const preds = tfModel.predict(tf.tensor2d(legalPositions.map(([x, y]) => [
        x / canvas.width,
        y / canvas.height
      ])));
      drawNNPolicyArrows(preds, legalPositions);
  
      const loss = await tfModel.evaluate(
        tf.tensor2d(legalPositions.map(([x, y]) => [x / canvas.width, y / canvas.height])),
        tf.tensor2d(legalPositions.map(([x, y]) => {
          const key = `${x},${y}`;
          const action = valuePolicy[key];
          const oneHot = [0, 0, 0, 0];
          if (action !== undefined) oneHot[action] = 1;
          return oneHot;
        }))
      );
      console.log(`🧠 Epoch ${epoch + 1}/${n} — Loss: ${loss[0].dataSync()[0].toFixed(6)}`);
  
      // Every 10 epochs, check for successful path
      if ((epoch + 1) % 10 === 0) {
        const foundPath = await checkNNPolicyPathLength(tfModel, legalPositions);
        if (foundPath) {
          break;
        }
      }
  
      await tf.nextFrame(); // Allow UI updates
    }
  }
  
  
  

  async function followNNPolicy() {
    if (!tfModel) {
      alert("⚠️ Neural network model not initialized.");
      return;
    }
  
    stopFollowingPolicy = false;
    console.log("🤖 Following neural network policy...");
  
    const directions = {
      0: [0, -BOX],  // up
      1: [0, BOX],   // down
      2: [-BOX, 0],  // left
      3: [BOX, 0],   // right
    };
  
    for (let steps = 0; steps < 1000; steps++) {
      if (stopFollowingPolicy) {
        console.log("🛑 NN policy execution manually stopped.");
        break;
      }
  
      const cx = Math.floor((greenBox.left + BOX / 2) / BOX) * BOX;
      const cy = Math.floor((greenBox.top + BOX / 2) / BOX) * BOX;
  
      const normX = cx / canvas.width;
      const normY = cy / canvas.height;
  
      const prediction = await tfModel.predict(tf.tensor2d([[normX, normY]])).array();
      const action = prediction[0].indexOf(Math.max(...prediction[0]));
  
      const [dx, dy] = directions[action];
      const nx = greenBox.left + dx;
      const ny = greenBox.top + dy;
  
      // Check bounds
      if (nx < 0 || nx + BOX > canvas.width || ny < 0 || ny + BOX > canvas.height) {
        console.warn("🚧 Out-of-bounds move detected. Stopping.");
        break;
      }
  
      // Check if destination is walkable (white)
      const walkable = await isWhiteUnderBox(nx, ny);
      if (!walkable) {
        console.warn(`🚫 NN suggested illegal move to (${nx}, ${ny}) — black area.`);
        break;
      }
  
      // Move the green box
      greenBox.set({ left: nx, top: ny });
      canvas.renderAll();
  
      // Check goal proximity
      const goal = getGoalCenter();
      const dist = Math.sqrt((nx + BOX / 2 - goal.x) ** 2 + (ny + BOX / 2 - goal.y) ** 2);
      console.log(`📏 Distance to goal: ${dist.toFixed(2)}`);
  
      if (dist < BOX + 1) {
        console.log("🏁 Goal reached using NN policy!");
        break;
      }
  
      await new Promise(r => setTimeout(r, 100));
    }
  
    console.log("🧠 Finished following NN policy.");
  }
  

 