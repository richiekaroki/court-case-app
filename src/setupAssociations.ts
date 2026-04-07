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
} from "./models/index.js";

/**
 * Setup all Sequelize model associations
 * Must be called before any database operations
 */
export const setupAssociations = (): void => {
  // ============================================
  // CASE ASSOCIATIONS
  // ============================================

  // Case <-> Court (Many-to-One)
  Case.belongsTo(Court, { foreignKey: "courtId" });
  Court.hasMany(Case, { foreignKey: "courtId", as: "Cases" });

  // Case <-> Party (One-to-Many)
  Case.hasMany(Party, { foreignKey: "caseId" });
  Party.belongsTo(Case, { foreignKey: "caseId" });

  // ============================================
  // CASE <-> ADVOCATE (Many-to-Many via CaseAdvocate)
  // ============================================

  Case.hasMany(CaseAdvocate, { foreignKey: "caseId" });
  CaseAdvocate.belongsTo(Case, { foreignKey: "caseId" });

  Advocate.hasMany(CaseAdvocate, { foreignKey: "advocateId" });
  CaseAdvocate.belongsTo(Advocate, { foreignKey: "advocateId" });

  // ============================================
  // CASE <-> JUDGE (Many-to-Many via CaseJudge)
  // ============================================

  Case.hasMany(CaseJudge, { foreignKey: "caseId" });
  CaseJudge.belongsTo(Case, { foreignKey: "caseId" });

  Judge.hasMany(CaseJudge, { foreignKey: "judgeId" });
  CaseJudge.belongsTo(Judge, { foreignKey: "judgeId" });

  // ============================================
  // COURT <-> COUNTY (Many-to-One)
  // ============================================

  Court.belongsTo(County, { foreignKey: "countyId" });
  County.hasMany(Court, { foreignKey: "countyId" });

  // ============================================
  // CASE HISTORY ASSOCIATIONS
  // ============================================

  Case.hasMany(CaseHistory, { foreignKey: "caseId" });
  CaseHistory.belongsTo(Case, { foreignKey: "caseId" });

  CaseHistory.belongsTo(Judge, { foreignKey: "historyJudgeId" });
  Judge.hasMany(CaseHistory, { foreignKey: "historyJudgeId" });

  CaseHistory.belongsTo(County, { foreignKey: "historyCountyId" });
  County.hasMany(CaseHistory, { foreignKey: "historyCountyId" });

  // ============================================
  // RELATED CASES (Self-referencing)
  // ============================================

  Case.hasMany(RelatedCases, { foreignKey: "parentCaseId", as: "ChildCases" });
  Case.hasMany(RelatedCases, { foreignKey: "childCaseId", as: "ParentCases" });

  RelatedCases.belongsTo(Case, {
    foreignKey: "parentCaseId",
    as: "ParentCase",
  });
  RelatedCases.belongsTo(Case, { foreignKey: "childCaseId", as: "ChildCase" });

  console.log("✅ All model associations have been set up successfully");
};
