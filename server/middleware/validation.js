const VALID_DEAL_STAGES = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const VALID_STATUSES = ['Lead', 'Prospect', 'Customer', 'Inactive'];

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required.');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join(' ') });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required.'
    });
  }
  next();
}

function validateContact(req, res, next) {
  const { name, email, phone, status, value } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Contact name is required.');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Contact email must be a valid email format.');
  }

  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (value !== undefined && value !== null && isNaN(Number(value))) {
    errors.push('Value must be a valid number.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join(' ') });
  }

  next();
}

function validateDeal(req, res, next) {
  const { title, value, stage, priority, probability } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Deal title is required.');
  }

  if (value === undefined || value === null || isNaN(Number(value)) || Number(value) < 0) {
    errors.push('Deal value must be a positive number.');
  }

  if (stage && !VALID_DEAL_STAGES.includes(stage)) {
    errors.push(`Stage must be one of: ${VALID_DEAL_STAGES.join(', ')}`);
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (probability !== undefined && probability !== null) {
    const probNum = Number(probability);
    if (isNaN(probNum) || probNum < 0 || probNum > 100) {
      errors.push('Probability must be between 0 and 100.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join(' ') });
  }

  next();
}

module.exports = {
  VALID_DEAL_STAGES,
  VALID_PRIORITIES,
  VALID_STATUSES,
  validateRegister,
  validateLogin,
  validateContact,
  validateDeal
};
