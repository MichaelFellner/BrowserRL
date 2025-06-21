from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from typing import List, Dict, Tuple
from PIL import Image
import base64, io, numpy as np
from heapq import heappop, heappush
import json
from value_iteration import ValueIteration

global_policy = {}


print("main.py loaded")

app = FastAPI()

# ─── CORS ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Constants ───────────────────────────────────────────────────────────
BOX_SIZE = 20
DIRECTIONS = {
    0: (0, -BOX_SIZE),   # up
    1: (0, BOX_SIZE),    # down
    2: (-BOX_SIZE, 0),   # left
    3: (BOX_SIZE, 0),    # right
}

# ─── Upload Image ────────────────────────────────────────────────────────
class ImageUpload(BaseModel):
    image: str

@app.post("/upload_image")
async def upload_image(data: ImageUpload):
    header, encoded = data.image.split(",", 1)
    img_bytes = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    image.save("received_image.png")
    print("🖼️ Image received:", image.size, image.mode)
    return {"status": "success", "width": image.width, "height": image.height}

# ─── Upload Single Position ──────────────────────────────────────────────
class Position(BaseModel):
    x: int
    y: int

@app.post("/upload_position")
async def upload_position(pos: Position):
    print(f"📍 Received position: ({pos.x}, {pos.y})")
    return {"status": "ok", "x": pos.x, "y": pos.y}

# ─── Upload Trajectory with Image ────────────────────────────────────────
class Step(BaseModel):
    x: int
    y: int
    action: int

class TrajectoryWithImage(BaseModel):
    image: str
    trajectory: List[Step]

@app.post("/upload_trajectory")
async def upload_trajectory(payload: TrajectoryWithImage):
    # Save image
    header, encoded = payload.image.split(",", 1)
    img_bytes = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    image.save("received_image.png")
    print("🖼️ Image + trajectory received. Saved.")

    # Save trajectory
    with open("trajectory.json", "w") as f:
        json.dump([step.dict() for step in payload.trajectory], f, indent=2)

    print("📦 Trajectory received:")
    for step in payload.trajectory:
        print(f"  → Action {step.action} → Pos ({step.x}, {step.y})")

    return {"status": "ok", "steps": len(payload.trajectory)}

# ─── Parse Image to State ────────────────────────────────────────────────
def parse_image_to_state(path="received_image.png") -> Dict:
    img = Image.open(path).convert("RGB")
    np_img = np.array(img)

    green_mask = (np_img[:, :, 0] == 0) & (np_img[:, :, 1] == 128) & (np_img[:, :, 2] == 0)
    green_pos = np.argwhere(green_mask)
    green_center = green_pos.mean(axis=0)[::-1]  # (x, y)

    red_mask = (np_img[:, :, 0] == 255) & (np_img[:, :, 1] == 0) & (np_img[:, :, 2] == 0)
    red_pos = np.argwhere(red_mask)
    red_center = red_pos.mean(axis=0)[::-1]

    white_mask = (np_img[:, :, 0] > 240) & (np_img[:, :, 1] > 240) & (np_img[:, :, 2] > 240)

    def snap(v):
        return int(round(v / BOX_SIZE) * BOX_SIZE)

    return {
        "agent_pos": tuple(map(snap, green_center)),
        "goal_pos": tuple(map(snap, red_center)),
        "walkable": white_mask
    }

def is_valid(pos: Tuple[int, int], walkable: np.ndarray) -> bool:
    x, y = pos
    h, w = walkable.shape
    return 0 <= x < w and 0 <= y < h and walkable[y, x]

def greedy_path(state: Dict) -> List[int]:
    start = state["agent_pos"]
    goal = state["goal_pos"]
    walkable = state["walkable"]
    visited = set()
    heap = [(0, start, [])]

    while heap:
        cost, pos, path = heappop(heap)
        if pos in visited:
            continue
        visited.add(pos)

        if np.linalg.norm(np.array(pos) - np.array(goal)) < BOX_SIZE:
            return path

        for action, (dx, dy) in DIRECTIONS.items():
            next_pos = (pos[0] + dx, pos[1] + dy)
            if is_valid(next_pos, walkable):
                heappush(heap, (
                    np.linalg.norm(np.array(next_pos) - np.array(goal)),
                    next_pos,
                    path + [action]
                ))

    return []

@app.get("/plan_path")
async def plan_path():
    print("🧭 Planning path...")
    state = parse_image_to_state()
    path = greedy_path(state)

    response = {
        "actions": path,
        "start": state["agent_pos"],
        "goal": state["goal_pos"]
    }

    print(f"🛣️ Planned path: {path}")
    return JSONResponse(content=response)

# ─── Test Plan from JS Replay ────────────────────────────────────────────
@app.post("/test_plan")
async def test_plan(payload: Dict):
    trajectory = payload.get("trajectory", [])
    if not trajectory:
        return {"error": "Empty trajectory"}

    x, y = trajectory[0]["x"], trajectory[0]["y"]

    for step in trajectory[1:]:
        action = step["action"]
        dx, dy = DIRECTIONS.get(action, (0, 0))
        x += dx
        y += dy

    state = parse_image_to_state()
    goal = state["goal_pos"]
    dist = np.linalg.norm(np.array((x, y)) - np.array(goal))

    print(f"🧪 Replayed trajectory. Final position: ({x}, {y}), Distance to goal: {dist:.2f}")
    return {
        "final_x": x,
        "final_y": y,
        "distance_to_goal": float(dist)
    }

@app.get("/run_value_iteration")
async def run_value_iteration():
    state = parse_image_to_state()
    goal = state["goal_pos"]
    walkable = state["walkable"]

    vi = ValueIteration(walkable, goal)
    vi.iterate()
    vi.policy[(60, 540)] = 3


    policy = vi.get_policy()


    print("✅ Policy keys available:")
    for k in policy.keys():
        print(k)

    return { "policy": policy }

