const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    console.error('[VALIDATION ERROR]:', error.errors);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors
    });
  }
};

const ideaSchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(10),
  expectations: z.string().trim().optional(),
  status: z.enum(['draft', 'open', 'in_review', 'in_progress', 'published', 'patent']).optional(),
  visibility: z.enum(['private', 'marketplace', 'shared']).optional(),
  sharedWith: z.array(z.string()).optional(),
});

const cmvcQuerySchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(10),
});

const collabRequestSchema = z.object({
  ideaId: z.string().min(1),
  answer: z.string().trim().min(5),
});

const collabStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

const projectInitSchema = z.object({
  ideaId: z.string().min(1),
});

const taskSchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().optional(),
  assignedTo: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
});

const taskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']),
});

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
});

module.exports = {
  validate,
  ideaSchema,
  cmvcQuerySchema,
  collabRequestSchema,
  collabStatusSchema,
  projectInitSchema,
  taskSchema,
  taskStatusSchema,
  sendOtpSchema,
  verifyOtpSchema,
};
