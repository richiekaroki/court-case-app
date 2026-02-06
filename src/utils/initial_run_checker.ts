import InitialRun from "../models/InitialRun.js";

export const initialRunChecker = async (): Promise<boolean> => {
    const initialRunInstance = await InitialRun.findOne();
    if (!initialRunInstance) {
        await InitialRun.create({initialRun: 1});
        return true;
    } else {
        if (initialRunInstance.get('initialRun') === 1) {
            return true;
        } else {
            return false;
        }
    }
};

export const updateInitialRunValue = async () : Promise<boolean> => {
    const initialRunInstance : any = await InitialRun.findOne();
    if (!initialRunInstance) {
        await initialRunInstance.update({initialRun: 0});
        return true;
    } else {
        return false;
    }
}
