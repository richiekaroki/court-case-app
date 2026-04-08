import { Op, Transaction } from "sequelize";
import sequelize from "../middleware/sequelize.js";
import {
  Advocate,
  Case,
  CaseAdvocate,
  CaseHistory,
  CaseJudge,
  County,
  Court,
  Judge,
  Party,
  RelatedCases,
} from "../models/index.js";
import logger from "../utils/logger.js";

// ============================================
// Types & Interfaces
// ============================================

interface ParsedCase {
  caseNumber: string;
  title: string;
  citation: string;
  parties?: string;
  caseAction?: string;
  caseClass?: string;
  courtDivision?: string;
  dateDelivered: Date;
  courtName: string;
  countyName?: string;
  judges: string[];
  advocates: Array<{ name: string; type: "individual" | "company" }>;
  partyList: Array<{ name: string; type: string }>;
  caseHistory?: Array<{
    historyDocketNo: string;
    historyCountyName?: string;
    historyJudgeName?: string;
  }>;
  relatedCases?: string[];
}

interface IngestionOptions {
  skipExisting?: boolean;
  chunkSize?: number;
  maxRetries?: number;
}

interface BatchResult {
  successful: number;
  failed: number;
  errors: Array<{ caseNumber: string; error: string }>;
  duration: number;
}

// ============================================
// Constants
// ============================================

const DEFAULT_CHUNK_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ============================================
// Helper Functions
// ============================================

const normalizeName = (name: string | undefined | null): string => {
  if (!name) return "";
  return name.trim().replace(/\s+/g, " ").normalize("NFC");
};

const normalizeCaseNumber = (caseNumber: string): string => {
  return normalizeName(caseNumber).toUpperCase();
};

const validateCase = (parsedCase: ParsedCase): void => {
  if (!parsedCase.caseNumber) throw new Error("Case number is required");
  if (!parsedCase.title) throw new Error("Case title is required");
  if (!parsedCase.courtName) throw new Error("Court name is required");
  if (!parsedCase.dateDelivered || isNaN(parsedCase.dateDelivered.getTime())) {
    throw new Error("Valid dateDelivered is required");
  }
};

const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
): Promise<T> => {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = RETRY_DELAY_MS * Math.pow(2, i);
        logger.warn(
          `Retry ${i + 1}/${maxRetries} after ${delay}ms: ${lastError.message}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError!;
};

// ============================================
// Resolver Functions
// ============================================

const findOrCreateCounty = async (
  countyName: string,
  transaction: Transaction,
): Promise<County | null> => {
  if (!countyName) return null;
  const normalized = normalizeName(countyName);
  if (!normalized) return null;

  const [county] = await County.findOrCreate({
    where: { county: normalized },
    defaults: {
      county: normalized,
      dateCreated: new Date(),
      dateModified: new Date(),
    },
    transaction,
  });
  return county;
};

const findOrCreateCourt = async (
  courtName: string,
  countyId: number | null | undefined,
  transaction: Transaction,
): Promise<Court> => {
  const normalized = normalizeName(courtName);
  if (!normalized) throw new Error("Court name is required");

  let courtType = "Other";
  const lowerName = normalized.toLowerCase();
  if (lowerName.includes("high court")) courtType = "High Court";
  else if (lowerName.includes("court of appeal")) courtType = "Court of Appeal";
  else if (lowerName.includes("supreme court")) courtType = "Supreme Court";
  else if (lowerName.includes("magistrate")) courtType = "Magistrate Court";

  // Try to find existing court
  let court = await Court.findOne({
    where: { courtName: normalized },
    transaction,
  });

  // DEBUG: Log the raw result
  console.log("🔍 DEBUG - Raw court findOne result:", court);
  console.log("🔍 DEBUG - Court dataValues:", court?.dataValues);

  if (court) {
    console.log("🔍 DEBUG - Found existing court ID:", court.id);
    console.log("🔍 DEBUG - Found existing court ID type:", typeof court.id);
    console.log("🔍 DEBUG - Found existing court courtName:", court.courtName);

    // Ensure the id is properly set
    if (!court.id && court.dataValues?.id) {
      court.id = court.dataValues.id;
    }

    return court;
  }

  // If not found, create new court
  const now = new Date();
  court = await Court.create(
    {
      courtName: normalized,
      type: courtType,
      countyId: countyId || 0,
      dateCreated: now,
      dateModified: now,
    },
    { transaction },
  );

  console.log("🔍 DEBUG - Created new court:", {
    id: court.id,
    courtName: court.courtName,
    type: court.type,
    countyId: court.countyId,
  });

  return court;
};

const findOrCreateJudge = async (
  judgeName: string,
  transaction: Transaction,
): Promise<Judge> => {
  const normalized = normalizeName(judgeName);
  if (!normalized) throw new Error("Judge name is required");

  const [judge] = await Judge.findOrCreate({
    where: { name: normalized },
    defaults: {
      name: normalized,
      dateCreated: new Date(),
      dateModified: new Date(),
    },
    transaction,
  });
  return judge;
};

const findOrCreateAdvocate = async (
  advocateName: string,
  advocateType: "individual" | "company",
  transaction: Transaction,
): Promise<Advocate> => {
  const normalized = normalizeName(advocateName);
  if (!normalized) throw new Error("Advocate name is required");

  const [advocate] = await Advocate.findOrCreate({
    where: { name: normalized },
    defaults: {
      name: normalized,
      type: advocateType,
      dateCreated: new Date(),
      dateModified: new Date(),
    },
    transaction,
  });
  return advocate;
};

// ============================================
// Main Ingestion Function
// ============================================

export const ingestCase = async (
  parsedCase: ParsedCase,
  options: IngestionOptions = {},
): Promise<void> => {
  validateCase(parsedCase);

  const normalizedCaseNumber = normalizeCaseNumber(parsedCase.caseNumber);
  const transaction = await sequelize.transaction();

  try {
    logger.info(`Processing case: ${normalizedCaseNumber}`);

    // 1. Create or find County
    const county = await findOrCreateCounty(
      parsedCase.countyName || "",
      transaction,
    );

    // 2. Create or find Court
    const court = await findOrCreateCourt(
      parsedCase.courtName,
      county?.id,
      transaction,
    );

    console.log("🔍 DEBUG - Final Court object:", {
      id: court.id,
      courtName: court.courtName,
      type: court.type,
      countyId: court.countyId,
    });
    console.log("🔍 DEBUG - Court.id value:", court.id);
    console.log("🔍 DEBUG - Court.id type:", typeof court.id);
    console.log(
      "🔍 DEBUG - Is court a valid Sequelize instance?",
      court instanceof Court,
    );
    console.log("🔍 DEBUG - Court dataValues:", court.dataValues);
    console.log("🔍 DEBUG - Full court object keys:", Object.keys(court));

    // Ensure we have a valid court ID
    const finalCourtId = court.id || court.dataValues?.id;
    console.log("🔍 DEBUG - Final court ID to use:", finalCourtId);

    if (!finalCourtId) {
      throw new Error("Court ID is undefined - cannot create case");
    }

    // 3. Create or find Case (main entity)
    const [courtCase, caseCreated] = await Case.findOrCreate({
      where: { caseNumber: normalizedCaseNumber },
      defaults: {
        caseNumber: normalizedCaseNumber,
        title: parsedCase.title,
        citation: parsedCase.citation,
        parties: parsedCase.parties || undefined,
        caseAction: parsedCase.caseAction || undefined,
        caseClass: parsedCase.caseClass || undefined,
        courtDivision: parsedCase.courtDivision || undefined,
        dateDelivered: parsedCase.dateDelivered,
        courtId: finalCourtId,
        dateCreated: new Date(),
        dateModified: new Date(),
      },
      transaction,
    });

    if (!caseCreated && options.skipExisting !== false) {
      logger.info(`Case ${normalizedCaseNumber} already exists, skipping...`);
      await transaction.commit();
      return;
    }

    logger.info(
      `${caseCreated ? "Created" : "Updated"} case ${normalizedCaseNumber} with ID: ${courtCase.id}`,
    );

    // 4. Link Judges (Parallel)
    if (parsedCase.judges?.length) {
      await Promise.allSettled(
        parsedCase.judges.map(async (judgeName) => {
          try {
            const judge = await findOrCreateJudge(judgeName, transaction);
            await CaseJudge.findOrCreate({
              where: {
                caseId: courtCase.id,
                judgeId: judge.id,
              },
              defaults: {
                caseId: courtCase.id,
                judgeId: judge.id,
              },
              transaction,
            });
          } catch (error: any) {
            logger.error(`Failed to link judge ${judgeName}:`, error.message);
          }
        }),
      );
    }

    // 5. Link Advocates (Parallel)
    if (parsedCase.advocates?.length) {
      await Promise.allSettled(
        parsedCase.advocates.map(async (advocate) => {
          try {
            const advocateRecord = await findOrCreateAdvocate(
              advocate.name,
              advocate.type,
              transaction,
            );
            await CaseAdvocate.findOrCreate({
              where: {
                caseId: courtCase.id,
                advocateId: advocateRecord.id,
              },
              defaults: {
                caseId: courtCase.id,
                advocateId: advocateRecord.id,
              },
              transaction,
            });
          } catch (error: any) {
            logger.error(
              `Failed to link advocate ${advocate.name}:`,
              error.message,
            );
          }
        }),
      );
    }

    // 6. Create Parties
    if (parsedCase.partyList?.length) {
      await Promise.allSettled(
        parsedCase.partyList.map(async (party) => {
          try {
            const existingParty = await Party.findOne({
              where: {
                caseId: courtCase.id,
                name: normalizeName(party.name),
              },
              transaction,
            });

            if (!existingParty) {
              await Party.create(
                {
                  caseId: courtCase.id,
                  name: normalizeName(party.name),
                  type: normalizeName(party.type),
                  dateCreated: new Date(),
                  dateModified: new Date(),
                },
                { transaction },
              );
            }
          } catch (error: any) {
            logger.error(
              `Failed to create party ${party.name}:`,
              error.message,
            );
          }
        }),
      );
    }

    // 7. Create Case History
    if (parsedCase.caseHistory?.length) {
      await Promise.allSettled(
        parsedCase.caseHistory.map(async (history) => {
          try {
            const historyCounty = history.historyCountyName
              ? await findOrCreateCounty(history.historyCountyName, transaction)
              : null;
            const historyJudge = history.historyJudgeName
              ? await findOrCreateJudge(history.historyJudgeName, transaction)
              : null;

            const existingHistory = await CaseHistory.findOne({
              where: {
                caseId: courtCase.id,
                historyDocketNo: history.historyDocketNo,
              },
              transaction,
            });

            if (!existingHistory) {
              const historyData: any = {
                caseId: courtCase.id,
                historyDocketNo: history.historyDocketNo,
                dateCreated: new Date(),
                dateModified: new Date(),
              };

              if (historyCounty?.id) {
                historyData.historyCountyId = historyCounty.id;
              }
              if (historyJudge?.id) {
                historyData.historyJudgeId = historyJudge.id;
              }

              await CaseHistory.create(historyData, { transaction });
            }
          } catch (error: any) {
            logger.error(`Failed to create case history:`, error.message);
          }
        }),
      );
    }

    // 8. Link Related Cases (Batch optimized)
    if (parsedCase.relatedCases?.length) {
      const normalizedRelated = parsedCase.relatedCases
        .map((rc) => normalizeCaseNumber(rc))
        .filter((rc) => rc);

      const existingRelatedCases = await Case.findAll({
        where: { caseNumber: { [Op.in]: normalizedRelated } },
        transaction,
      });

      const relatedCaseMap = new Map(
        existingRelatedCases.map((rc) => [rc.caseNumber, rc.id]),
      );

      await Promise.allSettled(
        parsedCase.relatedCases.map(async (relatedCaseNumber) => {
          const normalized = normalizeCaseNumber(relatedCaseNumber);
          const relatedId = relatedCaseMap.get(normalized);

          if (relatedId) {
            await RelatedCases.findOrCreate({
              where: {
                parentCaseId: courtCase.id,
                childCaseId: relatedId,
              },
              defaults: {
                parentCaseId: courtCase.id,
                childCaseId: relatedId,
              },
              transaction,
            });
          } else {
            logger.warn(
              `Related case ${relatedCaseNumber} not found in database`,
            );
          }
        }),
      );
    }

    await transaction.commit();
    logger.info(`✅ Successfully ingested case: ${normalizedCaseNumber}`);
  } catch (error: any) {
    await transaction.rollback();
    logger.error(
      `❌ Failed to ingest case ${normalizedCaseNumber}:`,
      error.message,
    );
    throw error;
  }
};

// ============================================
// Batch Ingestion with Chunking
// ============================================

export const ingestCaseBatch = async (
  parsedCases: ParsedCase[],
  options: IngestionOptions = {},
): Promise<BatchResult> => {
  const startTime = Date.now();
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const results: BatchResult = {
    successful: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  logger.info(
    `Starting batch ingestion: ${parsedCases.length} cases, chunk size: ${chunkSize}`,
  );

  for (let i = 0; i < parsedCases.length; i += chunkSize) {
    const chunk = parsedCases.slice(i, i + chunkSize);
    const chunkNumber = Math.floor(i / chunkSize) + 1;
    const totalChunks = Math.ceil(parsedCases.length / chunkSize);

    logger.info(
      `Processing chunk ${chunkNumber}/${totalChunks} (${chunk.length} cases)`,
    );

    await Promise.allSettled(
      chunk.map(async (parsedCase) => {
        try {
          await withRetry(() => ingestCase(parsedCase, options));
          results.successful++;
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            caseNumber: parsedCase.caseNumber,
            error: error.message,
          });
        }
      }),
    );

    logger.info(
      `Progress: ${results.successful} successful, ${results.failed} failed`,
    );
  }

  results.duration = Date.now() - startTime;
  logger.info(
    `✅ Batch complete: ${results.successful}/${parsedCases.length} cases in ${results.duration}ms`,
  );

  return results;
};

// ============================================
// Exports for Testing
// ============================================

export const __testables = {
  normalizeName,
  normalizeCaseNumber,
  validateCase,
  withRetry,
};
