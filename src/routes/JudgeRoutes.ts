import { Router } from "express";
import JudgeController from "../controllers/JudgeController.js";

const judgeRouter: Router = Router();

// Main CRUD routes
judgeRouter.get('/', JudgeController.getAllJudges);
judgeRouter.get('/:id', JudgeController.getJudgeById);
judgeRouter.get('/:id/cases', JudgeController.getJudgeCases);
judgeRouter.post('/', JudgeController.createJudge);
judgeRouter.put('/:id', JudgeController.updateJudge);
judgeRouter.delete('/:id', JudgeController.deleteJudge);

// Analytics routes
judgeRouter.get('/analytics/case-count', JudgeController.getJudgeCaseCount);

export default judgeRouter;