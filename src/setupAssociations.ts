import { Case, CaseAdvocate, Advocate } from "./models/index.js";

export const setupAssociations = () => {
    Case.hasMany(CaseAdvocate, { foreignKey: 'case_id' });
    CaseAdvocate.belongsTo(Case, { foreignKey: 'case_id' });

    Advocate.hasMany(CaseAdvocate, { foreignKey: 'advocate_id' });
    CaseAdvocate.belongsTo(Advocate, { foreignKey: 'advocate_id' });
}