import { Router } from 'express';
import { getLibraryBooks, createLibraryBook, issueLibraryBook, returnLibraryBook, getLibraryFines, getCirculationRecords } from '../controllers/libraryController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/books', authorizeRoles('all'), getLibraryBooks);
router.post('/books', authorizeRoles('librarian', 'admin'), createLibraryBook);
router.get('/circulation', authorizeRoles('all'), getCirculationRecords);
router.post('/circulation/issue', authorizeRoles('librarian', 'admin'), issueLibraryBook);
router.post('/circulation/return', authorizeRoles('librarian', 'admin'), returnLibraryBook);
router.get('/fines', authorizeRoles('all'), getLibraryFines);

export default router;
