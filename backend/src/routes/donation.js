const express = require("express");
const { 
  createDonation, 
  getMyDonations, 
  requestRefund, 
  processRefund, 
  getPendingRefunds,
  getSuspiciousDonations 
} = require("../controller/donationController");
const { verifyToken, verifyTokenAndAdmin } = require("../middleware/authMiddleware");



const router = express.Router();

router.post("/", verifyToken, createDonation);
router.get("/user/my-donations", verifyToken, getMyDonations);
router.post("/refund/request", verifyToken, requestRefund);
router.post("/refund/process", verifyTokenAndAdmin, processRefund);
router.get("/refund/pending", verifyTokenAndAdmin, getPendingRefunds);
router.get("/suspicious", verifyTokenAndAdmin, getSuspiciousDonations);

module.exports = router;
