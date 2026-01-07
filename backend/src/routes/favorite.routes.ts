import { Router } from 'express';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  mergeFavorites,
  clearFavorites,
} from '../controllers/favorite.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getFavorites);
router.post('/add', addToFavorites);
router.post('/merge', mergeFavorites);
router.delete('/clear', clearFavorites);
router.delete('/:productId', removeFromFavorites);

export default router;
