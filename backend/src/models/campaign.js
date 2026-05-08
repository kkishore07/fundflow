const db = require('./index');

// Campaign model wrapper for PostgreSQL
const Campaign = {
  create: (creatorId, title, description, targetAmount, category, imageUrl) => 
    db.createCampaign(creatorId, title, description, targetAmount, category, imageUrl),
  
  findById: (id) => 
    db.getCampaignById(id),
  
  findAll: (status = 'active') => 
    db.getCampaigns(status),
  
  findByIdAndUpdate: (id, data) => 
    db.updateCampaign(id, data),

  // Attach _id field for frontend compatibility
  formatForFrontend: (campaign) => ({
    ...campaign,
    _id: campaign.id,
  }),
};

module.exports = Campaign;
