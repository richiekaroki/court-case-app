import { Router } from "express";
import CaseController from "../controllers/CaseController.js";
import WatchlistController from "../controllers/WatchlistController.js";
// @ts-ignore - TypeScript module resolution
import { validateCaseLookup, validateCaseId, validateWatchlistEntry, validateHearingUpdate } from "./utils/validation.js";

const caseRouter: Router = Router();

// Main CRUD routes - with ID validation
caseRouter.get('/', validateCaseId, CaseController.getAllCases);
caseRouter.get('/recent', CaseController.getRecentCases);
caseRouter.get('/:id', validateCaseId, CaseController.getCaseById);
caseRouter.post('/', CaseController.createCase);
caseRouter.put('/:id', validateCaseId, CaseController.updateCase);
caseRouter.delete('/:id', validateCaseId, CaseController.deleteCase);

// Case lookup route - with validation
caseRouter.get('/lookup', validateCaseLookup, CaseController.lookupCase);

// Watchlist routes - with validation
caseRouter.post('/watchlist', validateWatchlistEntry, WatchlistController.addToWatchlist);
caseRouter.delete('/watchlist/:caseId', validateCaseId, WatchlistController.removeFromWatchlist);
caseRouter.get('/watchlist', WatchlistController.getWatchlist);
// @ts-ignore - TypeScript doesn't infer put method on router, but it works at runtime
caseRouter.put('/watchlist/:caseId/hearing', validateCaseId, validateHearingUpdate, WatchlistController.updateHearingDate);

// Analytics routes
caseRouter.get('/analytics/by-date', CaseController.getCaseCountByDate);
caseRouter.get('/analytics/by-year', CaseController.getCaseCountByYear);
caseRouter.get('/analytics/by-court', CaseController.getCaseCountByCourt);

export default caseRouter;