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
  
  function getGoalCenter() {
    return {
      x: redBox.left + redBox.width / 2,
      y: redBox.top + redBox.height / 2
    };
  }
  
  canvas.add(bottomLeft, topRight, redBox);
  
  const greenBox = new fabric.Rect({
    left: R + 10 - BOX / 2,
    top: H - R - 10 - BOX / 2,
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
  
  let trajectory = [];
  
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
      nx >= 0 && nx + BOX < W &&
      ny >= 0 && ny + BOX < H &&
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
    } else {
      console.warn("❌ Invalid move or hit black area.");
    }
  }
  
  async function sendCanvasToPython() {
    const dataURL = canvas.toDataURL("image/png");
  
    const response = await fetch("http://localhost:8000/upload_image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image: dataURL })
    });
  
    const result = await response.json();
    console.log("🖼️ Response from Python:", result);
  }
  
  async function sendTrajectory() {
    if (trajectory.length === 0) {
      alert("No moves made.");
      return;
    }
  
    const response = await fetch("http://localhost:8000/upload_trajectory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trajectory })
    });
  
    const result = await response.json();
    console.log("📤 Trajectory sent:", result);
  }
  
  async function runPlanningCheck() {
    if (trajectory.length === 0) {
      alert("No trajectory recorded.");
      return;
    }
  
    const start = trajectory[0];
    const actions = trajectory.map(step => step.action);
  
    const res = await fetch("http://localhost:8000/run_planning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_x: start.x,
        start_y: start.y,
        actions: actions
      })
    });
  
    const data = await res.json();
    console.log("🔁 Planning replay result:", data);
    alert(`Final position: (${data.end})\nDistance to goal: ${Math.round(data.distance_to_goal)}`);
  }
  
  async function testPlan() {
    const res = await fetch("http://localhost:8000/plan_path");
    const data = await res.json();
  
    const actions = data.actions;
    const [startX, startY] = data.start;
    const [goalX, goalY] = data.goal;
  
    let x = startX;
    let y = startY;
  
    for (const action of actions) {
      const [dx, dy] = {
        0: [0, -BOX], // up
        1: [0, BOX],  // down
        2: [-BOX, 0], // left
        3: [BOX, 0],  // right
      }[action];
  
      x += dx;
      y += dy;
    }
  
    const dist = Math.sqrt((x - goalX) ** 2 + (y - goalY) ** 2);
    alert(`✅ Final position: (${x}, ${y})\n🎯 Distance to goal: ${dist.toFixed(2)} pixels`);
  }
  