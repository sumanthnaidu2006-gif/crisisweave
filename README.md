# ⚡ CrisisWeave — AI Disaster Anticipation & Response Platform

> **Anticipate · Analyze · Respond**  
> An intelligent multi-agent crisis response system combining a **human-first citizen mobile application** with a **10-agent tactical emergency command center**.

---

## 🏗️ Architecture & How Frontend and Backend Combine

CrisisWeave combines two powerful layers into a single full-stack platform:

```
+-------------------------------------------------------------------------+
|                           CRISISWEAVE PLATFORM                           |
|                                                                         |
|  +------------------------------+     +-------------------------------+ |
|  |     CITIZEN MOBILE APP       |     |   TACTICAL COMMAND CENTER     | |
|  |  (Field View / Normal Human) | <-> |  (10-Agent Swarm Analytics)  | |
|  |  - 1-Tap Giant SOS           |     |  - Multi-variable Simulation  | |
|  |  - Live GPS & 29°C Weather   |     |  - Cascade Prediction Chart   | |
|  |  - Street Walking (OSRM)     |     |  - Action Priority Engine     | |
|  |  - 3-Min Dead-Man's Timer    |     |  - Resource & Bed Tracker     | |
|  |  - Real Battery & Signal     |     |  - Historical Scenarios       | |
|  +------------------------------+     +-------------------------------+ |
|                 ^                                     ^                 |
|                 +------------------+------------------+                 |
|                                    | (JSON REST & WebSocket)            |
|                                    v                                    |
|  +--------------------------------------------------------------------+ |
|  |                      SPRING BOOT 3.2 BACKEND                       | |
|  |                                                                    | |
|  |   [PRISM Coordinator]                                              | |
|  |         |                                                          | |
|  |         +--> 1. Meteorological Agent   6. Utilities Agent          | |
|  |         +--> 2. Hydrology Agent        7. Logistics Agent          | |
|  |         +--> 3. Radiation Agent        8. International Agent      | |
|  |         +--> 4. CBRN / Chemical Agent  9. Early Warning Agent      | |
|  |         +--> 5. Healthcare Surge Agent 10. Evacuation Agent        | |
|  +--------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
```

---

## 🚀 How to Run the Combined Platform

You have **two easy ways** to run:

### Option 1: Standalone Unified Server (Single Port 8080) ⭐ Recommended
The React frontend is compiled and packaged directly inside the Spring Boot JAR file. One single server serves everything:
* **Double-click:** [`run-unified-jar.bat`](file:///c:/Users/Sumanth%20Naidu/OneDrive/Desktop/HAckthon/run-unified-jar.bat)
* **Access URL:** [`http://localhost:8080`](http://localhost:8080)
  * Serves the complete React UI (Combined Dual-View, Mobile App, Command Center)
  * Serves all REST APIs at `/api/*`
  * Zero separate Node/Vite processes needed!

### Option 2: Live Development Mode (Vite + Spring Boot with Hot Reload)
* **Double-click:** [`start.bat`](file:///c:/Users/Sumanth%20Naidu/OneDrive/Desktop/HAckthon/start.bat)
* **Frontend:** [`http://localhost:5173`](http://localhost:5173) (Vite Dev Server)
* **Backend:** [`http://localhost:8080`](http://localhost:8080) (Spring Boot)

---

## 🛠️ How to Rebuild After Code Changes
To re-compile the frontend and bundle it into the standalone JAR:
* **Double-click:** [`build-unified.bat`](file:///c:/Users/Sumanth%20Naidu/OneDrive/Desktop/HAckthon/build-unified.bat)

---

## 📡 REST API Endpoints (Spring Boot)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health and count of active domain agents |
| `GET` | `/api/agents` | List of all 10 specialized domain agents |
| `GET` | `/api/scenarios` | List historical disaster templates (Bhopal, Chernobyl, Nepal) |
| `GET` | `/api/scenarios/{id}` | Detailed historical scenario with cascade timeline |
| `POST` | `/api/simulate` | Run multi-agent simulation for incident (GPS coordinates, severity, radius) |
| `GET` | `/api/disaster-types` | Available disaster hazard types and descriptions |
| `WS` | `/ws` | WebSocket endpoint for real-time agent updates |
