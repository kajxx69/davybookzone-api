import express from 'express';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  incrementPurchaseCount
} from '../controllers/bookController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateBook } from '../middleware/validation.js';
import { uploadBookFiles, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/:id', getBook);
router.post('/:id/purchase', incrementPurchaseCount);

// Routes protégées (Admin seulement)
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadBookFiles,
  handleUploadError,
  validateBook,
  createBook
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadBookFiles,
  handleUploadError,
  validateBook,
  updateBook
);

router.delete('/:id', protect, authorize('admin'), deleteBook);

export default router;