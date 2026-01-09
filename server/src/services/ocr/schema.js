export const FAYDA_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    full_name: { type: "string" },
    dob: { type: "string" },
    sex: { type: "string" },
    expiry_date: { type: "string" },
    fan: { type: "string" }
  },
  required: ["full_name", "dob", "sex", "expiry_date", "fan"]
};

export const KEBELE_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    full_name: { type: "string" },
    dob: { type: "string" },
    sex: { type: "string" },
    expiry_date: { type: "string" },
    id_no: { type: "string" }
  },
  required: ["full_name", "dob", "sex", "expiry_date", "id_no"]
};