import { Router } from 'express';
import { emailController } from '../controllers/email.controller';

const router = Router();

// Search emails
router.get('/search', emailController.searchEmails.bind(emailController));

// Get email by ID
router.get('/:id', emailController.getEmailById.bind(emailController));

// Update email category
router.patch('/:id/category', emailController.updateEmailCategory.bind(emailController));

// Generate suggested reply
router.post('/:id/reply', emailController.generateReply.bind(emailController));

// Get connection status
router.get('/status/connections', emailController.getConnectionStatus.bind(emailController));

// Get statistics
router.get('/stats/overview', emailController.getStats.bind(emailController));

// Add custom context for RAG
router.post('/context/add', emailController.addContext.bind(emailController));

export default router;
