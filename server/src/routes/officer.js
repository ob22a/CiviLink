import express from 'express';
import { getApplicationDetails,getOfficerApplications } from '../controllers/officerController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
    '/applications', 
    verifyToken, 
    authorizeRoles('officer'), 
    getOfficerApplications
);

router.get(
    '/applications/:id', 
    verifyToken, 
    authorizeRoles('officer'), 
    getApplicationDetails
);

// The News should be implemented after the schema is ready

export default router;