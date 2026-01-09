import KebeleId from "../models/kebeleIdSchema.js";
import FaydaId from "../models/faydaIdSchema.js";

const checkIdsUploaded = async (req, res, next) => {
  const userId = req.user.id;

  let hasFayda;
  let hasKebele

  const faydaId = FaydaId.findOne({ user: userId})
  const kebeleId = KebeleId.findOne({ user: userId })

  faydaId ? hasFayda = true : hasFayda = false;
  kebeleId ? hasKebele = true : hasKebele = false;

  // const ids = await UploadedID.find({ user: userId });
  // const hasFayda = ids.some((id) => id.type === "fayda");
  // const hasKebele = ids.some((id) => id.type === "kebele");

  if (!hasKebele || !hasFayda) {
    return res.status(400).json({
      success: false,
      message:
        "Both Fayda ID and Kebele ID must be uploaded before proceeding.",
    });
  }

  req.uploadedIds = { kebele: hasKebele, fayda: hasFayda };
  next();
};

export default checkIdsUploaded;
