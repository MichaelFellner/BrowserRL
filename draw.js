const BACKEND_URL = "https://browserrl.onrender.com";

const canvas = new fabric.Canvas('c', {
  isDrawingMode: true,
  backgroundColor: 'black',
});

const W = 1000, H = 600;
const R = 50;
const BOX = 20;
const step = 20;

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

const redBox = new fabric.Rect({
  left: W - R - 10 - BOX / 2,
  top: R + 10 - BOX / 2,
  width: BOX,
  height: BOX,
  fill: 'red',
  selectable: false,
  evented: false,
});

canvas.add(bottomLeft, topRight, redBox);

const greenStartX = Math.round((R + 10) / BOX) * BOX;
const greenStartY = Math.round((H - R - 10) / BOX) * BOX;

const greenBox = new fabric.Rect({
  left: greenStartX - BOX / 2,
  top: greenStartY - BOX / 2,
  width: BOX,
  height: BOX,
  fill: 'green',
  selectable: false,
  evented: false,
});

canvas.add(greenBox);
canvas.renderAll();

canvas.on('path:created', () => {
  canvas.bringToFront(greenBox);
});

const brush = canvas.freeDrawingBrush;
brush.color = 'white';
brush.width = parseInt(document.getElementById("strokeWidth").value);
document.getElementById("strokeWidth").addEventListener("input", e => {
  brush.width = parseInt(e.target.value);
});

let iterationDisplay = document.getElementById("iterationCount");
let trajectory = [];

function getGoalCenter() {
  return {
    x: redBox.left + redBox.width / 2,
    y: redBox.top + redBox.height / 2
  };
}

async function isWhiteUnderBox(x, y) {
  greenBox.visible = false;
  canvas.requestRenderAll();

  const dataURL = canvas.toDataURL({ format: 'png' });
  const img = new Image();
  img.src = dataURL;
  await new Promise(r => img.onload = r);

  const tmp = document.createElement('canvas');
  tmp.width = BOX;
  tmp.height = BOX;
  const ctx = tmp.getContext('2d');
  ctx.drawImage(img, -x, -y);

  greenBox.visible = true;
  canvas.requestRenderAll();

  const data = ctx.getImageData(0, 0, BOX, BOX).data;
  const corners = [
    { cx: 0, cy: 0 },
    { cx: BOX - 1, cy: 0 },
    { cx: 0, cy: BOX - 1 },
    { cx: BOX - 1, cy: BOX - 1 }
  ];

  for (let { cx, cy } of corners) {
    const i = (cy * BOX + cx) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (!(r > 240 && g > 240 && b > 240 && a > 200)) return false;
  }
  return true;
}

async function manualMove(action) {
  const [dx, dy] = {
    0: [0, -BOX],
    1: [0, BOX],
    2: [-BOX, 0],
    3: [BOX, 0],
  }[action];

  const nx = greenBox.left + dx;
  const ny = greenBox.top + dy;

  if (
    nx >= 0 && nx + BOX <= W &&
    ny >= 0 && ny + BOX <= H &&
    await isWhiteUnderBox(nx, ny)
  ) {
    greenBox.set({ left: nx, top: ny });
    canvas.renderAll();

    const centerX = nx + BOX / 2;
    const centerY = ny + BOX / 2;
    const goal = getGoalCenter();
    const dist = Math.sqrt((centerX - goal.x) ** 2 + (centerY - goal.y) ** 2).toFixed(2);

    console.log(`📦 Green box moved to (${centerX}, ${centerY})`);
    console.log(`🎯 Distance to goal: ${dist} pixels`);

    trajectory.push({ x: centerX, y: centerY, action });
    console.log("📥 Recorded move:", { x: centerX, y: centerY, action });
  } else {
    console.warn("❌ Invalid move or hit black area.");
  }
}

async function sendTrajectoryToPython() {
  const dataURL = canvas.toDataURL("image/png");

  const response = await fetch(`${BACKEND_URL}/upload_trajectory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataURL, trajectory })
  });

  const result = await response.json();
  console.log("📤 Trajectory + Image sent:", result);
}

async function testPlan() {
  if (trajectory.length === 0) {
    alert("No trajectory recorded.");
    return;
  }

  const response = await fetch(`${BACKEND_URL}/test_plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trajectory })
  });

  const result = await response.json();
  console.log("🧪 Planned final position:", result);

  if (result.error) {
    alert("❌ " + result.error);
    return;
  }

  alert(`✅ Final position: (${result.final_x}, ${result.final_y})\n🎯 Distance to goal: ${result.distance_to_goal.toFixed(2)} pixels`);
}

let valuePolicy = {};

async function runValueIteration() {
  const dataURL = canvas.toDataURL("image/png");
  await fetch(`${BACKEND_URL}/upload_image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataURL })
  });

  const gammaInput = parseFloat(document.getElementById("gamma").value);
  const epsInput = parseFloat(document.getElementById("threshold").value);
  const gamma = isNaN(gammaInput) ? undefined : gammaInput;
  const threshold = isNaN(epsInput) ? undefined : epsInput;

  let url = new URL(`${BACKEND_URL}/run_value_iteration`);
  if (gamma !== undefined) url.searchParams.set("gamma", gamma);
  if (threshold !== undefined) url.searchParams.set("threshold", threshold);

  const viRes = await fetch(url);
  const viData = await viRes.json();

  if (!viData.policy) {
    alert("❌ Value iteration returned no policy.");
    return;
  }

  valuePolicy = viData.policy;
  iterationDisplay.innerText = "Iterations: " + viData.iterations;
  alert("Value Iteration done! Ready to follow policy.");
}

async function followValuePolicy() {
  if (!valuePolicy || Object.keys(valuePolicy).length === 0) {
    alert("Please run value iteration first.");
    return;
  }

  let steps = 0;
  while (steps < 1000) {
    const cx = Math.round((greenBox.left + BOX / 2) / BOX) * BOX;
    const cy = Math.round((greenBox.top + BOX / 2) / BOX) * BOX;
    const key = `${cx},${cy}`;
    const action = valuePolicy[key];

    if (action === undefined) break;

    const [dx, dy] = {
      0: [0, -BOX], 1: [0, BOX], 2: [-BOX, 0], 3: [BOX, 0]
    }[action];

    const nx = greenBox.left + dx;
    const ny = greenBox.top + dy;
    greenBox.set({ left: nx, top: ny });
    canvas.renderAll();

    const goal = getGoalCenter();
    const dist = Math.sqrt((nx + BOX / 2 - goal.x) ** 2 + (ny + BOX / 2 - goal.y) ** 2);
    if (dist < BOX + 1) break;

    await new Promise(r => setTimeout(r, 100));
    steps++;
  }
}

function resetGreenBox() {
  greenBox.set({
    left: greenStartX - BOX / 2,
    top: greenStartY - BOX / 2
  });
  canvas.renderAll();
}
