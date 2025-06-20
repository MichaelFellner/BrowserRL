from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import base64
import io

app = FastAPI()

# 🟢 Allow requests from any origin (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later to ["http://localhost:3000"] etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageUpload(BaseModel):
    image: str  # Base64 data URL string

@app.post("/upload_image")
async def upload_image(data: ImageUpload):
    header, encoded = data.image.split(",", 1)
    img_bytes = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    print("Image received:", image.size, image.mode)

    # Optional: Save to disk
    image.save("received_image.png")

    return { "status": "success", "width": image.width, "height": image.height }
