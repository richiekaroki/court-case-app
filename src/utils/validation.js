/**
 * Validation middleware for Express routes.
 * 
 * Usage in routes:
 *   caseRouter.get('/lookup', validateCaseLookup, CaseController.lookupCase);
 * 
 * Each validator function receives (req, res, next) and calls next()
 * when validation passes, or sends a 400 error when it fails.
 */

/**
 * Validate case lookup query parameters.
 * At least one of caseNumber, partyName, or court must be provided.
 */
export const validateCaseLookup = (
    req: any,
    res: any,
    next: any
): any => {
    const { caseNumber, partyName, court } = req.query;

    // At least one search parameter required
    if (!caseNumber && !partyName && !court) {
        res.status(400).json({
            success: false,
            error: 'At least one search parameter required: caseNumber, partyName, or court'
        });
        return;
    }

    // Validate caseNumber format if provided
    if (caseNumber) {
        const cd = String(caseNumber).trim();
        if (cd.length < 1 || cd.length > 100) {
            res.status(400).json({
                success: false,
                error: 'caseNumber must be 1-100 characters'
            });
            return;
        }
    }

    // Validate partyName format if provided
    if (partyName) {
        const pn = String(partyName).trim();
        if (pn.length < 1 || pn.length > 100) {
            res.status(400).json({
                success: false,
                error: 'partyName must be 1-100 characters'
            });
            return;
        }
    }

    // Validate court format if provided
    if (court) {
        const ct = String(court).trim();
        if (ct.length < 1 || ct.length > 100) {
            res.status(400).json({
                success: false,
                error: 'court must be 1-100 characters'
            });
            return;
        }
    }

    next();
};

/**
 * Validate case ID parameter (must be positive integer).
 */
export const validateCaseId = (
    req: any,
    res: any,
    next: any
): any => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({
            success: false,
            error: 'Case ID must be a positive integer'
        });
        return;
    }

    next();
};

/**
 * Validate watchlist entry creation body.
 */
export const validateWatchlistEntry = (
    req: any,
    res: any,
    next: any
): any => {
    const { caseId, court, caseNumber, caseType, nextHearingDate } = req.body;

    // Required fields check
    if (caseId === undefined || caseId === null) {
        res.status(400).json({
            success: false,
            error: 'caseId is required'
        });
        return;
    }
    if (!court || court.trim().length === 0) {
        res.status(400).json({
            success: false,
            error: 'court is required'
        });
        return;
    }
    if (!caseNumber || caseNumber.trim().length === 0) {
        res.status(400).json({
            success: false,
            error: 'caseNumber is required'
        });
        return;
    }
    if (!caseType || caseType.trim().length === 0) {
        res.status(400).json({
            success: false,
            error: 'caseType is required'
        });
        return;
    }

    // Optional: validate nextHearingDate format
    if (nextHearingDate !== undefined && nextHearingDate !== null) {
        const d = new Date(nextHearingDate);
        if (isNaN(d.getTime())) {
            res.status(400).json({
                success: false,
                error: 'nextHearingDate must be a valid date'
            });
            return;
        }
    }

    next();
};

/**
 * Validate hearing date update body.
 */
export const validateHearingUpdate = (
    req: any,
    res: any,
    next: any
): any => {
    const { newHearingDate } = req.body;

    if (!newHearingDate) {
        res.status(400).json({
            success: false,
            error: 'newHearingDate is required'
        });
        return;
    }

    const d = new Date(newHearingDate);
    if (isNaN(d.getTime())) {
        res.status(400).json({
            success: false,
            error: 'newHearingDate must be a valid date'
        });
        return;
    }

    next();
};