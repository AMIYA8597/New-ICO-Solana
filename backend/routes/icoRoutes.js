import express from 'express';
import { getIcoInfo, purchaseTokens, distributeTokensToUsers, finishIco, updateIcoParams } from '../controllers/icoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/info', getIcoInfo);
router.post('/buy', protect, purchaseTokens);
router.post('/distribute', protect, admin, distributeTokensToUsers);
router.post('/end', protect, admin, finishIco);
router.put('/update', protect, admin, updateIcoParams);

export default router;