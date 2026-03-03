const Campaign = require("../models/campaign");

const createCampaign = async (req, res) => {
  try {
    console.log("Create campaign request received");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("User from token:", req.user);
    
    const { title, description, targetAmount, endDate } = req.body;
    if (!title || !description || !targetAmount || !endDate) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEndDate = new Date(`${endDate}T23:59:59.999Z`);
    if (Number.isNaN(normalizedEndDate.getTime())) {
      return res.status(400).json({ message: "Invalid end date" });
    }

    // Get user details to include name
    const User = require("../models/user");
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log("User not found:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Creating campaign for user:", user.name || user.email);

    const campaignData = {
      title,
      description,
      targetAmount,
      endDate: normalizedEndDate,
      creator: req.user.id,
      creatorName: user.name || user.email,
    };

    // Add image path if file was uploaded
    if (req.file) {
      campaignData.image = req.file.filename;
    }

    const campaign = await Campaign.create(campaignData);

    console.log("Campaign created successfully:", campaign._id);
    res.status(201).json({ message: "Campaign created", campaign });
  } catch (err) {
    console.error("Error creating campaign:", err);
    res.status(400).json({ message: "Failed to create campaign", error: err.message });
  }
};

const getAllCampaigns = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    // Exclude campaigns that ended before today (campaigns ending today remain visible)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    filter.endDate = { $gte: todayStart };

    // Sort by average rating (highest first), then by creation date
    const campaigns = await Campaign.find(filter)
      .sort({ averageRating: -1, createdAt: -1 });
    
    res.status(200).json({ campaigns });
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch campaigns", error: err.message });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    
    // Check if campaign has expired
    if (new Date() > campaign.endDate) {
      return res.status(400).json({ message: "This campaign has expired" });
    }
    
    res.status(200).json({ campaign });
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch campaign", error: err.message });
  }
};

const getCampaignsByCreator = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creator: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ campaigns });
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch campaigns", error: err.message });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    if (campaign.creator.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    if (campaign.status !== "pending" && campaign.status !== "approved") return res.status(400).json({ message: "Can only edit pending or approved campaigns" });

    // Update basic fields
    campaign.title = req.body.title || campaign.title;
    campaign.description = req.body.description || campaign.description;
    campaign.targetAmount = req.body.targetAmount || campaign.targetAmount;
    if (req.body.endDate) {
      const normalizedEndDate = new Date(`${req.body.endDate}T23:59:59.999Z`);
      if (Number.isNaN(normalizedEndDate.getTime())) {
        return res.status(400).json({ message: "Invalid end date" });
      }
      campaign.endDate = normalizedEndDate;
    }

    // Update image if new file was uploaded
    if (req.file) {
      campaign.image = req.file.filename;
    }

    await campaign.save();
    res.status(200).json({ message: "Campaign updated", campaign });
  } catch (err) {
    res.status(400).json({ message: "Failed to update campaign", error: err.message });
  }
};

const approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    if (campaign.status !== "pending") return res.status(400).json({ message: "Only pending campaigns can be approved" });

    campaign.status = "approved";
    await campaign.save();
    res.status(200).json({ message: "Campaign approved", campaign });
  } catch (err) {
    res.status(400).json({ message: "Failed to approve campaign", error: err.message });
  }
};

const rejectCampaign = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) return res.status(400).json({ message: "Rejection reason required" });

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    if (campaign.status !== "pending") return res.status(400).json({ message: "Only pending campaigns can be rejected" });

    campaign.status = "rejected";
    campaign.rejectionReason = rejectionReason;
    await campaign.save();
    res.status(200).json({ message: "Campaign rejected", campaign });
  } catch (err) {
    res.status(400).json({ message: "Failed to reject campaign", error: err.message });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    if (campaign.creator.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    if (campaign.status !== "pending") return res.status(400).json({ message: "Can only delete pending campaigns" });

    await Campaign.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Campaign deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete campaign", error: err.message });
  }
};

const getCreatorAnalytics = async (req, res) => {
  try {
    const Donation = require("../models/donation");
    
    // Get all campaigns by creator
    const campaigns = await Campaign.find({ creator: req.user.id });
    
    // Calculate analytics
    const totalCampaigns = campaigns.length;
    const approvedCampaigns = campaigns.filter(c => c.status === "approved").length;
    const pendingCampaigns = campaigns.filter(c => c.status === "pending").length;
    const rejectedCampaigns = campaigns.filter(c => c.status === "rejected").length;
    
    const totalRaised = campaigns.reduce((sum, c) => sum + c.currentAmount, 0);
    const totalTarget = campaigns.reduce((sum, c) => sum + c.targetAmount, 0);
    const averageProgress = totalTarget > 0 ? ((totalRaised / totalTarget) * 100).toFixed(1) : 0;
    
    // Get total donations count
    const campaignIds = campaigns.map(c => c._id);
    const totalDonations = await Donation.countDocuments({ campaign: { $in: campaignIds } });
    
    // Get top performing campaigns with donation counts
    const topCampaigns = await Promise.all(
      campaigns
        .filter(c => c.status === "approved")
        .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))
        .slice(0, 5)
        .map(async (campaign) => {
          const donationCount = await Donation.countDocuments({ campaign: campaign._id });
          return {
            _id: campaign._id,
            title: campaign.title,
            targetAmount: campaign.targetAmount,
            currentAmount: campaign.currentAmount,
            donationCount
          };
        })
    );
    
    res.status(200).json({
      totalCampaigns,
      approvedCampaigns,
      pendingCampaigns,
      rejectedCampaigns,
      totalRaised,
      totalTarget,
      totalDonations,
      averageProgress: parseFloat(averageProgress),
      topCampaigns
    });
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch analytics", error: err.message });
  }
};

const rateCampaign = async (req, res) => {
  try {
    const { rating } = req.body;
    const campaignId = req.params.id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status !== "approved") {
      return res.status(400).json({ message: "Can only rate approved campaigns" });
    }

    // Check if campaign creator trying to rate their own campaign
    if (campaign.creator.toString() === req.user.id) {
      return res.status(403).json({ message: "Cannot rate your own campaign" });
    }

    // Check if user has donated to this campaign
    const Donation = require("../models/donation");
    const hasDonated = await Donation.findOne({
      campaign: campaignId,
      donor: req.user.id
    });

    if (!hasDonated) {
      return res.status(403).json({ message: "Only donors can rate campaigns. Please donate first." });
    }

    // Check if user already rated this campaign
    const existingRating = campaign.ratings.find(r => r.user.toString() === req.user.id);
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.createdAt = Date.now();
    } else {
      // Add new rating
      campaign.ratings.push({
        user: req.user.id,
        rating: rating,
        createdAt: Date.now()
      });
      campaign.totalRatings += 1;
    }

    // Recalculate average rating
    const totalScore = campaign.ratings.reduce((sum, r) => sum + r.rating, 0);
    campaign.averageRating = totalScore / campaign.ratings.length;

    await campaign.save();

    res.status(200).json({ 
      message: "Rating submitted successfully",
      averageRating: campaign.averageRating,
      totalRatings: campaign.totalRatings
    });
  } catch (err) {
    console.error("Error rating campaign:", err);
    res.status(400).json({ message: "Failed to rate campaign", error: err.message });
  }
};

module.exports = {
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
};
