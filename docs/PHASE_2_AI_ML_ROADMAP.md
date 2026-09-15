# Phase 2 — AI & Machine Learning Integration Roadmap (TODO)

This document outlines the planned AI/ML modules and intelligence layers scheduled for implementation in **Phase 2** of the CampusOne ERP system.

---

## 🎯 Architecture Overview for AI Services

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite SPA                     │
│    (Widgets: RAG Chatbot, Face Recog Camera, Charts)   │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       REST API │               FastAPI  │ Direct ML / Inference
         :3000  │                :8000   │
                ▼                        ▼
┌────────────────────────┐      ┌────────────────────────┐
│  Node.js / Express     │◄────►│  Python AI Microservice│
│  Prisma ORM            │      │  (FastAPI + ML Models) │
└───────────┬────────────┘      └───────────┬────────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
                ┌────────────────────────┐
                │     PostgreSQL 16      │
                │  (+ pgvector extension)│
                └────────────────────────┘
```

---

## 📋 Planned AI/ML Modules

### 1. 🎓 Student Academic Risk & Dropout Prediction
- **Target Module:** Admin Analytics (`/analytics/performance`) & Faculty Dashboard (`/faculty/classes`)
- **Objective:** Provide an Early Warning System (EWS) to detect students who are at risk of poor academic standing or dropping out before end-semester examinations.
- **Workflow & Input Features:**
  - Historical attendance percentages (overall & subject-wise)
  - Mid-term & continuous internal evaluation (CIE) test scores
  - Assignment submission timeliness and completion rates
  - Fee payment delay records & library circulation engagement
- **ML Algorithm & Approach:** Supervised Classification (Random Forest, XGBoost Classifier, Logistic Regression baseline) and Regression for SGPA forecasting.
- **Tech Stack:** Python, Scikit-Learn, XGBoost, Pandas, FastAPI microservice.

---

### 2. 🤖 CampusOne AI Assistant (RAG Chatbot for Students & Faculty)
- **Target Module:** Global Floating AI Widget on all user dashboards.
- **Objective:** Provide an intelligent, context-aware conversational assistant that delivers real-time information from university documents and live ERP records.
- **Workflow & Capabilities:**
  - Natural Language Queries: *"What is my current attendance in DBMS?"*, *"When is the deadline for Odd Semester fees?"*, *"Summarize the campus leave policy."*
  - Retrieval-Augmented Generation (RAG) over university notices, circulars, syllabi, and academic handbooks.
  - Role-based contextual responses based on the authenticated user's session JWT and database state.
- **ML & NLP Approach:** Dense Vector Embeddings + RAG pipeline.
- **Tech Stack:** Google Gemini API / OpenAI API, LangChain / LlamaIndex, PostgreSQL `pgvector` extension for vector search.

---

### 3. 📸 Smart Facial Recognition Attendance System
- **Target Module:** Faculty Attendance Portal (`/faculty/attendance`)
- **Objective:** Replace manual roll calls with automated, computer-vision-based attendance logging using camera feeds or classroom group photos.
- **Workflow & Capabilities:**
  - Faculty captures or uploads an in-class photo / camera feed.
  - Multi-face detection locates and crops all student faces.
  - Generates 128-d or 512-d facial embedding vectors and compares with enrolled student biometric templates using Cosine Similarity.
  - Automatically updates the `AttendanceRecord` table in PostgreSQL.
- **ML & CV Approach:** Deep Metric Learning for Face Verification / Recognition.
- **Tech Stack:** OpenCV, FaceNet / dlib / DeepFace, Python, NumPy.

---

### 4. 📅 Smart Automated Timetable Generator (Constraint Optimization)
- **Target Module:** Admin Timetable Management (`/admin/timetable`)
- **Objective:** Automatically construct conflict-free weekly timetables across departments, semesters, and sections.
- **Constraints Handled:**
  - **Hard Constraints:** No faculty double-booking, no classroom double-booking, lab sessions paired with appropriate lab rooms, credit hours per course respected.
  - **Soft Constraints:** Balanced daily faculty load, minimizing student idle gaps between lectures, morning vs. afternoon distribution.
- **ML & Optimization Approach:** Constraint Satisfaction Problem (CSP) / Genetic Algorithms (GA).
- **Tech Stack:** Google OR-Tools (CP-SAT Solver) / Python DEAP (Distributed Evolutionary Algorithms).

---

### 5. 💼 Placement & Skill Readiness Recommender
- **Target Module:** Student Career & Placement Analytics (`/analytics/placement`)
- **Objective:** Assess student industry readiness, analyze resume keyword alignment, and recommend elective courses and career domains.
- **Workflow & Capabilities:**
  - Resume Parsing: Extracts projects, tech stack, certifications, and academic scores.
  - Skill Gap Analysis: Compares extracted student skills against historical job placement requirements and company profiles.
  - Generates tailored recommendations for electives and skill certifications.
- **ML & NLP Approach:** Semantic Similarity, Sentence Transformers, TF-IDF + Cosine Matching, Multi-label Classification.
- **Tech Stack:** Python, spaCy, HuggingFace Sentence Transformers, Scikit-Learn.

---

## 🛠️ Phase 2 Technical Milestones

- [ ] **Milestone 2.1:** Setup Python `ai-service/` workspace container in `docker-compose.yml` with FastAPI.
- [ ] **Milestone 2.2:** Enable `pgvector` in PostgreSQL Docker container and configure Prisma schema vector columns.
- [ ] **Milestone 2.3:** Implement RAG Chatbot with Google Gemini API & university notice ingestion.
- [ ] **Milestone 2.4:** Build and train Student Risk Prediction model using synthetic/historical academic data.
- [ ] **Milestone 2.5:** Prototype Face Recognition attendance endpoint and integrate with the frontend webcam module.
- [ ] **Milestone 2.6:** Integrate Google OR-Tools scheduler for Automated Timetable generation.
- [ ] **Milestone 2.7:** Build Resume Analyzer and Placement Recommender widget on student portal.
