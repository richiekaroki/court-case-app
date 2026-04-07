import { Router } from "express";
import AdvocateController from "../controllers/AdvocateController.js";

const advocateRouter: Router = Router();

// Main CRUD routes
advocateRouter.get('/', AdvocateController.getAllAdvocates);
advocateRouter.get('/:id', AdvocateController.getAdvocateById);
advocateRouter.get('/:id/cases', AdvocateController.getAdvocateCases);
advocateRouter.post('/', AdvocateController.createAdvocate);
advocateRouter.put('/:id', AdvocateController.updateAdvocate);
advocateRouter.delete('/:id', AdvocateController.deleteAdvocate);

// Analytics routes
advocateRouter.get('/analytics/case-count', AdvocateController.getAdvocateCaseCount);

export default advocateRouter;