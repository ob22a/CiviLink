import express from 'express';
import { getApplicationDetails, getOfficerApplications, getOfficerMetrics, getOfficerActivities } from '../controllers/officerController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';
import NewsRoutes from './news.route.js';

const router = express.Router();

router.use(verifyToken)

router.get(
    '/applications',
    authorizeRoles('officer'),
    getOfficerApplications
);

router.get(
    '/metrics',
    authorizeRoles('officer'),
    getOfficerMetrics
);

router.get(
    '/activities',
    authorizeRoles('officer'),
    getOfficerActivities
);

router.get(
    '/applications/:id',
    authorizeRoles('officer'),
    getApplicationDetails
);

router.use('/news', NewsRoutes);

export default router;