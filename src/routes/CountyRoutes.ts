import { Router } from "express";
import CountyController from "../controllers/CountyController.js";

const countyRouter: Router = Router();

// Main CRUD routes
countyRouter.get('/', CountyController.getAllCounties);
countyRouter.get('/:id', CountyController.getCountyById);
countyRouter.get('/:id/cases', CountyController.getCountyCases);
countyRouter.post('/', CountyController.createCounty);
countyRouter.put('/:id', CountyController.updateCounty);
countyRouter.delete('/:id', CountyController.deleteCounty);

// Analytics routes
countyRouter.get('/analytics/case-count', CountyController.getCountyCaseCount);

export default countyRouter;