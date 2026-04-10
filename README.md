# Patient Care Coordination System

A full-stack clinical workflow management and patient care coordination system designed to help healthcare professionals manage patients, care plans, and daily tasks across different departments.

## Tech Stack

*   **Backend**: Java 17, Spring Boot 3.2.0
    *   Spring Data JPA (Hibernate)
    *   Spring Security (JWT-based Authentication)
    *   Spring WebSocket (Real-time updates)
    *   PostgreSQL Driver
    *   MapStruct & Lombok
*   **Frontend**: React 18
    *   React Router v6 for navigation
    *   Axios for HTTP requests
    *   StompJS / SockJS for WebSockets
    *   Lucide React for iconography
*   **Database**: PostgreSQL 15
*   **Infrastructure**: Docker & Docker Compose

## Features

*   **Role-Based Access Control (RBAC)**: Secure access tailored to different roles (`ADMIN`, `CARE_COORDINATOR`, `DOCTOR`, `NURSE`).
*   **Patient Management**: Track patient records, admission status, and assigned departments/doctors.
*   **Care Plans & Tasks**: Create structured care plans and assign, manage, and complete tasks for specific patients.
*   **Departments**: Organize patients and staff by hospital units (e.g., Emergency, Cardiology, ICU).
*   **Real-time Capabilities**: Built-in websocket support for live notifications.
*   **Audit Logging**: Track important system events and changes.

---

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Docker & Docker Compose](https://docs.docker.com/get-docker/) (Recommended for easy setup)
*   [Java 17](https://adoptium.net/) (If running the backend locally without Docker)
*   [Maven](https://maven.apache.org/) (If running the backend locally without Docker)
*   [Node.js 18+](https://nodejs.org/) (If running the frontend locally without Docker)

---

## 🚀 Getting Started (Using Docker Compose)

The easiest way to run the entire stack (Backend, Frontend, and Database) is using Docker Compose.

1. **Clone the repository** (if you haven't already).
2. **From the root directory, start the services**:
   ```bash
   docker-compose up --build -d
   ```
3. **Access the application**:
   *   **Frontend UI**: `http://localhost:3000`
   *   **Backend API**: `http://localhost:8080/api/...`
   *   **Database**: `localhost:5433` (Username: `patientcare_user`, Password: `patientcare_pass`)
4. **To stop the services**:
   ```bash
   docker-compose down
   ```
   *(Add `-v` to remove database volumes and reset data)*

---

## 🛠 Running Locally (Development Mode)

If you prefer to run the services directly on your host machine for development:

### 1. Start the Database ONLY
```bash
# Start just the postgres database
docker-compose up -d postgres
```

### 2. Run the Backend (Spring Boot)
Open a new terminal and navigate to the `backend/` directory:
```bash
cd backend
mvn spring-boot:run
```
*Note: Make sure your Java version is 17.*

### 3. Run the Frontend (React)
Open a new terminal and navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm start
```
*The frontend will start at `http://localhost:3000` and proxy API requests to `http://localhost:8080`.*

---

## Default Credentials (Seed Data)

The database is automatically seeded with sample data on its first initialization (via `init.sql`). You can use any of the following accounts to log in:

| Role | Username | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` |
| **Care Coordinator** | `coordinator1` | `coord123` |
| **Doctor** | `dr.smith` | `doc123` |
| **Doctor** | `dr.patel` | `doc123` |
| **Nurse** | `nurse.jones` | `nurse123` |

*(Refer to `init.sql` for the full mock dataset including departments and patients).*

---

## Architecture Overview

*   **`/backend`**: A Spring Boot application providing RESTful APIs. It relies on JWTs for stateless authentication. MapStruct is used for converting between Entities and Data Transfer Objects (DTOs). Global exception handling ensures consistent API error responses.
*   **`/frontend`**: A React single-page application (SPA). Uses Context API for global state management (e.g., AuthContext). Components are structured by pages and layouts. All API calls are centralized in a service layer (`frontend/src/services/api.js`).
*   **`docker-compose.yml`**: Defines the deployment architecture mapping the React app, Spring Boot app, and the Postgres database onto internal Docker networks.
