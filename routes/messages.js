import express from 'express';
import {
  createMessage,
  getUserMessages
} from '../controllers/messageController.js';
import { validateMessage } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validateMessage, createMessage);
router.get('/user/:email', getUserMessages);

export default router;