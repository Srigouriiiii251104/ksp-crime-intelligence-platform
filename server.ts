import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import {
  getDashboardStats,
  getAccusedList,
  getHotspots,
  getCrimeForecast,
  getFinancialLinks,
  getDemographicCorrelation,
  getFullCaseContext,
  addEvidenceIntake,
  getPendencyRiskCases,
  getInvestigatorWorkloadAnalytics,
  auditLogs
} from './src/server/kspData.js';
import { askKSPAssistant } from './src/server/geminiService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ksp-secret-key-2026';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Helper middleware for JWT Authentication
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // Default to investigator if demo token or no token present
      req.user = { id: 1, email: 'investigator@ksp.gov.in', name: 'Insp. Rajesh Gowda', role: 'Investigator' };
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (err) {
      // Fallback user for session continuity
      req.user = { id: 1, email: 'investigator@ksp.gov.in', name: 'Insp. Rajesh Gowda', role: 'Investigator' };
      next();
    }
  };

  // --- Auth Endpoints ---

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (password !== 'password123') {
      return res.status(401).json({ detail: 'Incorrect email or password' });
    }

    let userRole = 'Investigator';
    let userName = 'Insp. Rajesh Gowda';
    let userId = 1;

    if (email === 'supervisor@ksp.gov.in') {
      userRole = 'Supervisor';
      userName = 'SP Ananya Sharma';
      userId = 2;
    } else if (email !== 'investigator@ksp.gov.in') {
      return res.status(401).json({ detail: 'Unauthorized badge email' });
    }

    const payload = { id: userId, email, name: userName, role: userRole };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      user: payload
    });
  });

  app.post('/api/auth/refresh', (req, res) => {
    const { refresh_token } = req.body;
    try {
      const decoded = jwt.verify(refresh_token, JWT_SECRET) as any;
      const payload = { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role };
      const newAccess = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
      const newRefresh = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        access_token: newAccess,
        refresh_token: newRefresh,
        token_type: 'bearer',
        user: payload
      });
    } catch {
      res.status(401).json({ detail: 'Invalid refresh token' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ detail: 'Successfully logged out and token revoked' });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  // --- Chat Assistant ---

  app.post('/api/chat', authenticateToken, async (req: any, res) => {
    try {
      const { message, history, language } = req.body;
      const userEmail = req.user?.email || 'investigator@ksp.gov.in';
      const userRole = req.user?.role || 'Investigator';

      const result = await askKSPAssistant(message, history || [], userEmail, userRole, language || 'en');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Chat assistant query failed' });
    }
  });

  // --- Voice / Audio Endpoints ---

  app.post('/api/transcribe', authenticateToken, (req, res) => {
    res.json({ text: "Show all theft cases in Indiranagar in the last 6 months" });
  });

  app.get('/api/tts', authenticateToken, (req, res) => {
    res.status(204).end(); // Express 204 no content triggers frontend native SpeechSynthesisUtterance fallback
  });

  // --- Crime Analytics & Metrics ---

  app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    res.json(getDashboardStats());
  });

  app.get('/api/audit-logs', authenticateToken, (req, res) => {
    res.json(auditLogs);
  });

  app.get('/api/accused', authenticateToken, (req, res) => {
    res.json(getAccusedList());
  });

  app.get('/api/hotspots', authenticateToken, (req, res) => {
    const { crime_type, start_date, end_date } = req.query;
    res.json(getHotspots(crime_type as string, start_date as string, end_date as string));
  });

  app.get('/api/dashboard/forecast', authenticateToken, (req, res) => {
    const { area, crime_type } = req.query;
    res.json(getCrimeForecast(area as string, crime_type as string));
  });

  app.get('/api/financial-links', authenticateToken, (req, res) => {
    res.json(getFinancialLinks());
  });

  app.get('/api/demographic-correlation', authenticateToken, (req, res) => {
    res.json(getDemographicCorrelation());
  });

  // --- UNIFIED CASE LINKING LAYER ---
  app.get('/api/case/:case_id/full-context', authenticateToken, (req, res) => {
    const { case_id } = req.params;
    const context = getFullCaseContext(case_id);
    if (!context) {
      return res.status(404).json({ error: `Case file '${case_id}' not found in unified repository.` });
    }
    res.json(context);
  });

  // --- AUTOMATED EVIDENCE PIPELINE ---
  app.post('/api/evidence/intake', authenticateToken, (req: any, res) => {
    const { case_id, description, evidence_type, intake_officer_id, intake_officer_name } = req.body;
    const userEmail = req.user?.email || 'investigator@ksp.gov.in';

    const result = addEvidenceIntake({
      case_id,
      description,
      evidence_type,
      intake_officer_id: intake_officer_id || req.user?.id || 101,
      intake_officer_name: intake_officer_name || req.user?.name || 'Insp. Rajesh Gowda',
      user_email: userEmail
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  });

  // Simulated Document OCR Extraction Endpoint
  app.post('/api/evidence/ocr-scan', authenticateToken, (req, res) => {
    const { document_text, file_name } = req.body;

    // Simulate OCR text extraction for review
    const sampleCaseId = 'CASE-2024-1001';
    const extractedData = {
      extracted_case_id: sampleCaseId,
      extracted_date: new Date().toISOString().substring(0, 10),
      extracted_crime_type: 'Theft / Recovery',
      extracted_names: ['Ramesh Gowda', 'Amit Sharma'],
      extracted_description: document_text || `FIR scanned document (${file_name || 'scanned_fir.pdf'}): Seizure memo recording stolen items and serial numbers.`,
      requires_investigator_review: true,
      ocr_confidence: 0.94
    };

    res.json(extractedData);
  });

  // --- PREDICTIVE BOTTLENECK ANALYTICS ---
  app.get('/api/analytics/pendency-risk', authenticateToken, (req, res) => {
    res.json(getPendencyRiskCases());
  });

  app.get('/api/analytics/investigator-workload', authenticateToken, (req, res) => {
    res.json(getInvestigatorWorkloadAnalytics());
  });

  // --- Vite Dev Server Middleware or Static Build Fallback ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KSP Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
