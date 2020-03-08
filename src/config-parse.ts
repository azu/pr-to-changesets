import { createChangesetsOptions } from "./pr-to-changesets";

export const parseConfig = (filePath: string): Partial<createChangesetsOptions> => {
    try {
        return require(filePath);
    } catch (error) {
        console.error(error);
        throw new Error("Can not load config file" + filePath);
    }
};
