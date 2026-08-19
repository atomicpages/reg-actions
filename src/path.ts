import * as path from "node:path";
import * as constants from "./constants";

export const workspace = () => {
  return path.join("./", constants.WORKSPACE_DIR_NAME);
};
