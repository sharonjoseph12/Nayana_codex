# ![Nayana Banner](./public/banner.png)

<div align="center">

# Nayana (नयन)
### AI-Powered Clinical Vision & Communication Platform

[![Framework](https://img.shields.io/badge/Framework-React%2018-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Build Tool](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Intelligence](https://img.shields.io/badge/AI-MediaPipe%20Vision-007ACC?style=for-the-badge&logo=google)](https://developers.google.com/mediapipe)
[![Connectivity](https://img.shields.io/badge/Real--Time-WebRTC-FF6F00?style=for-the-badge&logo=webrtc)](https://peerjs.com/)

**Empowering clinical communication through gaze intelligence.**

[Overview](#-overview) • [Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [System Architecture](#-system-architecture) • [Getting Started](#-getting-started)

</div>

---

## 👁️ Overview

**Nayana** (meaning "Eye" or "Vision") is a high-fidelity clinical platform designed for patients with limited mobility or speech impairments. By leveraging state-of-the-art **Gaze Tracking AI**, Nayana transforms eye movements into meaningful communication and provides clinicians with a real-time telemetry dashboard for remote monitoring.

### The Problem
Traditional assistive technologies are often prohibitively expensive or require invasive hardware. Patients in ICUs or with neurodegenerative conditions need a seamless, software-first solution to communicate their needs and for caregivers to monitor their vitals remotely.

### The Solution
A zero-hardware-requirement (webcam-only) gaze tracking interface that integrates:
1. **Real-time Gaze Interaction**: UI control via eye focus.
2. **Clinical Dashboard**: Real-time vitals and risk assessment.
3. **Remote Bridge**: Low-latency caretaker monitoring via WebRTC.

---

## ✨ Key Features

### 🎯 Gaze Engineering
- **MediaPipe Integration**: Sub-millimeter precision gaze estimation using neural vision models.
- **Adaptive Reticle**: Smoothed cursor movement with Dead-zone filtering to eliminate jitters.
- **Self-Calibration**: Intelligent calibration sequence to map user-specific facial geometry to screen space.

### 📋 Clinical Intelligence
- **Vitals Sidebar**: Real-time monitoring of HR, SpO2, and respiratory metrics.
- **Risk Assessment**: AI-driven panel identifying clinical risks like dehydration or distress signals.
- **Session Telemetry**: Gaze heatmaps and interaction logs for clinical review.

### 💬 Adaptive Communication
- **Phrase Chips**: Gaze-triggerable common phrases (e.g., "I am thirsty", "In pain").
- **Neural Speech**: High-quality text-to-speech engine for patient verbalization.
- **SOS Protocol**: Immediate alert system with Twilio integration for emergency SMS/calls.

### 🔗 Remote Caretaker Bridge
- **P2P Syncing**: Direct PeerJS connection for remote viewing of patient dashboard.
- **Secure Auth**: 6-digit session codes for verified caretaker access.
- **Real-time Feed**: Instant updates from the patient unit to the caretaker dashboard.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Core** | React 18, Vite |
| **Styling** | Tailwind CSS, Lucide Icons |
| **Gaze AI** | Google MediaPipe Vision (@mediapipe/tasks-vision) |
| **Real-Time** | PeerJS (WebRTC), Twilio API |
| **Analytics** | Custom Telemetry Hooks, html2pdf.js |
| **Deployment** | Vercel |

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Patient App] --> B[Gaze Engine]
    B --> C[MediaPipe Vision Model]
    A --> D[Communications Manager]
    D --> E[Speech Synthesis]
    D --> F[Twilio SOS]
    A --> G[Clinical State Store]
    G --> H[Vitals Feed]
    G --> I[Remote Bridge]
    I --> J[PeerJS Host]
    J <== WebRTC ==> K[Remote Caretaker Login]
    K --> L[Caretaker Dashboard]
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0+
- **NPM** or **Yarn**
- A functional webcam

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sharonjoseph12/Nayana_codex.git
   cd Nayana_codex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root:
   ```env
   VITE_PEER_SERVER=your_peerjs_server (optional)
   VITE_TWILIO_API_KEY=your_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Deployment
Easily deploy to Vercel:
```bash
vercel deploy
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. (Default - update as per your project)

---

<div align="center">
Built with ❤️ for humanity. <br/>
<b>Nayana - The Future of Assistive Vision.</b>
</div>
