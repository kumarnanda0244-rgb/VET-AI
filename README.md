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

## 5. Instant Demo Credentials & Role Access

### A. Farmer Access (Contact Number & Name Only)
Farmers in rural areas have zero friction — **no password and no email required**:
- **Farmer Name:** `Ramesh Patel` (or any custom farmer name)
- **Contact Mobile Number:** `9876543210` (any 10-digit mobile)
- Click **"1-Click Demo Farmer"** inside the portal access modal for instant dashboard entry.

### B. Doctor Clinical Portal (Senior Veterinary Surgeon)
Veterinarians have a dedicated clinical console for emergency triage and medical records:
- **Doctor ID / Email:** `dr.anand@vetai.org`
- **Password:** `vet123`
- **Doctor Name:** `Dr. Anand Kulkarni (Senior Veterinary Officer, Dharwad)`
- Click **"1-Click Doctor Login"** inside the portal access modal to launch the Doctor Clinical Console.

---

## 6. How to Test the Main Features

### A. Full Website Kannada Conversation & Dynamic Translation
1. In the top navigation bar, toggle the language dropdown to **ಕನ್ನಡ (Kannada)**.
2. The entire website dynamically translates into conversational Kannada:
   - Landing page hero, badges, trust metrics, and action buttons
   - AI Camera detection section, dropzones, and status indicators
   - All 10 observable symptoms in both landing and dashboard forms (*ಜ್ವರ, ಹಸಿವಿನ ಕೊರತೆ, ಆಯಾಸ, ಹಾಲು ಕಡಿಮೆಯಾಗುವುದು, ಭೇದಿ, ಕೆಮ್ಮು, ಉಸಿರಾಟದ ತೊಂದರೆ, ಕುಂಟು, ಚರ್ಮದ ಗಂಟುಗಳು*)
   - Multilingual livestock clinical assistant and prompt suggestion chips.
3. Your language selection is automatically saved in browser local storage and persists across page reloads.

### B. Farmer Voice-First Consultation & Emergency Danger Escalation
1. Sign in as a farmer using Name and Mobile Number (or click **"1-Click Demo Farmer"**).
2. Go to **Veterinary Assistance** tab and click **"Request Consultation"**.
3. Select your animal and choose **Urgency Level: 🔴 DANGER (Immediate Hazard)**.
4. Click the large blue microphone button: **"🎙️ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಲು ಇಲ್ಲಿ ಒತ್ತಿ (Tap to Speak Concern)"**.
5. Speak your animal's symptoms into the microphone (or click any of the 4 quick preset chips like *"ನನ್ನ ಹಸುವಿಗೆ ವಿಪರೀತ ಜ್ವರ (104°F) ಮತ್ತು ಮೈಮೇಲೆ ಗಂಟುಗಳಿವೆ, ದಯವಿಟ್ಟು ತಕ್ಷಣ ಬನ್ನಿ."*).
6. Click **"ತುರ್ತು ವಿನಂತಿ ರವಾನಿಸಿ (Transmit Request)"**.

### C. Doctor Clinical Portal: Real-Time Notifications & Immediate Slot Allocation
1. Sign out and click **Login -> Veterinary Doctor Portal** (or click **"1-Click Doctor Login"**).
2. Observe the **Emergency Notification Bell** in the topbar pulsing red with active danger alerts.
3. Review the **Farmer Requests & Triage Queue** (`#tab-doctor-consultations`):
   - Critical requests are prominently flagged with pulsing **🚨 DANGER** badges.
   - Read the farmer's name, village, and spoken voice concern.
4. Click **"⚡ ತಕ್ಷಣ ಸ್ಲಾಟ್ ನಿಗದಿಪಡಿಸಿ (Accept & Assign Slot)"**.
5. Select a slot time (e.g. *🚨 ತಕ್ಷಣ 30 ನಿಮಿಷದಲ್ಲಿ* or *ಇಂದು ಮಧ್ಯಾಹ್ನ 12:30 PM*) and enter first-aid instructions for the farmer.
6. Click **"ಸ್ಲಾಟ್ ಖಚಿತಪಡಿಸಿ (Confirm & Notify Farmer)"**.
7. Now log back in as the farmer: notice the prominent green banner confirming the doctor's visit time, instructions, and a 1-click **"📞 ವೈದ್ಯರಿಗೆ ಕರೆ ಮಾಡಿ (Call Doctor: 9448123456)"** button!

### D. Doctor Maintaining Cow Medical Reports (Electronic Health Records - EHR)
1. In the Doctor Portal, navigate to **Cow Medical EHR** (`#tab-doctor-ehr`).
2. Click **"+ Add New Medical Report"**.
3. Select the cattle, specify Clinical Diagnosis (e.g. *Lumpy Skin Disease Stage-1*), prescribed medicines & dosages (e.g. *Inj Meloxicam 15ml, Enrofloxacin, Povidone-Iodine spray*), vitals, and next checkup date.
4. Click **"ವರದಿ ಉಳಿಸಿ (Save Medical Report)"**.
5. Both the doctor and farmer can view verified cattle health records and prescriptions at any time.

### E. Village Early Warning System (Designated for Doctors)
1. In the Doctor Portal sidebar, open **ಗ್ರಾಮ ರೋಗ ಮುನ್ನೆಚ್ಚರಿಕೆ (Village Early Warning)**.
2. Run pattern detection scans across anonymized village reports or click **"Simulate Village Outbreak (Demo)"** to inject sample clusters and verify automated community warnings.

### F. AI Camera Livestock Disease & Welfare Detection System (Collar-Free Monitoring)
1. Navigate to **AI Camera & Symptoms** tab.
2. Select target animal (e.g. `Gauri`).
3. Choose input mode: **Live Camera** (with webcam viewfinder) or **Upload Photo**.
4. Toggle between **🟢 RGB Spectrum** and **🔥 Thermal Vision**.
5. Select symptoms and click **"Run AI Disease & Welfare Detection"**.
6. Inspect the explainable clinical HUD metrics: Animal Welfare Index, BCS score (1.0-5.0), lameness grade, heat stress, and detected bovine diseases.

### G. Multilingual Voice & Text LLM Assistant with Strict Livestock Domain Guardrails
1. Open **Multilingual Assistant** tab.
2. Ask cattle health questions in Kannada, Hindi, or English (e.g. *"ನನ್ನ ಹಸುವಿಗೆ ಜ್ವರ ಮತ್ತು ಮೈಮೇಲೆ ಗಂಟುಗಳಿವೆ, ಏನು ಮಾಡಬೇಕು?"*).
3. Test the **Strict Domain Guardrail**: Ask an off-topic question (e.g. cricket, weather, politics). The AI will politely refuse and guide the user back to livestock care in their chosen language.
4. Click **🔊 Listen / ಆಲಿಸಿ** on any message for audio playback via Text-to-Speech.

---

## 7. Official Medical Disclaimer

> **Important:** VETAI provides preliminary decision-support information and is not a confirmed veterinary diagnosis. Consult a qualified, registered veterinarian for clinical examination, diagnosis, and prescription treatment.
