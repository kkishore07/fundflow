const express = require("express");
const {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getCampaignsByCreator,
  updateCampaign,
  approveCampaign,
  rejectCampaign,
  deleteCampaign,
  getCreatorAnalytics,
  rateCampaign,
} = require("../controller/campaignController");
const { verifyToken, verifyTokenAndCreator, verifyTokenAndAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllCampaigns);
router.get("/creator/my-campaigns", verifyTokenAndCreator, getCampaignsByCreator);
router.get("/creator/analytics", verifyTokenAndCreator, getCreatorAnalytics);
router.get("/:id", getCampaignById);
router.post("/", verifyTokenAndCreator, upload.single("image"), createCampaign);
router.put("/:id", verifyTokenAndCreator, upload.single("image"), updateCampaign);
router.delete("/:id", verifyTokenAndCreator, deleteCampaign);
router.put("/:id/approve", verifyTokenAndAdmin, approveCampaign);
router.put("/:id/reject", verifyTokenAndAdmin, rejectCampaign);
router.post("/:id/rate", verifyToken, rateCampaign);

module.exports = router;
