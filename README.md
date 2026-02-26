# 🏥 Hospital Appointment Scheduler

A full-stack MERN application that efficiently schedules doctor appointments using a **fair allocation algorithm** — always assigning the doctor with the fewest current bookings.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | `https://hospital-scheduler-frontend.onrender.com` |
| Backend  | `https://hospital-scheduler-api.onrender.com`      |

---

## Features

| Requirement | Status |
|-------------|--------|
| Add Doctor (name, specialization, max patients) | ✅ |
| View All Doctors (search, filter, sort) | ✅ |
| Book Appointment by specialization | ✅ |
| Smart Allocation – doctor with fewest bookings | ✅ |
| Reject booking when all doctors full | ✅ |
| Output Display Panel | ✅ |
| Daily appointment auto-reset (cron + manual) | ✅ |
| Input validation (frontend + backend) | ✅ |
| Error handling | ✅ |
| Responsive UI | ✅ |
| CI/CD via GitHub Actions → Render | ✅ |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, react-hot-toast
- **Backend**: Node.js, Express.js, Mongoose (MongoDB)
- **Database**: MongoDB Atlas
- **Deployment**: Render (Web Services + Static Site)
- **CI/CD**: GitHub Actions

---

## Data Model

### Doctor
| Field | Type | Description |
|-------|------|-------------|
| `doctorId` | String | Unique ID (auto-generated or custom) |
| `name` | String | Doctor's full name |
| `specialization` | String | Medical specialization |
| `maxDailyPatients` | Number | Maximum patients per day (1–100) |
| `currentAppointments` | Number | Current booking count (auto-reset daily) |
| `isAvailable` | Virtual | `true` if slots remain |
| `slotsRemaining` | Virtual | `maxDailyPatients - currentAppointments` |

### Appointment
| Field | Description |
|-------|-------------|
| `patientName` | Patient name |
| `specialization` | Requested specialization |
| `doctorId` / `doctorName` | Assigned doctor (null if rejected) |
| `status` | `"booked"` or `"rejected"` |
| `rejectionReason` | Reason when rejected |

---

## Booking Algorithm – `BookAppointment(specialization)`

```
1. Find all ACTIVE doctors with the requested specialization
2. If none found → REJECT (no such specialization)
3. Run daily-reset check on each doctor
4. Filter doctors where currentAppointments < maxDailyPatients
5. If none available → REJECT (all fully booked)
6. Sort remaining by currentAppointments ASC (fewest first)
7. Atomically increment chosen doctor's currentAppointments
8. Create & return appointment record → BOOKED ✅
```

---

## API Reference

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/doctors` | List all doctors (supports `?specialization=`, `?available=true`) |
| `GET` | `/api/doctors/specializations` | List unique specializations |
| `GET` | `/api/doctors/:id` | Get doctor by ID |
| `POST` | `/api/doctors` | Add a new doctor |
| `DELETE` | `/api/doctors/:id` | Soft-delete a doctor |
| `POST` | `/api/doctors/reset/daily` | Reset all appointment counts |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/appointments/book` | Book appointment `{ patientName, specialization }` |
| `GET` | `/api/appointments` | List appointments (supports `?status=`, `?limit=`) |
| `GET` | `/api/appointments/stats` | Booking stats (today + total) |

### Health
| Method | Endpoint |
|--------|----------|
| `GET` | `/health` |

---

## Local Development

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd hospital-scheduler
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your MONGODB_URI
npm install
npm run dev        # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL= (leave empty to use Vite proxy)
npm install
npm run dev        # http://localhost:5173
```

---

## Deployment on Render

### Option A – Render Blueprint (Recommended)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**
3. Connect your GitHub repo
4. Render reads `render.yaml` and creates both services automatically
5. Set environment variables in the dashboard:
   - **Backend**: `MONGODB_URI`, `FRONTEND_URL`
   - **Frontend**: `VITE_API_URL` (your backend URL)

### Option B – Manual Services

**Backend (Web Service)**:
- Runtime: Node
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`

**Frontend (Static Site)**:
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

### CI/CD via GitHub Actions

The workflow at `.github/workflows/deploy.yml` runs on every push to `main`:

1. Checks backend syntax
2. Builds frontend
3. Triggers Render deploy hooks

**Required GitHub Secrets**:
| Secret | Description |
|--------|-------------|
| `RENDER_BACKEND_DEPLOY_HOOK` | Render deploy hook URL for backend service |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Render deploy hook URL for frontend service |
| `VITE_API_URL` | Backend URL (used during CI build) |

Get deploy hooks from Render: Service → Settings → Deploy Hook → Copy URL

---

## Project Structure

```
hospital-scheduler/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── doctorController.js   # Doctor CRUD logic
│   │   └── appointmentController.js # Booking algorithm
│   ├── middleware/errorHandler.js
│   ├── models/
│   │   ├── Doctor.js             # Doctor schema + virtuals
│   │   └── Appointment.js        # Appointment schema
│   ├── routes/
│   │   ├── doctors.js
│   │   └── appointments.js
│   ├── server.js                 # Express app + cron job
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── AddDoctorForm.jsx
│   │   │   ├── DoctorList.jsx
│   │   │   ├── DoctorCard.jsx
│   │   │   ├── BookAppointment.jsx
│   │   │   └── OutputPanel.jsx
│   │   ├── services/api.js       # Axios API layer
│   │   ├── App.jsx
│   │   └── index.css             # Tailwind + custom utilities
│   ├── vite.config.js
│   └── .env.example
├── .github/workflows/deploy.yml  # CI/CD pipeline
├── render.yaml                   # Render Blueprint
└── README.md
```
