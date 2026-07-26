# KSP Crime Intelligence Platform (PoC)

> **AI-Powered Crime Intelligence, Investigation Analytics, and Decision Support System**

The **KSP Crime Intelligence Platform** is a modern Proof of Concept (PoC) developed for the **Karnataka State Police (KSP)** to demonstrate how Artificial Intelligence, Data Analytics, and Interactive Visualization can assist investigators in solving cases more efficiently.

The platform combines **Conversational AI**, **Crime Analytics**, **Case Investigation**, **Relationship Graphs**, **Hotspot Mapping**, **Risk Prediction**, and **Supervisor Audit Monitoring** into a single integrated application.

> **⚠ Disclaimer**
>
> This application uses **100% synthetic (fake) data**. All FIRs, accused profiles, victims, locations, financial records, and relationships are artificially generated for demonstration and educational purposes only. No real police records or personal information are included.

---

# Features

## 🔐 Role-Based Authentication

* JWT-based authentication
* Investigator and Supervisor roles
* Role-specific module access
* Secure API authorization

---

## 📊 Crime Analytics Dashboard

Provides a complete overview of crime statistics including:

* Crime distribution
* Area-wise analysis
* Monthly crime trends
* Crime category breakdown
* Interactive visualizations

---

## 🤖 Conversational AI Assistant

Investigators can ask questions in natural language, such as:

* Show all theft cases in Indiranagar.
* Who are the known associates of accused Amit Sharma?
* Display burglary cases from Whitefield.

The AI assistant:

* Understands natural language
* Retrieves relevant crime records
* Generates evidence-grounded responses
* Displays supporting data and relationship graphs

---

## 🕵️ Case360 Investigation

Provides a complete investigation view for every FIR.

Includes:

* FIR information
* Accused profiles
* Victim details
* Investigation timeline
* Evidence records
* Financial links
* Relationship graph
* Audit history

---

## 🌐 Criminal Relationship Graph

Interactive network visualization using Cytoscape.js.

Visualizes relationships between:

* FIRs
* Accused
* Victims
* Locations
* Financial transactions

Users can explore connected entities by selecting graph nodes.

---

## 🗺 Crime Hotspot Mapping

Displays crime locations on an interactive map.

Supports filtering by:

* Crime type
* Date range
* Geographic region

Helps identify crime-prone areas for strategic policing.

---

## 👤 Accused Risk Profiling

Maintains offender profiles with:

* Risk score
* Risk level
* Previous criminal history
* Explainable risk factors

Supports quick search and filtering.

---

## 📈 Bottleneck Analytics

Predictive analytics module for investigation management.

Provides:

* Case pendency prediction
* Investigator workload analysis
* Risk-ranked investigations
* Resource allocation insights

---

## 📋 Audit Trail

Supervisor-exclusive module.

Tracks:

* User activity
* AI conversations
* Executed queries
* Investigation history
* System interactions

Ensures transparency and accountability.

---

# System Architecture

```text
                    KSP Crime Intelligence Platform

                    ┌────────────────────────────┐
                    │     React Frontend         │
                    │ TypeScript • Tailwind CSS  │
                    └──────────────┬─────────────┘
                                   │
                             REST API Calls
                                   │
                    ┌──────────────▼─────────────┐
                    │      Express Backend       │
                    │ Authentication • APIs      │
                    └──────────────┬─────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
       kspData.ts           Gemini Service        Audit Logs
   Synthetic Dataset        AI Processing      Activity Tracking
              │                    │
              └──────────────┬─────┘
                             │
                      JSON Responses
                             │
                     React UI Components
```

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Cytoscape.js
* Leaflet
* Recharts

---

## Backend

* Node.js
* Express.js
* JWT Authentication
* REST APIs

---

## Artificial Intelligence

* Google Gemini API
* Rule-based fallback engine
* Grounded AI responses

---

## Data Layer

* Synthetic in-memory dataset
* JSON-based crime records
* Dynamic analytics generation

---

# Project Structure

```text
ksp-crime-intelligence-platform/
│
├── src/
│   ├── components/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Chat.tsx
│   │   ├── Case360.tsx
│   │   ├── GraphView.tsx
│   │   ├── MapHotspots.tsx
│   │   ├── AccusedList.tsx
│   │   ├── BottleneckAnalytics.tsx
│   │   ├── AuditLog.tsx
│   │   ├── TrendForecast.tsx
│   │   └── DemographicCorrelation.tsx
│   │
│   ├── server/
│   │   ├── kspData.ts
│   │   └── geminiService.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
│
├── server.ts
├── package.json
└── README.md
```

---

# Frontend Modules

| Module                 | Description                         |
| ---------------------- | ----------------------------------- |
| Login                  | JWT-based authentication            |
| Dashboard              | Crime analytics and KPIs            |
| Chat                   | AI-powered investigation assistant  |
| Case360                | Complete investigation dashboard    |
| GraphView              | Criminal relationship visualization |
| MapHotspots            | Geographic crime analysis           |
| AccusedList            | Criminal profiles and risk scoring  |
| BottleneckAnalytics    | Investigation workload prediction   |
| TrendForecast          | Future crime forecasting            |
| DemographicCorrelation | Crime vs demographic analysis       |
| AuditLog               | Supervisor activity monitoring      |

---

# Backend Services

The Express server exposes REST APIs for:

* Authentication
* Dashboard Analytics
* Conversational AI
* Case Investigation
* Crime Hotspots
* Risk Profiling
* Evidence Management
* Crime Forecasting
* Audit Logging

---

# Request Flow

```text
User
   │
   ▼
React Frontend
   │
REST API
   │
Express Server
   │
Business Logic
   │
Synthetic Dataset
   │
Gemini AI
   │
Grounded Response
   │
JSON
   │
Dashboard / Graph / Chat / Tables
```

---

# AI Processing Flow

```text
User Question
      │
      ▼
Chat Module
      │
      ▼
Gemini Service
      │
      ▼
Ground Query
      │
      ▼
Synthetic Dataset
      │
      ▼
Retrieve Relevant Facts
      │
      ▼
Generate Response
      │
      ▼
Answer + Sources + Graph
```

---

# Security

* JWT Authentication
* Role-Based Access Control (RBAC)
* Investigator and Supervisor roles
* Protected REST APIs
* Secure request authorization

---

# Key Highlights

* 🤖 AI-Powered Conversational Investigation
* 📊 Interactive Crime Analytics Dashboard
* 🕵️ 360° Case Investigation View
* 🌐 Criminal Relationship Network Graph
* 🗺 Geographic Crime Hotspot Mapping
* 👤 Explainable Accused Risk Profiling
* 📈 Predictive Investigation Analytics
* 📋 Supervisor Audit Trail
* 🔐 JWT-Based Authentication
* ⚡ Modular Full-Stack Architecture
* 🧪 Synthetic Dataset for Safe Demonstration

---

# Future Enhancements

* PostgreSQL integration for persistent storage
* Neo4j graph database for advanced relationship analysis
* Real-time crime data ingestion
* Speech-to-text and multilingual support
* Mobile application for field investigators
* AI-powered FIR summarization
* Predictive policing models
* Secure cloud deployment
* GIS-based advanced crime heatmaps

---
Add the following **"Getting Started"** section to your README.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

* **Node.js** (v18 or later)
* **npm** (comes with Node.js)

Verify your installation:

```bash
node -v
npm -v
```

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
cd ksp-crime-intelligence-platform
```

Install dependencies:

```bash
npm install
```

---

# Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
Frontend: http://localhost:5173
Backend API: http://localhost:3000
```

> **Note:** The project uses a single Express server with Vite integration, so both the frontend and backend run together during development.

---

# Build for Production

Create an optimized production build:

```bash
npm run build
```

---

# Preview Production Build

```bash
npm run preview
```

---

# Default Login Credentials

## Investigator

```text
Email: investigator@ksp.gov.in
Password: password123
```

### Access

* Dashboard
* Chat Assistant
* Case360
* Hotspot Map
* Accused List
* Analytics

---

## Supervisor

```text
Email: supervisor@ksp.gov.in
Password: password123
```

### Additional Access

* Audit Logs
* User Activity Monitoring
* Investigation Query History

---

# Sample AI Queries

Try these example questions in the AI Chat Assistant:

* Show all theft cases in Indiranagar.
* Display burglary cases from Whitefield.
* Who are the known associates of accused Amit Sharma?
* Show high-risk accused profiles.
* Display crime hotspots for robbery.
* List pending investigations.
* Show financial links related to Case FIR-1025.

---

# Project Workflow

```text
Start Application
        │
        ▼
Login (Investigator / Supervisor)
        │
        ▼
Select a Module
        │
        ├── Dashboard
        ├── Chat Assistant
        ├── Case360
        ├── Graph View
        ├── Hotspot Map
        ├── Analytics
        └── Audit Logs (Supervisor)
        │
        ▼
Backend APIs
        │
        ▼
Synthetic Data + AI Processing
        │
        ▼
Interactive Results
```
orm.


# Conclusion

The **KSP Crime Intelligence Platform** demonstrates how **Artificial Intelligence**, **interactive data visualization**, and **predictive analytics** can enhance crime investigation workflows. Its modular architecture, explainable AI approach, and role-based security make it a strong foundation for future integration with enterprise-scale law enforcement systems while using synthetic data for safe development and demonstration.
