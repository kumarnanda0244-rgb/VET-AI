/**
 * VETAI - AI-Powered Livestock Healthcare & Community Disease Early Warning System
 * Theme: Samriddh Annadata, Samriddh Bharat
 * 
 * Includes AI Camera Livestock Disease & Welfare Detection System:
 * Computer vision, machine learning, and thermal or RGB imaging to monitor
 * health and welfare parameters automatically without physical collars or transponders.
 */

// Global State
const STATE = {
  currentUser: null,
  animals: [],
  currentTab: "overview",
  currentLanguage: "en",
  
  // Landing Camera State
  landingCameraStream: null,
  landingFacingMode: "environment",
  landingPhotoData: "",
  landingSpectrum: "RGB",
  
  // Dashboard Camera State
  dashCameraStream: null,
  dashFacingMode: "environment",
  dashPhotoData: "",
  dashSpectrum: "RGB",
  
  charts: {
    healthStatus: null,
    symptomsTrend: null
  }
};

const API_BASE = "";

// ==============================================================================
// INITIALIZATION
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("vetai_user");
  if (savedUser) {
    try {
      STATE.currentUser = JSON.parse(savedUser);
      updateAuthUI(true);
    } catch (e) {
      localStorage.removeItem("vetai_user");
    }
  }

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "short", day: "numeric"
  });
  const dateElem = document.getElementById("dash-live-date");
  if (dateElem) dateElem.textContent = dateStr;

  window.addEventListener("scroll", () => {
    const header = document.getElementById("main-header");
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  if (STATE.currentUser) {
    refreshDashboardData();
  }

  // Initialize Multilingual Assistant language and prompt chips
  setFarmerLanguage(STATE.currentLanguage || "en");
});


// ==============================================================================
// VIEW & TAB SWITCHING
// ==============================================================================
function switchView(viewName) {
  const landingView = document.getElementById("landing-view");
  const dashboardView = document.getElementById("dashboard-view");

  // Stop camera streams
  stopLandingLiveCamera();
  stopDashLiveCamera();

  if (viewName === "dashboard") {
    if (!STATE.currentUser) {
      openAuthModal("login");
      return;
    }
    document.body.setAttribute("data-view", "dashboard");
    landingView.style.display = "none";
    dashboardView.style.display = "flex";
    refreshDashboardData();
  } else {
    document.body.setAttribute("data-view", "landing");
    landingView.style.display = "block";
    dashboardView.style.display = "none";
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchDashboardTab(tabId) {
  stopDashLiveCamera();
  STATE.currentTab = tabId;

  document.querySelectorAll(".sidebar-menu .nav-item").forEach(btn => {
    btn.classList.remove("active");
  });
  const targetBtn = Array.from(document.querySelectorAll(".sidebar-menu .nav-item")).find(btn => {
    return btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(`'${tabId}'`);
  });
  if (targetBtn) targetBtn.classList.add("active");

  document.querySelectorAll(".dash-tab").forEach(tab => {
    tab.classList.remove("active-tab");
  });
  const activeTab = document.getElementById(`tab-${tabId}`);
  if (activeTab) activeTab.classList.add("active-tab");

  const titleMap = {
    overview: "Dashboard Overview",
    assessment: "AI Camera Livestock Disease & Welfare Detection",
    animals: "My Animals",
    reminders: "Vaccine & Health Reminders",
    veterinary: "Veterinary Assistance & Consultations",
    community: "Village-Level Disease Early Warning System",
    assistant: "Multilingual Voice & Text Assistant"
  };
  const titleElem = document.getElementById("dash-active-title");
  if (titleElem) titleElem.textContent = titleMap[tabId] || "Dashboard";

  if (tabId === "overview") {
    refreshOverviewMetrics();
  } else if (tabId === "assessment") {
    populateAnimalSelects();
    fetchCameraScreenings();
  } else if (tabId === "animals") {
    renderAnimalsList();
  } else if (tabId === "reminders") {
    fetchReminders();
    populateAnimalSelects();
  } else if (tabId === "veterinary") {
    fetchVets();
    fetchConsultations();
    populateAnimalSelects();
  } else if (tabId === "community") {
    fetchCommunityData();
  }

  const sidebar = document.getElementById("dashboard-sidebar");
  if (sidebar && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("dashboard-sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

function toggleMobileMenu() {
  const drawer = document.getElementById("mobile-drawer");
  if (drawer) drawer.classList.toggle("open");
}


// ==============================================================================
// AUTHENTICATION
// ==============================================================================
function openAuthModal(mode = "login") {
  const modal = document.getElementById("auth-modal");
  modal.style.display = "flex";
  toggleAuthMode(mode);
}

function closeAuthModal() {
  document.getElementById("auth-modal").style.display = "none";
}

function toggleAuthMode(mode) {
  const title = document.getElementById("auth-modal-title");
  const loginForm = document.getElementById("login-form");
  const regForm = document.getElementById("register-form");

  if (mode === "register") {
    title.textContent = "New Farmer Registration";
    loginForm.style.display = "none";
    regForm.style.display = "block";
  } else {
    title.textContent = "Farmer Login";
    loginForm.style.display = "block";
    regForm.style.display = "none";
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      STATE.currentUser = data.user;
      localStorage.setItem("vetai_user", JSON.stringify(data.user));
      updateAuthUI(true);
      closeAuthModal();
      showToast(data.message, "success");
      switchView("dashboard");
    } else {
      showToast(data.message || "Invalid login credentials.", "error");
    }
  } catch (err) {
    showToast("Network error during login.", "error");
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const payload = {
    name: document.getElementById("reg-name").value.trim(),
    email: document.getElementById("reg-email").value.trim(),
    phone: document.getElementById("reg-phone").value.trim(),
    password: document.getElementById("reg-password").value,
    village: document.getElementById("reg-village").value.trim(),
    district: document.getElementById("reg-district").value.trim(),
    state: document.getElementById("reg-state").value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      STATE.currentUser = data.user;
      localStorage.setItem("vetai_user", JSON.stringify(data.user));
      updateAuthUI(true);
      closeAuthModal();
      showToast("Account created successfully! Welcome to VETAI.", "success");
      switchView("dashboard");
    } else {
      showToast(data.message || "Registration failed.", "error");
    }
  } catch (err) {
    showToast("Network error during registration.", "error");
  }
}

async function demoLoginAndLaunch(targetTab = "assessment") {
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ramesh@vetai.org", password: "farmer123" })
    });
    const data = await res.json();

    if (data.success) {
      STATE.currentUser = data.user;
      localStorage.setItem("vetai_user", JSON.stringify(data.user));
      updateAuthUI(true);
      closeAuthModal();
      showToast("Signed in as Farmer Ramesh Patel (Demo)", "success");
      switchView("dashboard");
      if (targetTab !== "overview") {
        switchDashboardTab(targetTab);
      }
    } else {
      showToast("Demo login unavailable.", "error");
    }
  } catch (err) {
    showToast("Error connecting to server.", "error");
  }
}

function logoutFarmer() {
  stopLandingLiveCamera();
  stopDashLiveCamera();
  STATE.currentUser = null;
  localStorage.removeItem("vetai_user");
  updateAuthUI(false);
  showToast("Logged out successfully.", "info");
  switchView("landing");
}

function updateAuthUI(isLoggedIn) {
  const navLoggedOut = document.getElementById("nav-auth-logged-out");
  const navLoggedIn = document.getElementById("nav-auth-logged-in");
  const navFarmerName = document.getElementById("nav-farmer-name");
  const sidebarUserName = document.getElementById("sidebar-user-name");
  const sidebarUserVillage = document.getElementById("sidebar-user-village");

  if (isLoggedIn && STATE.currentUser) {
    navLoggedOut.style.display = "none";
    navLoggedIn.style.display = "flex";
    if (navFarmerName) navFarmerName.textContent = STATE.currentUser.name;
    if (sidebarUserName) sidebarUserName.textContent = STATE.currentUser.name;
    if (sidebarUserVillage) sidebarUserVillage.textContent = `${STATE.currentUser.village}, ${STATE.currentUser.district}`;
  } else {
    navLoggedOut.style.display = "flex";
    navLoggedIn.style.display = "none";
  }
}


// ==============================================================================
// DASHBOARD OVERVIEW METRICS & CHARTS
// ==============================================================================
async function refreshDashboardData() {
  if (!STATE.currentUser) return;
  await fetchAnimals();
  await refreshOverviewMetrics();
  await fetchCommunityWarningsIndicator();
}

async function refreshOverviewMetrics() {
  if (!STATE.currentUser) return;

  try {
    const [animalsRes, assessRes, remRes] = await Promise.all([
      fetch(`${API_BASE}/api/animals?user_id=${STATE.currentUser.id}`),
      fetch(`${API_BASE}/api/assessments?user_id=${STATE.currentUser.id}`),
      fetch(`${API_BASE}/api/reminders?user_id=${STATE.currentUser.id}`)
    ]);

    const animalsData = await animalsRes.json();
    const assessData = await assessRes.json();
    const remData = await remRes.json();

    const animals = animalsData.animals || [];
    const assessments = assessData.assessments || [];
    const reminders = remData.reminders || [];

    document.getElementById("metric-total-animals").textContent = animals.length;

    let healthy = 0;
    let attention = 0;
    let emergency = 0;

    assessments.forEach(a => {
      if (a.risk_category === "GREEN") healthy++;
      else if (a.risk_category === "YELLOW") attention++;
      else if (a.risk_category === "ORANGE" || a.risk_category === "RED") emergency++;
    });

    if (assessments.length === 0) healthy = animals.length;

    document.getElementById("metric-healthy-animals").textContent = healthy;
    document.getElementById("metric-attention-animals").textContent = attention;
    document.getElementById("metric-emergency-animals").textContent = emergency;
    document.getElementById("metric-upcoming-reminders").textContent = reminders.filter(r => !r.is_completed).length;

    // Render Recent Assessments
    const assessTbody = document.getElementById("overview-assessments-tbody");
    if (assessTbody) {
      if (assessments.length === 0) {
        assessTbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No assessments conducted yet. Click "Conduct Assessment" to begin.</td></tr>`;
      } else {
        assessTbody.innerHTML = assessments.slice(0, 5).map(a => {
          let syms = [];
          try { syms = JSON.parse(a.symptoms); } catch (e) { syms = [a.symptoms]; }
          const badgeClass = a.risk_category === "RED" ? "badge-danger" :
                             a.risk_category === "ORANGE" ? "badge-warning" :
                             a.risk_category === "YELLOW" ? "badge-warning" : "badge-success";
          return `
            <tr>
              <td><strong>${a.created_at.slice(0, 10)}</strong></td>
              <td><strong>${escapeHtml(a.animal_name || 'Animal')}</strong> (${escapeHtml(a.animal_type || 'Cattle')})</td>
              <td>${syms.slice(0, 2).map(s => `<span class="badge badge-outline">${escapeHtml(s)}</span>`).join(" ")}</td>
              <td><span class="badge ${badgeClass}">${a.risk_category}</span></td>
              <td><button class="btn btn-ghost btn-sm" onclick="switchDashboardTab('assessment')">View</button></td>
            </tr>
          `;
        }).join("");
      }
    }

    // Render Upcoming Reminders
    const remTbody = document.getElementById("overview-reminders-tbody");
    if (remTbody) {
      const pendingReminders = reminders.filter(r => !r.is_completed);
      if (pendingReminders.length === 0) {
        remTbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No active reminders due. All vaccinations up to date!</td></tr>`;
      } else {
        remTbody.innerHTML = pendingReminders.slice(0, 5).map(r => `
          <tr>
            <td><strong>${r.due_date}</strong></td>
            <td><span class="badge badge-outline">${escapeHtml(r.reminder_type)}</span></td>
            <td>${escapeHtml(r.title)}</td>
            <td><span class="badge badge-warning">Pending</span></td>
          </tr>
        `).join("");
      }
    }

    renderCharts(assessments);

  } catch (err) {
    console.error("Error refreshing overview metrics:", err);
  }
}

function renderCharts(assessments) {
  const ctxHealth = document.getElementById("healthStatusChart");
  if (ctxHealth) {
    let green = 0, yellow = 0, orange = 0, red = 0;
    assessments.forEach(a => {
      if (a.risk_category === "GREEN") green++;
      else if (a.risk_category === "YELLOW") yellow++;
      else if (a.risk_category === "ORANGE") orange++;
      else if (a.risk_category === "RED") red++;
    });
    if (assessments.length === 0) { green = 3; }

    if (STATE.charts.healthStatus) STATE.charts.healthStatus.destroy();
    STATE.charts.healthStatus = new Chart(ctxHealth, {
      type: "doughnut",
      data: {
        labels: ["Optimal (Green)", "Mild Concern (Yellow)", "Significant (Orange)", "Urgent Emergency (Red)"],
        datasets: [{
          data: [green, yellow, orange, red],
          backgroundColor: ["#2E6B45", "#E99A36", "#E26D28", "#D94B45"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } }
      }
    });
  }

  const ctxSymptoms = document.getElementById("symptomsTrendChart");
  if (ctxSymptoms) {
    const symCounts = {};
    assessments.forEach(a => {
      try {
        const list = JSON.parse(a.symptoms);
        list.forEach(s => { symCounts[s] = (symCounts[s] || 0) + 1; });
      } catch (e) {}
    });

    const labels = Object.keys(symCounts).length ? Object.keys(symCounts) : ["Loss of Appetite", "Fever", "Cough", "Reduced Milk"];
    const values = Object.keys(symCounts).length ? Object.values(symCounts) : [4, 3, 2, 2];

    if (STATE.charts.symptomsTrend) STATE.charts.symptomsTrend.destroy();
    STATE.charts.symptomsTrend = new Chart(ctxSymptoms, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Recorded Symptom Frequency",
          data: values,
          backgroundColor: "#2E6B45",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        plugins: { legend: { display: false } }
      }
    });
  }
}


// ==============================================================================
// LANDING PAGE AI CAMERA & CAPTURE CONTROLS
// ==============================================================================
function setLandingCaptureMode(mode) {
  const uploadBtn = document.getElementById("btn-landing-mode-upload");
  const cameraBtn = document.getElementById("btn-landing-mode-camera");
  const uploadPanel = document.getElementById("landing-upload-panel");
  const cameraPanel = document.getElementById("landing-camera-panel");

  if (mode === "camera") {
    cameraBtn.classList.replace("btn-outline", "btn-primary");
    uploadBtn.classList.replace("btn-primary", "btn-outline");
    uploadPanel.style.display = "none";
    cameraPanel.style.display = "block";
    startLandingLiveCamera();
  } else {
    stopLandingLiveCamera();
    uploadBtn.classList.replace("btn-outline", "btn-primary");
    cameraBtn.classList.replace("btn-primary", "btn-outline");
    uploadPanel.style.display = "block";
    cameraPanel.style.display = "none";
  }
}

function setLandingSpectrum(spectrum) {
  STATE.landingSpectrum = spectrum;
  const rgbBtn = document.getElementById("btn-landing-spectrum-rgb");
  const thermalBtn = document.getElementById("btn-landing-spectrum-thermal");

  if (spectrum === "RGB") {
    rgbBtn.classList.add("active");
    thermalBtn.classList.remove("active");
    showToast("RGB Visual Spectrum Mode", "info");
  } else {
    thermalBtn.classList.add("active");
    rgbBtn.classList.remove("active");
    showToast("Thermal Infrared Thermography Active", "warning");
  }
}

async function startLandingLiveCamera() {
  const video = document.getElementById("landing-live-video");
  const preview = document.getElementById("landing-camera-snapshot-preview");
  const standby = document.getElementById("landing-camera-standby");
  const startBtn = document.getElementById("btn-landing-cam-start");
  const captureBtn = document.getElementById("btn-landing-cam-capture");
  const flipBtn = document.getElementById("btn-landing-cam-flip");
  const stopBtn = document.getElementById("btn-landing-cam-stop");
  const hudTag = document.getElementById("landing-hud-tag");

  try {
    const constraints = {
      video: {
        facingMode: STATE.landingFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    STATE.landingCameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = STATE.landingCameraStream;
    await video.play();

    standby.style.display = "none";
    preview.style.display = "none";
    video.style.display = "block";

    startBtn.style.display = "none";
    captureBtn.style.display = "inline-flex";
    flipBtn.style.display = "inline-flex";
    stopBtn.style.display = "inline-flex";
    if (hudTag) hudTag.textContent = "LIVE CAMERA • ACTIVE";
    showToast("Live camera stream started.", "success");
  } catch (err) {
    showToast("Unable to access camera. Please check permissions or upload photo.", "error");
  }
}

function captureLandingLiveSnapshot() {
  const video = document.getElementById("landing-live-video");
  const canvas = document.getElementById("landing-live-canvas");
  const preview = document.getElementById("landing-camera-snapshot-preview");
  const hudTag = document.getElementById("landing-hud-tag");

  if (!STATE.landingCameraStream) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const photoBase64 = canvas.toDataURL("image/jpeg", 0.85);
  STATE.landingPhotoData = photoBase64;

  video.style.display = "none";
  preview.src = photoBase64;
  preview.style.display = "block";

  stopLandingLiveCamera();
  if (hudTag) hudTag.textContent = "SNAPSHOT CAPTURED • READY FOR AI";
  showToast("Snapshot captured! Click 'Run AI Disease & Welfare Detection'.", "success");
}

function stopLandingLiveCamera() {
  if (STATE.landingCameraStream) {
    STATE.landingCameraStream.getTracks().forEach(t => t.stop());
    STATE.landingCameraStream = null;
  }
  const startBtn = document.getElementById("btn-landing-cam-start");
  const captureBtn = document.getElementById("btn-landing-cam-capture");
  const flipBtn = document.getElementById("btn-landing-cam-flip");
  const stopBtn = document.getElementById("btn-landing-cam-stop");
  const hudTag = document.getElementById("landing-hud-tag");

  if (startBtn) startBtn.style.display = "inline-flex";
  if (captureBtn) captureBtn.style.display = "none";
  if (flipBtn) flipBtn.style.display = "none";
  if (stopBtn) stopBtn.style.display = "none";
  if (hudTag && !STATE.landingPhotoData) hudTag.textContent = "STANDBY";
}

function flipLandingLiveCamera() {
  STATE.landingFacingMode = STATE.landingFacingMode === "environment" ? "user" : "environment";
  stopLandingLiveCamera();
  startLandingLiveCamera();
}

function previewLandingPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    STATE.landingPhotoData = e.target.result;
    document.getElementById("landing-photo-preview").src = e.target.result;
    document.getElementById("landing-preview-wrap").style.display = "block";
    document.getElementById("landing-dropzone-content").style.display = "none";
    showToast("Photograph uploaded successfully.", "success");
  };
  reader.readAsDataURL(file);
}

function clearLandingPhoto(event) {
  if (event) event.stopPropagation();
  STATE.landingPhotoData = "";
  document.getElementById("landing-photo-input").value = "";
  document.getElementById("landing-preview-wrap").style.display = "none";
  document.getElementById("landing-dropzone-content").style.display = "block";
}


// ==============================================================================
// DASHBOARD AI CAMERA & CAPTURE CONTROLS (TAB 2)
// ==============================================================================
function setDashCaptureMode(mode) {
  const uploadBtn = document.getElementById("btn-dash-mode-upload");
  const cameraBtn = document.getElementById("btn-dash-mode-camera");
  const uploadPanel = document.getElementById("dash-upload-panel");
  const cameraPanel = document.getElementById("dash-camera-panel");

  if (mode === "camera") {
    cameraBtn.classList.replace("btn-outline", "btn-primary");
    uploadBtn.classList.replace("btn-primary", "btn-outline");
    uploadPanel.style.display = "none";
    cameraPanel.style.display = "block";
    startDashLiveCamera();
  } else {
    stopDashLiveCamera();
    uploadBtn.classList.replace("btn-outline", "btn-primary");
    cameraBtn.classList.replace("btn-primary", "btn-outline");
    uploadPanel.style.display = "block";
    cameraPanel.style.display = "none";
  }
}

function setDashSpectrum(spectrum) {
  STATE.dashSpectrum = spectrum;
  const rgbBtn = document.getElementById("btn-dash-spectrum-rgb");
  const thermalBtn = document.getElementById("btn-dash-spectrum-thermal");

  if (spectrum === "RGB") {
    rgbBtn.classList.add("active");
    thermalBtn.classList.remove("active");
    showToast("RGB Visual Spectrum Mode", "info");
  } else {
    thermalBtn.classList.add("active");
    rgbBtn.classList.remove("active");
    showToast("Thermal Infrared Thermography Active", "warning");
  }
}

async function startDashLiveCamera() {
  const video = document.getElementById("dash-live-video");
  const preview = document.getElementById("dash-camera-snapshot-preview");
  const standby = document.getElementById("dash-camera-standby");
  const startBtn = document.getElementById("btn-dash-cam-start");
  const captureBtn = document.getElementById("btn-dash-cam-capture");
  const flipBtn = document.getElementById("btn-dash-cam-flip");
  const stopBtn = document.getElementById("btn-dash-cam-stop");
  const hudTag = document.getElementById("dash-hud-tag");

  try {
    const constraints = {
      video: {
        facingMode: STATE.dashFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    STATE.dashCameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = STATE.dashCameraStream;
    await video.play();

    standby.style.display = "none";
    preview.style.display = "none";
    video.style.display = "block";

    startBtn.style.display = "none";
    captureBtn.style.display = "inline-flex";
    flipBtn.style.display = "inline-flex";
    stopBtn.style.display = "inline-flex";
    if (hudTag) hudTag.textContent = "LIVE CAMERA • ACTIVE";
    showToast("Live camera stream started.", "success");
  } catch (err) {
    showToast("Unable to access camera. Please check permissions or upload photo.", "error");
  }
}

function captureDashLiveSnapshot() {
  const video = document.getElementById("dash-live-video");
  const canvas = document.getElementById("dash-live-canvas");
  const preview = document.getElementById("dash-camera-snapshot-preview");
  const hudTag = document.getElementById("dash-hud-tag");

  if (!STATE.dashCameraStream) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const photoBase64 = canvas.toDataURL("image/jpeg", 0.85);
  STATE.dashPhotoData = photoBase64;

  video.style.display = "none";
  preview.src = photoBase64;
  preview.style.display = "block";

  stopDashLiveCamera();
  if (hudTag) hudTag.textContent = "SNAPSHOT CAPTURED • READY FOR AI";
  showToast("Snapshot captured! Click 'Run AI Disease & Welfare Detection'.", "success");
}

function stopDashLiveCamera() {
  if (STATE.dashCameraStream) {
    STATE.dashCameraStream.getTracks().forEach(t => t.stop());
    STATE.dashCameraStream = null;
  }
  const startBtn = document.getElementById("btn-dash-cam-start");
  const captureBtn = document.getElementById("btn-dash-cam-capture");
  const flipBtn = document.getElementById("btn-dash-cam-flip");
  const stopBtn = document.getElementById("btn-dash-cam-stop");
  const hudTag = document.getElementById("dash-hud-tag");

  if (startBtn) startBtn.style.display = "inline-flex";
  if (captureBtn) captureBtn.style.display = "none";
  if (flipBtn) flipBtn.style.display = "none";
  if (stopBtn) stopBtn.style.display = "none";
  if (hudTag && !STATE.dashPhotoData) hudTag.textContent = "STANDBY";
}

function flipDashLiveCamera() {
  STATE.dashFacingMode = STATE.dashFacingMode === "environment" ? "user" : "environment";
  stopDashLiveCamera();
  startDashLiveCamera();
}

function previewAssessmentPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    STATE.dashPhotoData = e.target.result;
    document.getElementById("assess-photo-preview").src = e.target.result;
    document.getElementById("assess-preview-wrap").style.display = "block";
    document.getElementById("assess-dropzone-content").style.display = "none";
    showToast("Photograph uploaded successfully.", "success");
  };
  reader.readAsDataURL(file);
}

function clearAssessmentPhoto(event) {
  if (event) event.stopPropagation();
  STATE.dashPhotoData = "";
  document.getElementById("assess-photo-input").value = "";
  document.getElementById("assess-preview-wrap").style.display = "none";
  document.getElementById("assess-dropzone-content").style.display = "block";
}


// ==============================================================================
// UNIFIED ASSESSMENT & AI CAMERA DISEASE DETECTION
// ==============================================================================
async function submitUnifiedAssessment(event, source = "dash") {
  event.preventDefault();

  const isLanding = source === "landing";
  const animalSelectId = isLanding ? "landing-animal-select" : "assess-animal-select";
  const durationId = isLanding ? "landing-duration" : "assess-duration";
  const severityId = isLanding ? "landing-severity" : "assess-severity";
  const notesId = isLanding ? null : "assess-notes";
  const submitBtnId = isLanding ? "landing-submit-btn" : "submit-assessment-btn";
  const checkboxesName = isLanding ? "landing_symptoms" : "symptoms";

  const animalId = document.getElementById(animalSelectId).value;
  if (!animalId) {
    showToast("Please select an animal from the dropdown.", "warning");
    return;
  }

  const checkboxes = document.querySelectorAll(`input[name="${checkboxesName}"]:checked`);
  let symptoms = Array.from(checkboxes).map(cb => cb.value);
  if (symptoms.length === 0) {
    symptoms = ["Routine Clinical Observation"];
  }

  const duration = document.getElementById(durationId).value;
  const severity = document.getElementById(severityId).value;
  const notes = notesId ? (document.getElementById(notesId).value || "") : "";
  const photoData = isLanding ? STATE.landingPhotoData : STATE.dashPhotoData;
  const mode = isLanding ? STATE.landingSpectrum : STATE.dashSpectrum;

  const submitBtn = document.getElementById(submitBtnId);
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Computer Vision & Thermal Analysis...`;

  try {
    const res = await fetch(`${API_BASE}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        animal_id: parseInt(animalId),
        user_id: STATE.currentUser ? STATE.currentUser.id : 1,
        symptoms, severity, duration,
        additional_notes: notes,
        photo_data: photoData,
        mode: mode
      })
    });
    const data = await res.json();

    if (data.success) {
      renderUnifiedAssessmentResult(data, isLanding);
      if (!isLanding) {
        refreshOverviewMetrics();
        fetchCameraScreenings();
      }
      showToast("AI Disease & Welfare Detection completed!", "success");
    } else {
      showToast(data.message || "Detection failed.", "error");
    }
  } catch (err) {
    showToast("Network error submitting assessment.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Run AI Disease & Welfare Detection`;
  }
}

function renderUnifiedAssessmentResult(data, isLanding) {
  const placeholderId = isLanding ? "landing-placeholder" : "assessment-placeholder";
  const liveResultId = isLanding ? "landing-live-result" : "assessment-live-result";

  const placeholder = document.getElementById(placeholderId);
  const liveResult = document.getElementById(liveResultId);

  placeholder.style.display = "none";
  liveResult.style.display = "block";

  const d = data.detection || {};
  const animal = data.animal || {};
  const risk = data.risk_category || "GREEN";

  const priorityColor = risk === "RED" ? "bg-red" :
                        risk === "ORANGE" ? "bg-orange" :
                        risk === "YELLOW" ? "bg-yellow" : "bg-green";

  // Build Diseases List
  let diseasesHtml = "";
  if (d.detected_diseases && d.detected_diseases.length > 0) {
    diseasesHtml = d.detected_diseases.map(dis => {
      const isUrgent = dis.severity.includes("Emergency") || dis.severity.includes("Significant");
      return `
        <div class="disease-alert-item ${isUrgent ? 'urgent' : 'mild'}">
          <div class="flex-between">
            <strong><i class="fa-solid fa-virus-covid"></i> ${escapeHtml(dis.disease)}</strong>
            <span class="badge ${isUrgent ? 'badge-danger' : 'badge-warning'}">${Math.round(dis.confidence * 100)}% Confidence</span>
          </div>
          <small class="text-muted d-block mt-1"><strong>Region:</strong> ${escapeHtml(dis.region)}</small>
          <p class="text-sm mb-0 mt-1">${escapeHtml(dis.findings)}</p>
        </div>
      `;
    }).join("");
  } else {
    diseasesHtml = `
      <div class="p-3 bg-light-green rounded text-success text-sm">
        <i class="fa-solid fa-circle-check"></i> No acute viral/bacterial lesions detected. Coat and locomotion are normal.
      </div>
    `;
  }

  // Interventions List
  const interventionsList = d.recommended_interventions || data.recommended_steps || [];
  const interventionsHtml = interventionsList.map(step => `
    <li class="mb-1">${escapeHtml(step)}</li>
  `).join("");

  // Thermal Heatmap Preview if available
  const thermalHtml = d.thermal_map_data ? `
    <div class="thermal-preview-container">
      <div class="p-1 bg-dark text-white text-xs flex-between">
        <span><i class="fa-solid fa-fire"></i> Infrared Thermography Heatmap</span>
        <span>Surface Temp: ${d.surface_temp}°C</span>
      </div>
      <img src="${d.thermal_map_data}" alt="Thermal heatmap">
    </div>
  ` : "";

  liveResult.innerHTML = `
    <!-- Top Priority Banner -->
    <div class="triage-result-banner ${priorityColor}">
      <span class="badge badge-outline text-white" style="border-color: rgba(255,255,255,0.6);">
        ${d.mode || 'RGB'} Vision Mode • Collar-Free AI
      </span>
      <h3 class="triage-title mt-1">${escapeHtml(animal.animal_name || 'Animal')} - ${risk} Priority</h3>
      <p class="mb-0 text-sm">Tag ID: ${escapeHtml(animal.tag_id || 'ID')} (${escapeHtml(animal.breed || '')} ${escapeHtml(animal.animal_type || 'Cattle')})</p>
    </div>

    <!-- Welfare Index Progress Bar -->
    <div class="mb-3">
      <div class="flex-between text-sm">
        <strong>Overall Animal Welfare Index:</strong>
        <strong class="text-primary">${d.welfare_score || 90}%</strong>
      </div>
      <div class="welfare-progress-bar-wrap">
        <div class="welfare-progress-bar" style="width: ${d.welfare_score || 90}%;"></div>
      </div>
    </div>

    ${thermalHtml}

    <!-- Four Parameter HUD Boxes -->
    <div class="hud-metric-row">
      <div class="hud-metric-box">
        <span class="hud-metric-title"><i class="fa-solid fa-weight-scale"></i> Body Condition (BCS)</span>
        <div class="hud-metric-number">${d.bcs_score || 3.0} / 5.0</div>
        <small class="text-muted">${(d.bcs_score >= 3.0 && d.bcs_score <= 3.5) ? 'Optimal Herd Weight' : 'Condition Deviation'}</small>
      </div>

      <div class="hud-metric-box">
        <span class="hud-metric-title"><i class="fa-solid fa-person-walking"></i> Locomotion / Lameness</span>
        <div class="hud-metric-number" style="font-size: 1.05rem; padding-top: 4px;">${escapeHtml(d.lameness_score || 'Score 1')}</div>
        <small class="text-muted">Gait & Dorsal Curvature</small>
      </div>

      <div class="hud-metric-box">
        <span class="hud-metric-title"><i class="fa-solid fa-lungs"></i> Respiration Rate</span>
        <div class="hud-metric-number">${d.respiration_rate || 28} <span class="text-sm">bpm</span></div>
        <small class="text-muted">${escapeHtml(d.heat_stress_index || 'Normal')}</small>
      </div>

      <div class="hud-metric-box">
        <span class="hud-metric-title"><i class="fa-solid fa-temperature-half"></i> Surface Temp</span>
        <div class="hud-metric-number">${d.surface_temp || 38.5} °C</div>
        <small class="text-muted">${(d.surface_temp > 39.5) ? 'Thermal Elevation' : 'Normothermic'}</small>
      </div>
    </div>

    <!-- Detected Diseases -->
    <div class="mb-3">
      <h5 class="mb-2"><i class="fa-solid fa-shield-virus text-warning"></i> Automated Disease Screening Findings:</h5>
      ${diseasesHtml}
    </div>

    <!-- Clinical Interventions -->
    <div class="mb-3">
      <h5 class="mb-2"><i class="fa-solid fa-list-check text-primary"></i> Recommended Interventions:</h5>
      <ul class="steps-list" style="padding-left: 1.2rem; font-size: 0.88rem;">
        ${interventionsHtml}
      </ul>
    </div>

    <div class="d-flex gap-2 mt-3">
      <button class="btn btn-outline flex-1" onclick="switchDashboardTab('veterinary')">
        <i class="fa-solid fa-user-doctor"></i> Request Veterinary Consultation
      </button>
      <button class="btn btn-secondary flex-1" onclick="window.print()">
        <i class="fa-solid fa-print"></i> Print / Save Report
      </button>
    </div>
  `;
}

async function fetchCameraScreenings() {
  if (!STATE.currentUser) return;
  try {
    const res = await fetch(`${API_BASE}/api/camera/screenings?user_id=${STATE.currentUser.id}`);
    const data = await res.json();
    const tbody = document.getElementById("camera-screenings-tbody");
    if (!tbody) return;

    if (!data.screenings || data.screenings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No vision screenings recorded yet. Launch camera above!</td></tr>`;
      return;
    }

    tbody.innerHTML = data.screenings.map(s => {
      let diseases = [];
      try { diseases = JSON.parse(s.detected_diseases); } catch (e) {}
      const diseaseStr = diseases.length ? diseases.map(d => d.disease).join(", ") : "None detected";
      const badgeClass = s.risk_category === "RED" ? "badge-danger" :
                         s.risk_category === "ORANGE" ? "badge-warning" :
                         s.risk_category === "YELLOW" ? "badge-warning" : "badge-success";
      return `
        <tr>
          <td><strong>${s.created_at.slice(0, 16)}</strong></td>
          <td><strong>${escapeHtml(s.animal_name)}</strong></td>
          <td>${s.bcs_score}</td>
          <td>${escapeHtml(s.lameness_score)}</td>
          <td>${s.surface_temp} °C</td>
          <td><strong class="text-primary">${s.welfare_score}%</strong></td>
          <td><small>${escapeHtml(diseaseStr)}</small></td>
          <td><span class="badge ${badgeClass}">${s.risk_category}</span></td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Error fetching camera screenings:", err);
  }
}


// ==============================================================================
// ANIMAL MANAGEMENT
// ==============================================================================
async function fetchAnimals() {
  if (!STATE.currentUser) return;
  try {
    const res = await fetch(`${API_BASE}/api/animals?user_id=${STATE.currentUser.id}`);
    const data = await res.json();
    if (data.success) {
      STATE.animals = data.animals || [];
      populateAnimalSelects();
    }
  } catch (err) {
    console.error("Error fetching animals:", err);
  }
}

function populateAnimalSelects() {
  const selects = [
    document.getElementById("assess-animal-select"),
    document.getElementById("modal-rem-animal"),
    document.getElementById("modal-consult-animal")
  ];

  selects.forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = select.id.includes("rem") ? `<option value="">-- All Herd / General --</option>` : `<option value="">-- Choose an animal --</option>`;

    STATE.animals.forEach(a => {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = `${a.animal_name} (${a.breed} ${a.animal_type} - ${a.tag_id})`;
      select.appendChild(opt);
    });

    if (currentVal) select.value = currentVal;
    else if (STATE.animals.length > 0 && !select.id.includes("rem")) select.value = STATE.animals[0].id;
  });
}

function renderAnimalsList() {
  const container = document.getElementById("animals-cards-container");
  if (!container) return;

  if (STATE.animals.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fa-solid fa-cow fa-3x text-muted mb-2"></i>
        <h4>No Livestock Registered Yet</h4>
        <p class="text-muted">Click "Register New Animal" to add your dairy or beef cattle.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = STATE.animals.map(a => {
    const imgSource = a.photo_data || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80";
    return `
      <div class="animal-card">
        <img src="${imgSource}" alt="${escapeHtml(a.animal_name)}" class="animal-card-img">
        <div class="animal-card-body">
          <div class="flex-between">
            <span class="animal-tag-pill">${escapeHtml(a.tag_id)}</span>
            <span class="badge badge-outline">${escapeHtml(a.gender)}</span>
          </div>
          <h4 class="animal-name">${escapeHtml(a.animal_name)}</h4>
          <div class="animal-specs">
            <div><strong>Species:</strong> ${escapeHtml(a.animal_type)}</div>
            <div><strong>Breed:</strong> ${escapeHtml(a.breed)}</div>
            <div><strong>Age:</strong> ${escapeHtml(a.age)}</div>
            <div><strong>Daily Milk:</strong> ${a.milk_production ? a.milk_production + ' L' : 'N/A'}</div>
          </div>
          <div class="animal-card-actions">
            <button class="btn btn-primary btn-sm flex-1" onclick="openAssessmentForAnimal(${a.id})">
              <i class="fa-solid fa-camera"></i> AI Scan
            </button>
            <button class="btn btn-outline btn-sm" onclick="deleteAnimalRecord(${a.id})" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function openAssessmentForAnimal(animalId) {
  switchDashboardTab('assessment');
  const sel = document.getElementById("assess-animal-select");
  if (sel) sel.value = animalId;
}

function openAddAnimalModal() {
  document.getElementById("add-animal-modal").style.display = "flex";
}

function closeAddAnimalModal() {
  document.getElementById("add-animal-modal").style.display = "none";
}

function previewAnimalModalPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById("modal-animal-preview");
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

async function submitNewAnimal(event) {
  event.preventDefault();
  const photoElem = document.getElementById("modal-animal-preview");
  const payload = {
    user_id: STATE.currentUser.id,
    animal_name: document.getElementById("modal-animal-name").value.trim(),
    tag_id: document.getElementById("modal-animal-tag").value.trim(),
    animal_type: document.getElementById("modal-animal-type").value,
    breed: document.getElementById("modal-animal-breed").value.trim(),
    age: document.getElementById("modal-animal-age").value.trim(),
    gender: document.getElementById("modal-animal-gender").value,
    weight: parseFloat(document.getElementById("modal-animal-weight").value) || null,
    milk_production: parseFloat(document.getElementById("modal-animal-milk").value) || null,
    photo_data: photoElem.style.display === "block" ? photoElem.src : "",
    notes: document.getElementById("modal-animal-notes").value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/animals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeAddAnimalModal();
      document.getElementById("add-animal-form").reset();
      photoElem.style.display = "none";
      await fetchAnimals();
      renderAnimalsList();
      showToast(data.message, "success");
    } else {
      showToast(data.message || "Failed to add animal.", "error");
    }
  } catch (err) {
    showToast("Error adding animal.", "error");
  }
}

async function deleteAnimalRecord(animalId) {
  if (!confirm("Are you sure you want to remove this animal from your herd?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/animals/${animalId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      await fetchAnimals();
      renderAnimalsList();
      showToast("Animal removed.", "info");
    }
  } catch (err) {
    showToast("Error deleting animal.", "error");
  }
}


// ==============================================================================
// VACCINATION & HEALTH REMINDERS
// ==============================================================================
async function fetchReminders() {
  if (!STATE.currentUser) return;
  try {
    const res = await fetch(`${API_BASE}/api/reminders?user_id=${STATE.currentUser.id}`);
    const data = await res.json();
    const tbody = document.getElementById("reminders-table-tbody");
    if (!tbody) return;

    if (!data.reminders || data.reminders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No reminders scheduled. Click "Add New Reminder" above!</td></tr>`;
      return;
    }

    tbody.innerHTML = data.reminders.map(r => `
      <tr>
        <td><strong>${r.due_date}</strong></td>
        <td>${escapeHtml(r.animal_name || 'All Herd')}</td>
        <td><span class="badge badge-outline">${escapeHtml(r.reminder_type)}</span></td>
        <td>
          <strong>${escapeHtml(r.title)}</strong>
          ${r.description ? `<br><small class="text-muted">${escapeHtml(r.description)}</small>` : ''}
        </td>
        <td>
          <span class="badge ${r.is_completed ? 'badge-success' : 'badge-warning'}">
            ${r.is_completed ? 'Completed' : 'Pending'}
          </span>
        </td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="toggleReminderStatus(${r.id}, ${r.is_completed})">
            <i class="fa-solid ${r.is_completed ? 'fa-rotate-left' : 'fa-check'}"></i>
          </button>
          <button class="btn btn-ghost btn-sm text-danger" onclick="deleteReminder(${r.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error fetching reminders:", err);
  }
}

function openAddReminderModal() {
  document.getElementById("add-reminder-modal").style.display = "flex";
}
function closeAddReminderModal() {
  document.getElementById("add-reminder-modal").style.display = "none";
}

async function submitNewReminder(event) {
  event.preventDefault();
  const animalId = document.getElementById("modal-rem-animal").value;
  const payload = {
    user_id: STATE.currentUser.id,
    animal_id: animalId ? parseInt(animalId) : null,
    reminder_type: document.getElementById("modal-rem-type").value,
    title: document.getElementById("modal-rem-title").value.trim(),
    due_date: document.getElementById("modal-rem-date").value,
    description: document.getElementById("modal-rem-desc").value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeAddReminderModal();
      document.getElementById("add-reminder-form").reset();
      fetchReminders();
      refreshOverviewMetrics();
      showToast("Reminder saved successfully!", "success");
    }
  } catch (err) {
    showToast("Error saving reminder.", "error");
  }
}

async function toggleReminderStatus(id, currentStatus) {
  try {
    await fetch(`${API_BASE}/api/reminders`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_completed: !currentStatus })
    });
    fetchReminders();
    refreshOverviewMetrics();
  } catch (err) {}
}

async function deleteReminder(id) {
  try {
    await fetch(`${API_BASE}/api/reminders?id=${id}`, { method: "DELETE" });
    fetchReminders();
    refreshOverviewMetrics();
    showToast("Reminder deleted.", "info");
  } catch (err) {}
}


// ==============================================================================
// VETERINARY ASSISTANCE
// ==============================================================================
async function fetchVets(district = "") {
  try {
    const res = await fetch(`${API_BASE}/api/vets?district=${encodeURIComponent(district)}`);
    const data = await res.json();
    const container = document.getElementById("vets-directory-container");
    if (!container) return;

    container.innerHTML = data.vets.map(v => `
      <div class="vet-card">
        <div class="vet-icon"><i class="fa-solid fa-user-doctor"></i></div>
        <div>
          <h4>${escapeHtml(v.name)}</h4>
          <span class="vet-role">${escapeHtml(v.role)}</span>
          <p class="text-sm text-secondary mb-1"><strong>Facility:</strong> ${escapeHtml(v.clinic)}</p>
          <p class="text-sm text-secondary mb-1"><strong>District:</strong> ${escapeHtml(v.district)} • ${v.distance}</p>
          <p class="text-sm text-secondary mb-2"><strong>Hours:</strong> ${escapeHtml(v.available)}</p>
          <div class="d-flex gap-2">
            <a href="tel:${v.phone}" class="btn btn-outline btn-sm"><i class="fa-solid fa-phone"></i> Call ${v.phone}</a>
            <button class="btn btn-primary btn-sm" onclick="openConsultationModal('${escapeHtml(v.name)}')">
              <i class="fa-solid fa-paper-plane"></i> Request Visit
            </button>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {}
}

function filterVets() {
  const district = document.getElementById("vet-district-filter").value.trim();
  fetchVets(district);
}

function openConsultationModal(vetName = "") {
  document.getElementById("vet-consult-modal").style.display = "flex";
  if (vetName) {
    const vetSelect = document.getElementById("modal-consult-vet");
    if (vetSelect) vetSelect.value = vetName;
  }
}
function closeConsultationModal() {
  document.getElementById("vet-consult-modal").style.display = "none";
}

async function submitVetConsultation(event) {
  event.preventDefault();
  const animalId = document.getElementById("modal-consult-animal").value;
  const payload = {
    user_id: STATE.currentUser.id,
    animal_id: parseInt(animalId),
    vet_name: document.getElementById("modal-consult-vet").value,
    vet_district: STATE.currentUser.district,
    description: document.getElementById("modal-consult-desc").value.trim(),
    preferred_date: document.getElementById("modal-consult-date").value || null
  };

  try {
    const res = await fetch(`${API_BASE}/api/consultations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeConsultationModal();
      document.getElementById("vet-consult-form").reset();
      fetchConsultations();
      showToast(data.message, "success");
    }
  } catch (err) {
    showToast("Error requesting consultation.", "error");
  }
}

async function fetchConsultations() {
  if (!STATE.currentUser) return;
  try {
    const res = await fetch(`${API_BASE}/api/consultations?user_id=${STATE.currentUser.id}`);
    const data = await res.json();
    const tbody = document.getElementById("consultation-history-tbody");
    if (!tbody) return;

    if (!data.consultations || data.consultations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No consultations requested yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.consultations.map(c => `
      <tr>
        <td><strong>${c.created_at.slice(0, 10)}</strong></td>
        <td>${escapeHtml(c.animal_name)}</td>
        <td>${escapeHtml(c.vet_name)}</td>
        <td>${escapeHtml(c.vet_district)}</td>
        <td>${escapeHtml(c.description)}</td>
        <td><span class="badge badge-warning">${escapeHtml(c.status)}</span></td>
      </tr>
    `).join("");
  } catch (err) {}
}


// ==============================================================================
// COMMUNITY DISEASE EARLY WARNING SYSTEM (MAIN INNOVATION)
// ==============================================================================
async function fetchCommunityWarningsIndicator() {
  try {
    const res = await fetch(`${API_BASE}/api/community/warnings`);
    const data = await res.json();
    const indicator = document.getElementById("dash-cluster-alert-indicator");
    const banner = document.getElementById("overview-cluster-banner");
    const count = data.warnings ? data.warnings.length : 0;

    if (count > 0) {
      const topWarning = data.warnings[0];
      indicator.style.display = "flex";
      document.getElementById("cluster-pill-text").textContent = `${count} Village Warning Active`;

      if (banner) {
        banner.style.display = "flex";
        document.getElementById("overview-cluster-title").textContent = `Active Alert in ${topWarning.village} (${topWarning.warning_level})`;
        document.getElementById("overview-cluster-desc").textContent = `${topWarning.report_count} cases detected across ${topWarning.date_range}. Please avoid communal watering ponds.`;
      }
    } else {
      indicator.style.display = "none";
      if (banner) banner.style.display = "none";
    }
  } catch (err) {}
}

async function fetchCommunityData() {
  try {
    const warnRes = await fetch(`${API_BASE}/api/community/warnings`);
    const warnData = await warnRes.json();
    const warnContainer = document.getElementById("community-warnings-container");

    if (warnData.warnings && warnData.warnings.length > 0) {
      warnContainer.innerHTML = warnData.warnings.map(w => {
        let syms = [];
        try { syms = JSON.parse(w.symptoms_detected); } catch (e) { syms = [w.symptoms_detected]; }
        return `
          <div class="village-cluster-box active-cluster mb-3">
            <div class="cluster-header">
              <span class="cluster-village"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(w.village)} Village (${escapeHtml(w.district)} District)</span>
              <span class="badge badge-danger">${escapeHtml(w.warning_level)}</span>
            </div>
            <div class="cluster-body">
              <p class="cluster-text"><strong>${w.report_count} Cases</strong> reported across ${escapeHtml(w.date_range)}.</p>
              <div class="cluster-tags">
                ${syms.map(s => `<span class="mini-tag">${escapeHtml(s)}</span>`).join("")}
              </div>
              <div class="cluster-action-note mb-2">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Automated Early Warning Cluster – Veterinary Investigation Advised</span>
              </div>
              <p class="text-xs text-muted mb-0" style="white-space: pre-line;"><strong>Preventative Actions:</strong>\n${escapeHtml(w.recommended_actions)}</p>
            </div>
          </div>
        `;
      }).join("");
    } else {
      warnContainer.innerHTML = `
        <div class="p-4 bg-white rounded border text-center">
          <i class="fa-solid fa-shield-check fa-3x text-success mb-2"></i>
          <h4>All Villages Normal</h4>
          <p class="text-muted text-sm mb-0">No active disease cluster spikes detected across monitored village clusters.</p>
        </div>
      `;
    }

    const reportsRes = await fetch(`${API_BASE}/api/assessments`);
    const reportsData = await reportsRes.json();
    const tbody = document.getElementById("community-reports-tbody");

    if (reportsData.assessments) {
      tbody.innerHTML = reportsData.assessments.slice(0, 15).map(r => {
        let syms = [];
        try { syms = JSON.parse(r.symptoms); } catch (e) { syms = [r.symptoms]; }
        const badgeClass = r.risk_category === "RED" ? "badge-danger" :
                           r.risk_category === "ORANGE" ? "badge-warning" : "badge-success";
        return `
          <tr>
            <td>${r.created_at.slice(0, 16)}</td>
            <td><strong>Shivapura</strong></td>
            <td>Dharwad</td>
            <td>${escapeHtml(r.animal_type || 'Cattle')}</td>
            <td>${syms.map(s => `<span class="badge badge-outline">${escapeHtml(s)}</span>`).join(" ")}</td>
            <td><span class="badge ${badgeClass}">${r.risk_category}</span></td>
            <td><span class="badge badge-outline"><i class="fa-solid fa-user-secret"></i> Anonymized</span></td>
          </tr>
        `;
      }).join("");
    }

  } catch (err) {}
}

async function triggerClusterScan() {
  showToast("Scanning village cluster patterns...", "info");
  try {
    const res = await fetch(`${API_BASE}/api/community/detect-clusters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const data = await res.json();
    fetchCommunityData();
    fetchCommunityWarningsIndicator();
    showToast(`Pattern scan complete. ${data.clusters_detected.length} active warnings updated.`, "success");
  } catch (err) {
    showToast("Scan failed.", "error");
  }
}

function openSimulateModal() {
  document.getElementById("simulate-modal").style.display = "flex";
}
function closeSimulateModal() {
  document.getElementById("simulate-modal").style.display = "none";
}

async function submitSimulation(event) {
  event.preventDefault();
  const village = document.getElementById("sim-village").value.trim();
  const district = document.getElementById("sim-district").value.trim();
  const pattern = document.getElementById("sim-pattern").value;

  try {
    const res = await fetch(`${API_BASE}/api/community/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ village, district, pattern })
    });
    const data = await res.json();
    if (data.success) {
      closeSimulateModal();
      fetchCommunityData();
      fetchCommunityWarningsIndicator();
      showToast(data.message, "warning");
    }
  } catch (err) {
    showToast("Error simulating outbreak.", "error");
  }
}


// ==============================================================================
// MULTILINGUAL ASSISTANT & FARMER LANGUAGE CONTROLS
// ==============================================================================

const ASSISTANT_LANG_DATA = {
  en: {
    welcome: "Hello Farmer! I am your VETAI Livestock Healthcare Assistant under 'Samriddh Annadata, Samriddh Bharat'. I am exclusively trained to support cattle, buffalo, goat, and sheep health, disease detection (LSD, FMD, Mastitis, Pneumonia), BCS scoring, and veterinary first-aid. How can I assist your animals today?",
    guardrail: "VETAI is trained strictly on livestock health (cattle, buffaloes, goats, sheep), disease detection (LSD, FMD, Mastitis, Pneumonia), thermal imaging, and veterinary advice. All non-livestock queries will be politely declined.",
    placeholder: "Speak or type livestock symptoms in English (e.g. cow has fever, lumps on skin, mastitis)...",
    toast: "Farmer Language set to English 🇬🇧",
    speechLang: "en-IN",
    listenLabel: "Listen",
    prompts: [
      { text: "My cow has high fever, eye discharge, and lumps on skin.", label: "🩺 High fever & lumps (LSD)" },
      { text: "Udder is swollen, hot to touch, and milk yield dropped.", label: "🥛 Swollen udder (Mastitis)" },
      { text: "Buffalo has shallow rapid breathing and persistent cough.", label: "🫁 Heavy breathing & cough" },
      { text: "Cow is limping with mouth blisters and stringy drool.", label: "🦶 Limping & blisters (FMD)" },
      { text: "Animal has swollen left stomach and stopped eating.", label: "🌾 Bloat & low appetite" }
    ]
  },
  hi: {
    welcome: "नमस्ते किसान भाई! मैं VETAI पशु स्वास्थ्य सलाहकार हूँ — 'समृद्ध अन्नदाता, समृद्ध भारत' मिशन के तहत। मैं केवल गाय, भैंस, भेड़ और बकरी के स्वास्थ्य, रोग पहचान (लंपी, खुरपका-मुंहपका, थनैला, निमोनिया), और प्राथमिक उपचार के लिए प्रशिक्षित हूँ। आज आपके मवेशी में क्या लक्षण दिख रहे हैं?",
    guardrail: "VETAI केवल पशु स्वास्थ्य (गाय, भैंस, बकरी, भेड़), रोग पहचान (लंपी, FMD, थनैला, निमोनिया) और पशु चिकित्सा सलाह के लिए प्रशिक्षित है। अन्य सभी गैर-पशु प्रश्नों पर उत्तर नहीं दिया जाएगा।",
    placeholder: "पशु के लक्षण बोलें या लिखें (जैसे गाय को बुखार है, शरीर पर गांठें, थनैला)...",
    toast: "किसान भाषा हिंदी सेट की गई 🇮🇳",
    speechLang: "hi-IN",
    listenLabel: "सुनें",
    prompts: [
      { text: "मेरी गाय को तेज बुखार है और शरीर पर गोल गांठें दिख रही हैं।", label: "🩺 तेज बुखार व गांठें (LSD)" },
      { text: "गाय का थन सूज गया है, बहुत गर्म है और दूध में छीछड़े आ रहे हैं।", label: "🥛 थन में सूजन (थनैला)" },
      { text: "भैंस को तेज सांस लेने की तकलीफ और लगातार खांसी है।", label: "🫁 तेज सांस व खांसी" },
      { text: "मवेशी लंगड़ा रहा है और मुंह से झागदार लार टपक रही है।", label: "🦶 लंगड़ाना व मुंह के छाले (FMD)" },
      { text: "पशु का बायां पेट फूल गया है और उसने जुगाली करना बंद कर दिया है।", label: "🌾 पेट फूलना (अफरा) व भूख न लगना" }
    ]
  },
  kn: {
    welcome: "ನಮಸ್ಕಾರ ರೈತ ಬಂಧುಗಳೇ! ನಾನು 'ಸಮೃದ್ಧ ಅನ್ನದಾತ, ಸಮೃದ್ಧ ಭಾರತ' ಮಿಷನ್ ಅಡಿಯಲ್ಲಿ VETAI ಜಾನುವಾರು ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಾನು ಕೇವಲ ಹಸು, ಎಮ್ಮೆ, ಕುರಿ ಮತ್ತು ಮೇಕೆಗಳ ಆರೋಗ್ಯ, ರೋಗ ತಪಾಸಣೆ (ಚರ್ಮ ಗಂಟು, ಕಾಲುಬಾಯಿ, ಕೆಚ್ಚಲು ಬಾವು, ಶ್ವಾಸಕೋಶದ ಸೋಂಕು) ಮತ್ತು ಪಶುವೈದ್ಯಕೀಯ ಸಲಹೆಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಲು ತರಬೇತಿ ಪಡೆದಿದ್ದೇನೆ. ನಿಮ್ಮ ಜಾನುವಾರಿನಲ್ಲಿ ಯಾವ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ?",
    guardrail: "VETAI ಕೇವಲ ಜಾನುವಾರು ಆರೋಗ್ಯ (ಹಸು, ಎಮ್ಮೆ, ಕುರಿ, ಮೇಕೆ), ರೋಗ ಪತ್ತೆ (LSD, FMD, ಕೆಚ್ಚಲು ಬಾವು) ಮತ್ತು ಪಶು ವೈದ್ಯಕೀಯ ಸೇವೆಗೆ ಮಾತ್ರ ಮೀಸಲಾಗಿದೆ. ಪಶು ಆರೋಗ್ಯವಲ್ಲದ ಇತರ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ವಿನಮ್ರವಾಗಿ ತಿರಸ್ಕರಿಸಲಾಗುವುದು.",
    placeholder: "ಜಾನುವಾರಿನ ಲಕ್ಷಣಗಳನ್ನು ಮಾತನಾಡಿ ಅಥವಾ ಬರೆಯಿರಿ (ಉದಾ: ಹಸುವಿಗೆ ಜ್ವರ, ಚರ್ಮದ ಗಂಟು, ಕೆಚ್ಚಲು ಬಾವು)...",
    toast: "ರೈತರ ಭಾಷೆ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ 🌾",
    speechLang: "kn-IN",
    listenLabel: "ಆಲಿಸಿ",
    prompts: [
      { text: "ನನ್ನ ಹಸುವಿಗೆ 104 ಡಿಗ್ರಿ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಮೈಮೇಲೆ ಗಂಟುಗಳಿವೆ.", label: "🩺 ತೀವ್ರ ಜ್ವರ & ಗಂಟುಗಳು (ಚರ್ಮ ಗಂಟು)" },
      { text: "ಕೆಚ್ಚಲು ವಿಪರೀತ ಊದಿಕೊಂಡಿದೆ ಮತ್ತು ಹಾಲಿನಲ್ಲಿ ಗಂಟುಗಳು ಬರುತ್ತಿವೆ.", label: "🥛 ಕೆಚ್ಚಲು ಬಾವು (Mastitis)" },
      { text: "ಎಮ್ಮೆಗೆ ಉಸಿರಾಟದ ತೊಂದರೆ ಮತ್ತು ಒಣ ಕೆಮ್ಮು ಹೆಚ್ಚಾಗಿದೆ.", label: "🫁 ಉಸಿರಾಟದ ತೊಂದರೆ & ಕೆಮ್ಮು" },
      { text: "ಹಸು ಕುಂಟುತ್ತಿದೆ ಮತ್ತು ಬಾಯಿಯಿಂದ ನಿರಂತರ ಜೊಲ್ಲು ಸುರಿಯುತ್ತಿದೆ.", label: "🦶 ಕುಂಟು & ಬಾಯಿ ಹುಣ್ಣು (ಕಾಲುಬಾಯಿ)" },
      { text: "ಜಾನುವಾರು ಮೇವು ತಿನ್ನುತ್ತಿಲ್ಲ ಮತ್ತು ಹೊಟ್ಟೆ ಉಬ್ಬಿದೆ.", label: "🌾 ಹೊಟ್ಟೆ ಉಬ್ಬರ (Bloat) & ಮೇವು ತಿನ್ನದಿರುವುದು" }
    ]
  }
};

// Response speech cache to avoid HTML escaping issues in onclick
const CHAT_SPEECH_CACHE = {};
let currentUtterance = null;
let currentSpeakingBtn = null;

function setFarmerLanguage(lang) {
  if (!ASSISTANT_LANG_DATA[lang]) lang = "en";
  STATE.currentLanguage = lang;

  // 1. Update pill button active states
  ["en", "hi", "kn"].forEach(l => {
    const btn = document.getElementById(`btn-lang-${l}`);
    if (btn) {
      if (l === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });

  // 2. Synchronize navbar global dropdown
  const globalSelect = document.getElementById("global-lang-select");
  if (globalSelect) globalSelect.value = lang;

  // 3. Update texts & guardrail banner
  const langData = ASSISTANT_LANG_DATA[lang];
  const welcomeElem = document.getElementById("assistant-welcome-msg");
  if (welcomeElem) welcomeElem.textContent = langData.welcome;

  const guardrailElem = document.getElementById("guardrail-desc-text");
  if (guardrailElem) guardrailElem.textContent = langData.guardrail;

  const inputElem = document.getElementById("chat-text-input");
  if (inputElem) inputElem.placeholder = langData.placeholder;

  // 4. Update Quick Prompt Suggestion Chips
  const chipsBar = document.getElementById("prompt-chips-bar");
  if (chipsBar) {
    chipsBar.innerHTML = langData.prompts.map(p => `
      <button type="button" class="chip-btn" onclick="sendQuickPrompt(${JSON.stringify(p.text)})">
        ${p.label}
      </button>
    `).join("");
  }

  showToast(langData.toast, "info");
}

function changeLanguage(lang) {
  setFarmerLanguage(lang);
}

function changeAssistantLang(lang) {
  setFarmerLanguage(lang);
}

function stopCurrentSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  if (currentSpeakingBtn) {
    currentSpeakingBtn.classList.remove("speaking");
    const lang = STATE.currentLanguage || "en";
    const label = ASSISTANT_LANG_DATA[lang] ? ASSISTANT_LANG_DATA[lang].listenLabel : "Listen";
    currentSpeakingBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i> ${label}`;
    currentSpeakingBtn = null;
  }
}

function speakText(textToSpeak, lang, buttonElem) {
  if (!("speechSynthesis" in window)) {
    showToast("Voice playback is not supported in this browser.", "warning");
    return;
  }

  if (currentSpeakingBtn === buttonElem && window.speechSynthesis.speaking) {
    stopCurrentSpeech();
    return;
  }

  stopCurrentSpeech();

  // Strip markdown formatting symbols for clean speech audio
  const cleanText = textToSpeak
    .replace(/\*\*/g, "")
    .replace(/•/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/👉|📞|🚨|🐄|🥛|🫁|🌾|🌡️|🦶|💉|⚠️|•/g, "")
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const langCodeMap = { kn: "kn-IN", hi: "hi-IN", en: "en-IN" };
  utterance.lang = langCodeMap[lang] || "en-IN";
  utterance.rate = 0.95;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(lang) || v.lang.replace('_', '-').startsWith(langCodeMap[lang]));
  if (matchedVoice) utterance.voice = matchedVoice;

  if (buttonElem) {
    currentSpeakingBtn = buttonElem;
    buttonElem.classList.add("speaking");
    buttonElem.innerHTML = `<i class="fa-solid fa-stop"></i> Stop`;
  }

  utterance.onend = () => {
    stopCurrentSpeech();
  };

  utterance.onerror = () => {
    stopCurrentSpeech();
  };

  window.speechSynthesis.speak(utterance);
}

function speakInitialWelcome(btn) {
  const lang = STATE.currentLanguage || "en";
  const welcomeText = ASSISTANT_LANG_DATA[lang].welcome;
  speakText(welcomeText, lang, btn);
}

function speakResponseById(responseId) {
  const item = CHAT_SPEECH_CACHE[responseId];
  if (!item) return;
  const btn = document.getElementById(`btn-read-${responseId}`);
  speakText(item.text, item.lang, btn);
}

function sendQuickPrompt(promptText) {
  const inputElem = document.getElementById("chat-text-input");
  inputElem.value = promptText;
  handleChatSubmit(new Event("submit"));
}

function formatAssistantMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^• (.*$)/gim, "&bull; $1")
    .replace(/\n/g, "<br>");
}

async function handleChatSubmit(event) {
  if (event) event.preventDefault();
  const inputElem = document.getElementById("chat-text-input");
  const query = inputElem.value.trim();
  if (!query) return;

  const messagesBox = document.getElementById("chat-messages-box");
  const currentLang = STATE.currentLanguage || "en";

  // Append Farmer User Message
  messagesBox.innerHTML += `
    <div class="chat-msg user-msg">
      <div class="msg-avatar"><i class="fa-solid fa-user"></i></div>
      <div class="msg-bubble"><p>${escapeHtml(query)}</p></div>
    </div>
  `;
  inputElem.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Append Typing/Thinking Indicator
  const typingId = "typing-" + Date.now();
  messagesBox.innerHTML += `
    <div class="chat-msg assistant-msg" id="${typingId}">
      <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="msg-bubble"><p><i class="fa-solid fa-spinner fa-spin"></i> Consulting VETAI Clinical Engine...</p></div>
    </div>
  `;
  messagesBox.scrollTop = messagesBox.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/api/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query, language: currentLang })
    });
    const data = await res.json();
    const replyText = data.data.response;
    const isInDomain = data.data.is_in_domain;
    const responseId = "resp-" + Date.now();

    // Cache clean response for speech synthesis
    CHAT_SPEECH_CACHE[responseId] = { text: replyText, lang: currentLang };

    const typingElem = document.getElementById(typingId);
    if (typingElem) {
      const bubbleClass = isInDomain ? "msg-bubble" : "msg-bubble refusal-bubble";
      const listenLabel = ASSISTANT_LANG_DATA[currentLang] ? ASSISTANT_LANG_DATA[currentLang].listenLabel : "Listen";
      const formattedHtml = formatAssistantMarkdown(replyText);

      typingElem.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="${bubbleClass}">
          <p>${formattedHtml}</p>
          <button type="button" class="btn-voice-read" id="btn-read-${responseId}" onclick="speakResponseById('${responseId}')" title="Listen to response">
            <i class="fa-solid fa-volume-high"></i> ${listenLabel}
          </button>
          <small class="msg-disclaimer">
            ${isInDomain ? "Guidance only • Not a substitute for a licensed veterinary examination." : "Guardrail Policy • Exclusively trained for livestock healthcare under Samriddh Annadata, Samriddh Bharat."}
          </small>
        </div>
      `;
    }
    messagesBox.scrollTop = messagesBox.scrollHeight;
  } catch (err) {
    const typingElem = document.getElementById(typingId);
    if (typingElem) {
      typingElem.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="msg-bubble"><p class="text-danger">Error retrieving assistance. Please ensure the backend is running and try again.</p></div>
      `;
    }
  }
}

function toggleVoiceRecognition() {
  const micBtn = document.getElementById("voice-mic-btn");
  const inputElem = document.getElementById("chat-text-input");

  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    showToast("Voice recognition not supported in this browser. Please type your query.", "warning");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  const langCodeMap = { kn: "kn-IN", hi: "hi-IN", en: "en-IN" };
  const currentLang = STATE.currentLanguage || "en";
  recognition.lang = langCodeMap[currentLang] || "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  micBtn.classList.add("recording");
  const langName = currentLang === "kn" ? "ಕನ್ನಡದಲ್ಲಿ (Kannada)" : (currentLang === "hi" ? "हिंदी में (Hindi)" : "in English");
  showToast(`Listening ${langName}... Speak symptoms into your microphone.`, "info");

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    inputElem.value = transcript;
    micBtn.classList.remove("recording");
    handleChatSubmit(new Event("submit"));
  };

  recognition.onerror = () => {
    micBtn.classList.remove("recording");
    showToast("Voice recognition stopped.", "info");
  };

  recognition.onend = () => {
    micBtn.classList.remove("recording");
  };

  recognition.start();
}


// ==============================================================================
// UTILITIES
// ==============================================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? "fa-circle-check" :
               type === "error" ? "fa-circle-exclamation" :
               type === "warning" ? "fa-triangle-exclamation" : "fa-circle-info";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
