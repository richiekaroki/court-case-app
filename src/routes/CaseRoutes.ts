import { Router } from "express";
import CaseController from "../controllers/CaseController.js";

const caseRouter: Router = Router();

// Main CRUD routes
caseRouter.get('/', CaseController.getAllCases);
caseRouter.get('/recent', CaseController.getRecentCases);
caseRouter.get('/:id', CaseController.getCaseById);
caseRouter.post('/', CaseController.createCase);
caseRouter.put('/:id', CaseController.updateCase);
caseRouter.delete('/:id', CaseController.deleteCase);

// Analytics routes
caseRouter.get('/analytics/by-date', CaseController.getCaseCountByDate);
caseRouter.get('/analytics/by-year', CaseController.getCaseCountByYear);
caseRouter.get('/analytics/by-court', CaseController.getCaseCountByCourt);

export default caseRouter;