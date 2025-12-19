import { VITAL_TYPES } from "./constants.js";

export const validateVitalType = (type) => {
  return VITAL_TYPES.includes(type);
};
