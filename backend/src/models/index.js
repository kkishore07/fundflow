const { query } = require('./sqlStore');

// Helper functions for database operations
const db = {
  // User operations
  async createUser(email, name, password, role = 'user') {
    const result = await query(
      'INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [email, name, password, role]
    );
    return result.rows[0];
  },

  async getUserById(id) {
    const result = await query(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async getUserByEmail(email) {
    const result = await query(
      'SELECT id, email, name, password, role, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async updateUser(id, data) {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at');
    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    
    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING id, email, name, role, updated_at`,
      [...values, id]
    );
    return result.rows[0];
  },

  // Campaign operations
  async createCampaign(creatorId, title, description, targetAmount, category, imageUrl) {
    const result = await query(
      'INSERT INTO campaigns (creator_id, title, description, target_amount, category, image_url, status, start_date) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING id, creator_id, title, description, target_amount, collected_amount, category, image_url, status, created_at',
      [creatorId, title, description, targetAmount, category, imageUrl, 'active']
    );
    return result.rows[0];
  },

  async getCampaignById(id) {
    const result = await query(
      'SELECT id, creator_id, title, description, target_amount, collected_amount, category, image_url, status, start_date, end_date, created_at, updated_at FROM campaigns WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async getCampaigns(status = 'active') {
    const result = await query(
      'SELECT id, creator_id, title, description, target_amount, collected_amount, category, image_url, status, start_date, end_date, created_at FROM campaigns WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  },

  async updateCampaign(id, data) {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'creator_id');
    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    
    const result = await query(
      `UPDATE campaigns SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING id, creator_id, title, description, target_amount, collected_amount, category, image_url, status, created_at, updated_at`,
      [...values, id]
    );
    return result.rows[0];
  },

  // Donation operations
  async createDonation(donorId, campaignId, amount, message, anonymous = false) {
    const result = await query(
      'INSERT INTO donations (donor_id, campaign_id, amount, message, anonymous, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, donor_id, campaign_id, amount, message, anonymous, status, created_at',
      [donorId, campaignId, amount, message, anonymous, 'completed']
    );
    return result.rows[0];
  },

  async getDonationById(id) {
    const result = await query(
      'SELECT id, donor_id, campaign_id, amount, message, anonymous, status, refund_requested, created_at, updated_at FROM donations WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async getDonationsByCampaign(campaignId) {
    const result = await query(
      'SELECT id, donor_id, campaign_id, amount, message, anonymous, status, created_at FROM donations WHERE campaign_id = $1 ORDER BY created_at DESC',
      [campaignId]
    );
    return result.rows;
  },

  async getDonationsByUser(userId) {
    const result = await query(
      'SELECT id, donor_id, campaign_id, amount, message, anonymous, status, created_at FROM donations WHERE donor_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async updateDonation(id, data) {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'donor_id' && k !== 'campaign_id');
    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    
    const result = await query(
      `UPDATE donations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING id, donor_id, campaign_id, amount, status, refund_requested, created_at, updated_at`,
      [...values, id]
    );
    return result.rows[0];
  },
};

module.exports = db;
