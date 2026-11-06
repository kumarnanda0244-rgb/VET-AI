# VETAI – AI Camera Livestock Disease Detection & Community Early Warning System
**Theme: Samriddh Annadata, Samriddh Bharat**

> **Core Philosophy:** AI camera systems for dairy and beef cattle use computer vision, machine learning, and thermal or RGB imaging to monitor health and welfare parameters automatically without physical collars or transponders.

VETAI is a modern, responsive, and functional full-stack web application designed to empower smallholder dairy farmers, rural livestock keepers, and community paravets. It features a non-invasive **AI Camera Vision System** (Live Camera Capture & Photo Upload), **RGB & Thermal Thermography Imaging**, automated **Body Condition Scoring (BCS)**, **Locomotion & Lameness Grading**, **Respiration Rate & Heat Stress Monitoring**, **Bovine Disease Classification** (Lumpy Skin Disease, FMD, Mastitis, BRD), and a **Village-Level Disease Early Warning System** that halts localized epidemics before they cause herd mortality.

---

## 1. Project Folder and File Structure

To keep the application beginner-friendly, portable, and clean, VETAI strictly adheres to a single directory with **ONLY seven essential files**:

```
VETAI/
├── index.html        # Modern responsive web application (Landing page, Dashboard, Camera Viewfinder, Modals)
├── style.css         # Agritech visual design, Camera HUD reticle, thermal badges, and responsive layouts
├── script.js         # Frontend controller, WebRTC camera stream, Chart.js, Speech Recognition, and API client
├── backend.py        # Python Flask REST API, SQLite database, OpenCV thermal vision, AI disease classifier
├── requirements.txt  # Python package dependencies
├── README.md         # Comprehensive documentation and verification steps
└── .env.example      # Example environment configuration for optional AI keys
```

> **Note:** The SQLite database (`vetai.db`) is automatically initialized and seeded with demo farmer records, animals, vaccinations, camera screenings, and village reports when `backend.py` starts for the first time.

---

## 2. Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+), WebRTC Camera Stream API (`getUserMedia`), Chart.js, Lucide & FontAwesome Icons.
- **Backend:** Python 3.10+, Flask 3.x, Flask-CORS.
- **Computer Vision & Thermography:** OpenCV (`opencv-python`) & Pillow (`PIL`) for Laplacian sharpness validation, pseudocolor thermal heat mapping (`COLORMAP_INFERNO`), contour and skin lesion analysis.
- **Database:** SQLite 3 (Built into Python).
- **Voice Recognition & Speech:** Web Speech API (`SpeechRecognition`) with native support for **Kannada (ಕನ್ನಡ)**, **Hindi (हिंदी)**, and **English**.

---

## 3. Required Software & Prerequisites

- **Python:** Python 3.10, 3.11, 3.12, or 3.13 installed.
- **Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari (Chrome/Edge recommended for camera and microphone access).

---

## 4. Installation & Setup Instructions

### Step 1: Open Terminal in the `VETAI` directory

On Windows PowerShell:
```powershell
cd c:\Drivers\VETAI
```

### Step 2: Install Python Dependencies

Run:
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment (Optional)

Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```

### Step 4: Start the Flask Backend Server

```bash
python backend.py
```

You should see output similar to:
```text
=====================================================================
  VETAI - AI Camera Cattle Disease Detection & Early Warning System
  Theme: Samriddh Annadata, Samriddh Bharat
  Running on: http://127.0.0.1:5000
  Database: c:\Drivers\VETAI\vetai.db
  OpenCV Image Quality & Thermal Vision: ACTIVE
=====================================================================
```

### Step 5: Open the Application in your Browser

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 5. Instant Demo Credentials

The database comes pre-seeded with a demonstration farmer and herd flock for testing all features immediately:

- **Email:** `ramesh@vetai.org`
- **Password:** `farmer123`
- **Location:** Shivapura Village, Dharwad District, Karnataka
- **Pre-Registered Animals:**
  1. **Gauri** (Gir Indigenous Cow, Tag: `IN-KA-DH-0101`)
  2. **Lakshmi** (Murrah Buffalo, Tag: `IN-KA-DH-0102`)
  3. **Nandi** (Jamnapari Goat, Tag: `IN-KA-DH-0103`)

You can also click the **"Instant Demo Login"** button in the login modal for one-click access.

---

## 6. How to Test the Main Features

### A. AI Camera Livestock Disease & Welfare Detection System (Collar-Free Monitoring)
1. Log in and navigate to **AI Camera Detection** from the sidebar or click **"Launch Live Camera Detection"** from the hero section.
2. Select target animal (e.g. `Gauri`).
3. Choose your input mode:
   - **Live Camera**: Click **"Start Live Camera"** to launch the real-time viewfinder stream, aim at cattle, and click **"Capture Snapshot"**.
   - **Upload Photo**: Click **"Upload Photo"** and select any cattle photo.
4. Select vision spectrum:
   - 🟢 **RGB Visual Spectrum**
   - 🔥 **Thermal Vision** (Emulated infrared thermography for detecting localized inflammation, fever, and udder heat).
5. Click **"Run AI Disease & Welfare Detection"**.
6. Inspect the automated HUD parameters:
   - **Overall Animal Welfare Index (0 - 100%)**
   - **Body Condition Scoring (BCS 1.0 - 5.0)** with optimal herd weight indicators.
   - **Locomotion & Lameness Score** (Posture & dorsal curvature analysis).
   - **Respiration Rate (breaths/min) & Heat Stress Index**.
   - **Estimated Surface Temperature (°C)** with infrared pseudocolor heatmap preview.
   - **Detected Bovine Diseases** (e.g. Lumpy Skin Disease nodular patterns, FMD indicators, Bovine Mastitis quarter heat, Respiratory Disease / BRD).
7. Click **"Book Veterinary Consultation for this Result"** to automatically prefill consultation notes for local dispensaries.

### B. Village-Level Disease Early Warning System (Main Innovation)
1. Navigate to **Village Early Warning** from the sidebar.
2. Observe the active **Shivapura Village High Alert Cluster** generated from real SQLite pattern clustering.
3. Click **"Simulate Village Outbreak (Demo)"**.
4. Select a village (e.g. `Shivapura`) and an outbreak pattern (e.g. *FMD-like* or *Respiratory*).
5. Click **"Inject Reports & Detect"**.
6. The system injects anonymized sample reports and triggers a live statistical pattern scan. Watch the alert banner update in real time with veterinary verification advisories!

### C. Clinical Symptom Assessment & Emergency Priority Triage
1. Navigate to **Symptom Assessment** from the sidebar.
2. Select an animal and check observable clinical symptoms (e.g., *Fever*, *Abnormal breathing*).
3. View the 4-tier emergency priority classification (**Green**, **Yellow**, **Orange**, **Red**). Notice how acute respiratory symptoms trigger automatic **RED** escalation.

### D. Vaccination & Preventative Reminders
1. Navigate to **Vaccine & Reminders**.
2. View scheduled immunizations (FMD, HS, BQ) and follow-up checks.
3. Mark completed or add new reminders for your herd.

### E. Multilingual Voice & Text LLM Assistant with Strict Domain Guardrails
1. Navigate to **Multilingual Assistant** from the sidebar or click the language bar.
2. **Farmer Language Choices:** Select between:
   - 🇬🇧 **English** *(Livestock AI)*
   - 🇮🇳 **हिंदी (Hindi)** *(पशु स्वास्थ्य)*
   - 🌾 **ಕನ್ನಡ (Kannada)** *(ಜಾನುವಾರು ಆರೋಗ್ಯ)*
3. **Strict Domain Guardrail Policy:**
   - The assistant is strictly trained to answer **ONLY** queries related to livestock healthcare (cattle, buffaloes, sheep, goats), bovine disease symptoms (LSD, FMD, Mastitis, Pneumonia, Bloat), non-invasive AI camera monitoring (BCS, thermal thermography), and veterinary first-aid.
   - Any out-of-domain questions (e.g. coding, cinema, politics, sports, general recipes) are **strictly declined** with polite guidance in the farmer's selected language redirecting them back to livestock health.
4. **Interactive Ways to Query:**
   - **Voice Microphone (Web Speech API):** Click the microphone button and speak in Kannada (`kn-IN`), Hindi (`hi-IN`), or English (`en-IN`).
   - **Dynamic Quick Prompts:** Click any of the language-adapted suggestion chips (e.g. *"ನನ್ನ ಹಸುವಿಗೆ 104 ಡಿಗ್ರಿ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಮೈಮೇಲೆ ಗಂಟುಗಳಿವೆ"*, *"मेरी गाय को तेज बुखार है और शरीर पर गोल गांठें दिख रही हैं"*).
   - **Text Input:** Type observations in natural script.
5. **Audio Read-Aloud (Text-to-Speech):**
   - Click the **🔊 Listen / ಆಲಿಸಿ / सुनें** button on any assistant message bubble to hear the response spoken aloud in the selected language.

---

## 7. Official Medical Disclaimer

> **Important:** VETAI provides preliminary decision-support information and is not a confirmed veterinary diagnosis. Consult a qualified, registered veterinarian for clinical examination, diagnosis, and prescription treatment.
