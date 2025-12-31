import express from 'express';
import {authorizeRoles, canWriteNews} from '../middleware/authMiddleware.js';
import {createNews, deleteNews, editNews, getNews, requestUploadUrl} from '../controllers/news.controller.js';

const router = express.Router();

router.get('/latest', getNews);

router.use(authorizeRoles('officer'))
router.use(canWriteNews)

router.post('/',createNews);
router.post('/upload-url',requestUploadUrl);
router.patch('/:id',editNews);
router.delete('/:id',deleteNews);

export default router;