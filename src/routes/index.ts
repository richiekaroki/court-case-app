import { Router } from "express";
import caseRouter from "./CaseRoutes.js";
import advocateRouter from "./AdvocateRoutes.js";
import judgeRouter from "./JudgeRoutes.js";
import countyRouter from "./CountyRoutes.js";

const router: Router = Router();

// Mount all routes
router.use('/cases', caseRouter);
router.use('/advocates', advocateRouter);
router.use('/judges', judgeRouter);
router.use('/counties', countyRouter);

export default router;