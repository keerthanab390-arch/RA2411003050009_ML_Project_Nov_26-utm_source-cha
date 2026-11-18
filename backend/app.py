from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import tensorflow as tf
import numpy as np
import os
import cv2
import mediapipe as mp
import joblib


# ==================================================
# PATHS
# ==================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

WEIGHTS_PATH = os.path.join(
    BASE_DIR,
    "optitry_cropped_efficientnet.weights.h5"
)

HYBRID_MODEL_PATH = os.path.join(
    BASE_DIR,
    "Hybrid_Model",
    "optitry_hybrid_face_shape.pkl"
)


# ==================================================
# CLASSES
# ==================================================

CLASSES = [
    "Heart",
    "Oblong",
    "Oval",
    "Round",
    "Square"
]


# ==================================================
# LOAD EFFICIENTNET FEATURE EXTRACTOR
# ==================================================

print("Building EfficientNet feature extractor...")

base_model = tf.keras.applications.EfficientNetB0(
    include_top=False,
    weights=None,
    input_shape=(224, 224, 3)
)

inputs = tf.keras.Input(
    shape=(224, 224, 3)
)

x = base_model(
    inputs,
    training=False
)

x = tf.keras.layers.GlobalAveragePooling2D()(x)

x = tf.keras.layers.Dropout(0.35)(x)

x = tf.keras.layers.Dense(
    256,
    activation="relu"
)(x)

x = tf.keras.layers.Dropout(0.25)(x)

outputs = tf.keras.layers.Dense(
    5,
    activation="softmax"
)(x)

image_model = tf.keras.Model(
    inputs=inputs,
    outputs=outputs
)


print("Loading cropped EfficientNet weights...")

image_model.load_weights(
    WEIGHTS_PATH
)

print("EfficientNet weights loaded successfully!")


# ==================================================
# 256-D FEATURE EXTRACTOR
# ==================================================

visual_model = tf.keras.Model(
    inputs=image_model.input,
    outputs=image_model.layers[-3].output
)

print("Visual feature extractor ready.")
print("Visual features: 256")


# ==================================================
# LOAD HYBRID MODEL
# ==================================================

print("Loading hybrid face-shape model...")

hybrid_model = joblib.load(
    HYBRID_MODEL_PATH
)

print("Hybrid model loaded successfully!")
print("Hybrid features: 345")


# ==================================================
# MEDIAPIPE FACE LANDMARKER
# ==================================================

print("Loading MediaPipe Face Landmarker...")

TASK_PATH = os.path.join(
    BASE_DIR,
    "face_landmarker.task"
)

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

landmarker_options = FaceLandmarkerOptions(
    base_options=BaseOptions(
        model_asset_path=TASK_PATH
    ),
    running_mode=VisionRunningMode.IMAGE,
    num_faces=1
)

face_landmarker = FaceLandmarker.create_from_options(
    landmarker_options
)

print("MediaPipe Face Landmarker loaded!")


# ==================================================
# FASTAPI
# ==================================================

app = FastAPI(
    title="OptiTry Face Shape API",
    version="3.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/")
def root():

    return {
        "status": "online",
        "service": "OptiTry Face Shape API",
        "model": "Hybrid Image + Geometry",
        "visual_features": 256,
        "geometry_features": 89,
        "total_features": 345,
        "classes": CLASSES
    }


# ==================================================
# GET FACE LANDMARKS
# ==================================================

def get_landmarks(image):

    rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb
    )

    result = face_landmarker.detect(
        mp_image
    )

    if not result.face_landmarks:

        return None

    return result.face_landmarks[0]


# ==================================================
# CROP FACE
# ==================================================

def crop_face(image, landmarks):

    height, width = image.shape[:2]

    xs = np.array([
        landmark.x * width
        for landmark in landmarks
    ])

    ys = np.array([
        landmark.y * height
        for landmark in landmarks
    ])

    face_width = xs.max() - xs.min()
    face_height = ys.max() - ys.min()

    x1 = int(
        max(
            0,
            xs.min() - 0.20 * face_width
        )
    )

    x2 = int(
        min(
            width,
            xs.max() + 0.20 * face_width
        )
    )

    y1 = int(
        max(
            0,
            ys.min() - 0.25 * face_height
        )
    )

    y2 = int(
        min(
            height,
            ys.max() + 0.25 * face_height
        )
    )

    face = image[
        y1:y2,
        x1:x2
    ]

    if face.size == 0:

        return None

    print(
        f"Face crop: "
        f"x={x1}, y={y1}, "
        f"width={x2-x1}, "
        f"height={y2-y1}"
    )

    return face


# ==================================================
# EXTRACT 256 VISUAL FEATURES
# ==================================================

def extract_visual_features(face):

    face_rgb = cv2.cvtColor(
        face,
        cv2.COLOR_BGR2RGB
    )

    face_resized = cv2.resize(
        face_rgb,
        (224, 224),
        interpolation=cv2.INTER_AREA
    )

    face_array = face_resized.astype(
        np.float32
    )

    face_batch = np.expand_dims(
        face_array,
        axis=0
    )

    features = visual_model.predict(
        face_batch,
        verbose=0
    )

    return features


# ==================================================
# EXTRACT 89 GEOMETRY FEATURES
# ==================================================

def extract_geometry_features(landmarks):

    contour_indices = [
        10, 338, 297, 332, 284, 251,
        389, 356, 454, 323, 361, 288,
        397, 365, 379, 378, 400, 377,
        152, 148, 176, 149, 150, 136,
        172, 58, 132, 93, 234, 127,
        162, 21, 54, 103, 67, 109
    ]

    left_eye_index = 468
    right_eye_index = 473

    points = np.array(
        [
            [
                landmarks[i].x,
                landmarks[i].y
            ]
            for i in contour_indices
        ],
        dtype=np.float32
    )

    left_eye = np.array(
        [
            landmarks[left_eye_index].x,
            landmarks[left_eye_index].y
        ],
        dtype=np.float32
    )

    right_eye = np.array(
        [
            landmarks[right_eye_index].x,
            landmarks[right_eye_index].y
        ],
        dtype=np.float32
    )

    # ----------------------------------------------
    # Center on eye midpoint
    # ----------------------------------------------

    eye_mid = (
        left_eye +
        right_eye
    ) / 2

    points = points - eye_mid

    # ----------------------------------------------
    # Rotate using eye axis
    # ----------------------------------------------

    dx = (
        right_eye[0] -
        left_eye[0]
    )

    dy = (
        right_eye[1] -
        left_eye[1]
    )

    angle = np.arctan2(
        dy,
        dx
    )

    rotation = np.array([
        [
            np.cos(-angle),
            -np.sin(-angle)
        ],
        [
            np.sin(-angle),
            np.cos(-angle)
        ]
    ], dtype=np.float32)

    points = points @ rotation.T

    # ----------------------------------------------
    # Normalize by eye distance
    # ----------------------------------------------

    eye_distance = np.linalg.norm(
        right_eye -
        left_eye
    )

    if eye_distance == 0:

        raise ValueError(
            "Invalid eye distance."
        )

    points = (
        points /
        eye_distance
    )

    # ----------------------------------------------
    # Width profile
    # ----------------------------------------------

    ys_points = points[:, 1]

    y_min = ys_points.min()
    y_max = ys_points.max()

    levels = np.linspace(
        y_min,
        y_max,
        7
    )

    width_profile = []

    for i in range(6):

        mask = (
            (ys_points >= levels[i]) &
            (ys_points <= levels[i + 1])
        )

        if np.any(mask):

            width = (
                points[mask, 0].max()
                -
                points[mask, 0].min()
            )

        else:

            width = 0.0

        width_profile.append(
            width
        )

    width_profile = np.array(
        width_profile,
        dtype=np.float32
    )

    # ----------------------------------------------
    # Scalar features
    # ----------------------------------------------

    x_values = points[:, 0]

    face_width = (
        x_values.max()
        -
        x_values.min()
    )

    face_height = (
        y_max -
        y_min
    )

    aspect_ratio = (
        face_height /
        (face_width + 1e-8)
    )

    upper_width = width_profile[0]
    middle_width = width_profile[2]
    lower_width = width_profile[4]
    bottom_width = width_profile[5]

    max_width = width_profile.max()
    min_width = width_profile.min()

    width_variation = (
        max_width -
        min_width
    )

    upper_lower = (
        upper_width /
        (lower_width + 1e-8)
    )

    middle_lower = (
        middle_width /
        (lower_width + 1e-8)
    )

    bottom_middle = (
        bottom_width /
        (middle_width + 1e-8)
    )

    scalar_features = np.array([
        aspect_ratio,
        upper_width,
        middle_width,
        lower_width,
        bottom_width,
        max_width,
        min_width,
        width_variation,
        upper_lower,
        middle_lower,
        bottom_middle
    ], dtype=np.float32)

    # ----------------------------------------------
    # 89 total features
    # ----------------------------------------------

    geometry_features = np.concatenate([
        scalar_features,
        width_profile,
        points.flatten()
    ])

    return geometry_features.reshape(
        1,
        -1
    )


# ==================================================
# PREDICTION ENDPOINT
# ==================================================

@app.post("/predict-image")
async def predict_image(
    file: UploadFile = File(...)
):

    # ----------------------------------------------
    # Read uploaded image
    # ----------------------------------------------

    image_bytes = await file.read()

    image_array = np.frombuffer(
        image_bytes,
        dtype=np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:

        return {
            "success": False,
            "error": "Could not decode image"
        }

    # ----------------------------------------------
    # Detect landmarks
    # ----------------------------------------------

    landmarks = get_landmarks(
        image
    )

    if landmarks is None:

        return {
            "success": False,
            "error": "No face detected"
        }

    # ----------------------------------------------
    # Crop face
    # ----------------------------------------------

    face = crop_face(
        image,
        landmarks
    )
    cv2.imwrite(
    os.path.join(BASE_DIR, "debug_face_crop.jpg"),
    face
)

    if face is None:

        return {
            "success": False,
            "error": "Invalid face crop"
        }

    # ----------------------------------------------
    # Visual features — 256
    # ----------------------------------------------

    visual_features = extract_visual_features(
        face
    )
    print(
    "Visual feature shape:",
    visual_features.shape,
    "Range:",
    float(visual_features.min()),
    float(visual_features.max())
)

    # ----------------------------------------------
    # Geometry features — 89
    # ----------------------------------------------

    geometry_features = extract_geometry_features(
        landmarks
    )
    print(
    "Geometry feature shape:",
    geometry_features.shape,
    "Range:",
    float(geometry_features.min()),
    float(geometry_features.max())
)

    # ----------------------------------------------
    # Combine — 345
    # ----------------------------------------------

    fusion_features = np.concatenate(
        [
            visual_features,
            geometry_features
        ],
        axis=1
    )

    print(
        "Fusion features:",
        fusion_features.shape
    )

    # ----------------------------------------------
        # ----------------------------------------------
    # Hybrid prediction
    # ----------------------------------------------
    # ----------------------------------------------
    # Hybrid prediction
    # ----------------------------------------------

    prediction = hybrid_model.predict(
        fusion_features
    )[0]

    probabilities = hybrid_model.predict_proba(
        fusion_features
    )[0]

    print("\nFace Shape Prediction Scores:")

    for index, score in enumerate(probabilities):
        shape = CLASSES[index]
        print(f"{shape}: {score * 100:.2f}%")

    # Handle numeric class index
    if isinstance(prediction, (int, np.integer)):
        predicted_index = int(prediction)
        predicted_shape = CLASSES[predicted_index]
    else:
        predicted_shape = str(prediction)

    print(f"Prediction: {predicted_shape}")

    # ----------------------------------------------
    # Return result
    # ----------------------------------------------

    return {
        "success": True,
        "face_shape": predicted_shape
    }
   