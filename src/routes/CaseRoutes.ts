import { Router } from "express";
import CaseController from "../controllers/CaseController.js";

const caseRouter: Router = Router();

caseRouter.get('/caseCountByDate', CaseController.getCaseCountByDate);

export default caseRouter;