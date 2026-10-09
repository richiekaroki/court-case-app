import { Request, Response } from "express";
import { WatchlistEntry, HearingHistory, User, Case } from "../models/index.js";

/**
 * Update a case's hearing date and create history entry
 */
const updateHearingDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { caseId } = req.params;
        const { newHearingDate } = req.body;

        if (!newHearingDate) {
            res.status(400).json({ 
                success: false,
                error: 'New hearing date is required' 
            });
            return;
        }

        // Find the watchlist entry
        const entry = await WatchlistEntry.findOne({
            where: { userId: (req as any).user?.id, caseId },
        });

        if (!entry) {
            res.status(404).json({ 
                success: false,
                error: 'Case not in your watchlist' 
            });
            return;
        }

        // Check if the hearing date is actually changing
        const oldHearingDate = entry.nextHearingDate;
        if (oldHearingDate && oldHearingDate.toISOString() === new Date(newHearingDate).toISOString()) {
            res.status(400).json({ 
                success: false,
                error: 'Hearing date is the same as the current date' 
            });
            return;
        }

        // Create history entry before updating
        await HearingHistory.create({
            watchlistEntryId: entry.id,
            oldHearingDate: oldHearingDate ? new Date(oldHearingDate) : undefined,
            newHearingDate: new Date(newHearingDate),
            outcome: entry.outcome, // Keep existing outcome or null
            changedAt: new Date(),
        });

        // Update the hearing date
        await entry.update({ nextHearingDate: new Date(newHearingDate) });

        res.json({
            success: true,
            data: entry,
            message: 'Hearing date updated and history recorded'
        });
    } catch (err: any) {
        console.error('Error in updateHearingDate:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update hearing date', 
            message: err.message 
        });
    }
};

/**
 * Add a case to user's watchlist
 */
const addToWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { caseId, court, caseNumber, caseType, nextHearingDate } = req.body;

        if (!caseId || !court || !caseNumber || !caseType || !nextHearingDate) {
            res.status(400).json({ 
                success: false,
                error: 'Case ID, court, case number, case type, and next hearing date are required' 
            });
            return;
        }

        // Validate that the case exists
        const existingCase = await Case.findByPk(caseId);
        if (!existingCase) {
            res.status(404).json({ 
                success: false,
                error: 'Case not found' 
            });
            return;
        }

        // Check if case is already in user's watchlist
        const existingEntry = await WatchlistEntry.findOne({
            where: {
                userId: (req as any).user?.id,
                caseId,
            },
        });

        if (existingEntry) {
            // Case already in watchlist
            res.status(200).json({
                success: true,
                data: existingEntry,
                message: 'Case is already in your watchlist'
            });
        } else {
            // Create new entry
            const newEntry = await WatchlistEntry.create({
                userId: (req as any).user?.id,
                caseId,
                court,
                caseNumber,
                caseType,
                nextHearingDate: new Date(nextHearingDate),
            });

            res.status(201).json({
                success: true,
                data: newEntry,
                message: 'Case added to watchlist successfully'
            });
        }
    } catch (err: any) {
        console.error('Error in addToWatchlist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to add case to watchlist', 
            message: err.message 
        });
    }
};

/**
 * Remove a case from user's watchlist
 */
const removeFromWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { caseId } = req.params;

        const deleted = await WatchlistEntry.destroy({
            where: {
                userId: (req as any).user?.id,
                caseId,
            },
        });

        if (deleted === 0) {
            res.status(404).json({ 
                success: false,
                error: 'Case not in your watchlist' 
            });
            return;
        }

        res.status(204).send();
    } catch (err: any) {
        console.error('Error in removeFromWatchlist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to remove case from watchlist', 
            message: err.message 
        });
    }
};

/**
 * Get user's watchlist
 */
const getWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const watchlist = await WatchlistEntry.findAll({
            where: { userId: (req as any).user?.id },
            include: [
                {
                    model: Case,
                    attributes: ['caseNumber', 'title', 'courtId', 'dateDelivered']
                }
            ],
            order: [['nextHearingDate', 'ASC']]
        });

        res.json({
            success: true,
            data: watchlist
        });
    } catch (err: any) {
        console.error('Error in getWatchlist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch watchlist', 
            message: err.message 
        });
    }
};

export default {
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist
};