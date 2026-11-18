# 👓 OptiTry – AI-Powered Virtual Spectacles Try-On System

### Smart Eyewear Selection Using Computer Vision and Machine Learning

OptiTry is an AI-powered virtual spectacles try-on system designed to simplify eyewear selection. It uses computer vision, facial landmark detection, and machine learning to help users preview different spectacles in real time through a webcam or iPad.

The system analyzes facial features and face shape to support suitable spectacle selection, providing an interactive and user-friendly experience. It can be deployed in eyewear retail stores, shopping malls, and self-service kiosks.

---

## 📌 Project Overview

Choosing the right spectacles can be challenging because customers often need to try multiple frames physically before finding a suitable one.

OptiTry addresses this problem through a virtual try-on platform that allows users to:
- View spectacles directly on their face in real time.
- Explore different frame styles.
- Analyze facial features and identify face shapes.
- Get assistance in selecting suitable spectacles.
- Experience virtual eyewear selection using a webcam or iPad.

---

## 🎯 Objectives

- Develop a real-time virtual spectacles try-on system.
- Implement facial landmark detection using MediaPipe.
- Identify facial characteristics using machine learning.
- Recommend suitable spectacle frames based on face shape.
- Provide an interactive interface for easy frame selection.
- Support kiosk-based and tablet-based deployment.

---

## ✨ Key Features

- **Real-Time Virtual Try-On:** Displays spectacles on the user's face using a live camera feed.
- **Face Shape Detection:** Uses machine learning to classify facial shapes.
- **Facial Landmark Detection:** Identifies important facial points for accurate frame positioning.
- **Smart Frame Selection:** Helps users explore spectacles suitable for their face shape.
- **Interactive Interface:** Provides a simple and user-friendly experience.
- **Cross-Device Access:** Supports webcam-based usage and iPad access.
- **Kiosk Integration:** Designed for self-service eyewear selection in retail environments.

---

## 🛠️ Technologies Used

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| Computer Vision | OpenCV |
| Facial Landmark Detection | MediaPipe |
| Machine Learning | Scikit-learn |
| Deep Learning | TensorFlow / Keras |
| Face Shape Classification | Random Forest |
| Deep Learning Model | EfficientNet |
| API Communication | REST API |
| Database | Project-configured database |
| Development Environment | Visual Studio Code |
| Version Control | Git and GitHub |
| Large Model Storage | Git LFS |
| Network Access | ngrok |

---

## 🧠 Machine Learning Approach

OptiTry combines computer vision and machine learning techniques to support intelligent eyewear selection.

### 1. Facial Landmark Detection
MediaPipe Face Landmarker detects facial landmarks from the live camera feed. These landmarks help identify important facial regions and position spectacle frames accurately.

### 2. Face Shape Classification
Machine learning models analyze facial measurements and characteristics to classify face shapes.

The project includes:
- Random Forest classification.
- Hybrid face shape classification model.
- EfficientNet-based deep learning model.

### 3. Virtual Spectacles Try-On
The detected facial landmarks are used to position and scale spectacle frames on the user's face, providing a real-time virtual preview.

---

## 🏗️ System Architecture

The system follows a client-server architecture.

1. The user accesses the application through a laptop, webcam, or iPad.
2. The frontend captures camera input and user interactions.
3. The backend processes facial information.
4. MediaPipe identifies facial landmarks.
5. Machine learning models assist with face shape classification.
6. The virtual try-on module aligns spectacles with the detected facial position.
7. The processed output is displayed to the user.

---

## 📱 Device Integration

OptiTry supports access from different devices.

**Laptop:** Runs the backend server and provides the webcam interface.

**iPad:** Accesses the application through a browser.

**ngrok:** Creates a secure public URL that allows the iPad to access the locally running application on the laptop.

---

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10 or compatible project-supported version
- Node.js and npm (if required by the frontend)
- Git
- Git LFS
- Webcam or camera-enabled device

### Step 1: Clone the Repository

```bash
git clone https://github.com/keerthanab390-arch/Optitry.git
```

### Step 2: Navigate to the Project

```bash
cd OptiTry
```

### Step 3: Download Large Model Files

Install and initialize Git LFS:

```bash
git lfs install
git lfs pull
```

### Step 4: Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### Step 5: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 6: Run the Application

Follow the backend and frontend startup instructions provided in their respective project folders.

---

## 📂 Project Structure

```text
OptiTry/
│
├── backend/
│   ├── Hybrid_Model/
│   ├── face_landmarker.task
│   ├── face_shape_classes.pkl
│   ├── optitry_efficientnet.keras
│   ├── optitry_efficientnet.weights.h5
│   └── ...
│
├── frontend/
│   ├── HTML files
│   ├── CSS files
│   └── JavaScript files
│
├── .gitattributes
├── .gitignore
├── README.md
└── requirements.txt
```

*Note: The directory structure may vary depending on the current project implementation.*

---

## 🌐 iPad Access Using ngrok

The application can be accessed from an iPad while the backend runs on a laptop.

1. Start the application on the laptop.
2. Run ngrok with the appropriate local port.
3. Copy the generated public URL.
4. Open the URL in the iPad browser.
5. Allow camera permissions.
6. Start the virtual spectacles try-on experience.

---

## 🎯 Applications

- Eyewear retail stores
- Optical shopping centres
- Shopping malls
- Self-service kiosks
- Online eyewear platforms
- Interactive eyewear selection systems

---

## 🚀 Future Enhancements

- Integration of additional spectacle frame collections.
- Improved face shape classification accuracy.
- Personalized eyewear recommendations.
- User profile and preference management.
- Enhanced 3D virtual try-on experience.
- Integration with e-commerce platforms.
- Deployment as a standalone kiosk application.

---

## 👩‍💻 Project Contributors

**Keerthana B**  
**Darshana Ganesh**

**Project Guide:**  
Dr. Kanaga Suba Raja. S

---

## 📄 License

This project is available under the license included in the repository.

---

### OptiTry – Making Spectacle Selection Smarter, Simpler, and More Interactive. 👓
