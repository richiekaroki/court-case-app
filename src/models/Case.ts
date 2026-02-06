import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../middleware/sequelize.js';

interface CaseAttributes {
    id: number;
    caseNumber: string;
    parties: string;
    title: string;
    citation: string;
    caseAction: string;
    pdfFilePath: string;
    dateDelivered: Date;
    caseClass: string;
    courtId: number;
    courtDivision: string;
    dateCreated: Date;
    dateModified: Date;
}

interface CaseCreationAttributes extends Optional<CaseAttributes, 'id' | 'caseAction' | 'parties' | 'pdfFilePath' | 'caseClass' | 'courtDivision'> { }

class Case extends Model<CaseAttributes, CaseCreationAttributes> implements CaseAttributes {
    public id!: number;
    public caseNumber!: string;
    public parties!: string;
    public title!: string;
    public citation!: string;
    public caseAction!: string;
    public pdfFilePath!: string;
    public dateDelivered!: Date;
    public caseClass!: string;
    public courtId!: number;
    public courtDivision!: string;
    public dateCreated!: Date;
    public dateModified!: Date;

    // constructor(caseNumber: string, parties: string, title: string, citation: string, dateDelivered: Date, dateCreated: Date, dateModified: Date) {
    //     this.caseNumber = caseNumber;
    //     this.parties = parties;
    //     this.title = title;
    //     this.citation = citation;
    //     this.dateDelivered = dateDelivered;
    // }
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Case.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    caseNumber: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'case_number'
    },
    parties: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    citation: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    caseAction: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'case_action'
    },
    pdfFilePath: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'pdf_file_path'
    },
    dateDelivered: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'date_delivered'
    },
    caseClass: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'case_class'
    },
    courtId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'court_id'
    },
    courtDivision: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'court_division'
    },
    dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_created'
    },
    dateModified: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_modified'
    }
}, {
    sequelize,
    modelName: 'Case',
    tableName: 'court_case',
    timestamps: false
});

export default Case;