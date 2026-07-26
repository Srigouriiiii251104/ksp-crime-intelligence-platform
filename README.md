

# KSP Conversational AI & Crime Analytics Platform (PoC)

A premium, state-of-the-art **Proof of Concept (PoC)** platform for **Crime Intelligence Analysis**, built specifically for the **Karnataka State Police (KSP)**. The platform combines conversational AI, relational and graph databases, and interactive analytics to enable investigators to explore crime data using natural language while maintaining strict evidence grounding.

> **⚠ Warning**
>
> This platform uses **entirely synthetic (fake) data**. All FIRs, accused profiles, victim details, locations, and relationships are artificially generated for demonstration purposes. No real names, incidents, or police records are included.

---

# Features

## Conversational Crime Intelligence

* Ask natural language questions about crime data.
* Example queries:

  * *Show all theft cases in Indiranagar in the last 6 months.*
  * *Who are the known associates of accused Amit Sharma?*
* AI converts questions into database queries and returns grounded answers.

---

## Strict Evidence Grounding (Anti-Hallucination)

The platform prevents fabricated responses by following a retrieval pipeline:

1. Convert the user's natural language query into **read-only SQL/Cypher**.
2. Execute the generated query on the database.
3. Retrieve only matching records.
4. Send retrieved facts to the LLM.
5. Generate a response strictly based on retrieved evidence.

No imaginary cases or unsupported facts are generated.

---

## Evidence Panel

Each AI response includes an expandable evidence section displaying:

* Executed SQL query
* Executed Cypher query
* Retrieved database rows
* Graph nodes and relationships used

This provides complete transparency for every answer.

---

## Interactive Crime Network Graph

Built using **Cytoscape.js**.

Visualizes relationships between:

* 🔴 Accused
* 🔵 Victims
* 🟡 FIRs
* 🟢 Locations

Clicking any node displays its associated metadata.

---

## Analytics Dashboard

Interactive crime analytics including:

* Crime distribution
* FIR trends
* Location-wise statistics
* Category breakdowns
* Additional visualizations using Recharts

---

## PDF Audit Report

Generate a structured PDF containing:

* User conversation
* AI responses
* Executed queries
* Grounding evidence

Useful for documentation and audit purposes.

---

## Supervisor Surveillance

Supervisors can monitor:

* User natural language queries
* Generated SQL statements
* Generated Cypher statements
* System activity logs

This feature is available only to supervisor accounts.

---

# Technology Stack

## Backend

* Python
* FastAPI
* SQLAlchemy

---

## Databases

### Relational Database

* PostgreSQL
* SQLAlchemy ORM

### Graph Database

* Neo4j
* Neo4j Python Driver

---

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Cytoscape.js
* Recharts

---

## AI Layer

* Anthropic Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)

---

# Running the Platform

The application supports two deployment modes:

1. Docker Compose (Recommended)
2. Local Hybrid Mode (SQLite + JSON Graph)

---

# Option A: Docker Compose

## Prerequisites

* Docker
* Docker Compose

---

## Configure Environment Variables

Create a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=your_actual_anthropic_api_key
```

> If no API key is provided, the application automatically switches to a rule-based mock query engine.

---

## Launch Services

```bash
docker-compose up -d
```

This starts:

* PostgreSQL
* Neo4j
* FastAPI Backend
* React Frontend

---

## Seed Databases

```bash
docker-compose exec backend python seed.py
```

Seeds approximately:

* 200 FIRs
* 150 Accused
* 150 Victims
* 50 Locations

---

## Access

Frontend

```
http://localhost:5173
```

Backend API

```
http://localhost:8000/docs
```

---

# Option B: Local Hybrid Mode

No PostgreSQL or Neo4j installation required.

The backend automatically uses:

* SQLite
* In-memory JSON Graph Database

---

## Backend Setup

```bash
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Windows

```powershell
.\venv\Scripts\Activate.ps1
```

Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create `.env`

```env
DATABASE_URL=sqlite:///ksp_db.db
ANTHROPIC_API_KEY=your_api_key
```

Seed database

```bash
python seed.py
```

Run server

```bash
uvicorn app.main:app --reload --port 8000
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

# Authentication & RBAC

The platform uses **JWT Authentication** with Role-Based Access Control.

| Role         | Username                                                  | Password    | Permissions                                       |
| ------------ | --------------------------------------------------------- | ----------- | ------------------------------------------------- |
| Investigator | [investigator@ksp.gov.in](mailto:investigator@ksp.gov.in) | password123 | Chat Terminal, Analytics Dashboard                |
| Supervisor   | [supervisor@ksp.gov.in](mailto:supervisor@ksp.gov.in)     | password123 | Chat Terminal, Analytics, Surveillance Audit Logs |

The login page includes autofill buttons for quick role switching.

---

# Project Highlights

* Conversational Crime Intelligence
* Natural Language Query Interface
* SQL & Neo4j Dual Database Architecture
* Explainable AI Responses
* Anti-Hallucination Grounding
* Interactive Crime Relationship Graph
* Analytics Dashboard
* Evidence Inspection Panel
* PDF Audit Report Generation
* JWT Authentication & RBAC
* Supervisor Surveillance Dashboard
* Docker-Based Deployment
* SQLite & JSON Graph Fallback Mode
* Synthetic Dataset for Safe Demonstration

---

# Sample Questions

* Show theft cases in Indiranagar from the last six months.
* List all burglary FIRs linked to Whitefield.
* Who are the known associates of accused Amit Sharma?
* Show all FIRs connected to a specific victim.
* Which locations have the highest number of theft cases?
* Display the relationship network for FIR-1025.
* Summarize crime trends over the last year.
* Find repeat offenders involved in multiple FIRs.

---

# Platform Workflow

```text
User Query
      │
      ▼
Natural Language Processing
      │
      ▼
SQL / Cypher Generation
      │
      ▼
Database Retrieval
(PostgreSQL + Neo4j)
      │
      ▼
Evidence Collection
      │
      ▼
LLM Response Synthesis
      │
      ▼
Grounded Answer + Evidence Panel + Network Graph
```
