const db = require('./index');

// Donation model wrapper for PostgreSQL
const Donation = {
  create: (donorId, campaignId, amount, message, anonymous = false) => 
    db.createDonation(donorId, campaignId, amount, message, anonymous),
  
  findById: (id) => 
    db.getDonationById(id),
  
  findByCampaignId: (campaignId) => 
    db.getDonationsByCampaign(campaignId),
  
  findByUserId: (userId) => 
    db.getDonationsByUser(userId),
  
  findByIdAndUpdate: (id, data) => 
    db.updateDonation(id, data),

  // Attach _id field for frontend compatibility
  formatForFrontend: (donation) => ({
    ...donation,
    _id: donation.id,
  }),
};

module.exports = Donation;
