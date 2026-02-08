import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard.jsx';
import { RoleGuard } from '../guards/RoleGuard.jsx';
import OfficerDashboard from '../pages/officer/OfficerDashboard';
import ApplicationRequests from '../pages/officer/ApplicationRequests';
import ApplicationDetails from '../pages/officer/ApplicationDetails';
import MessageCenter from '../pages/officer/MessageCenter';
import OfficerSettings from '../pages/officer/OfficerSettings';
import OfficerNewsManagement from '../pages/officer/OfficerNewsManagement';

function OfficerRoutes() {
    return (
        <div className="officer-routes">
            <Routes>
                <Route
                    path='/officer/dashboard'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="officer">
                                <OfficerDashboard />
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/officer/applications'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="officer">
                                <ApplicationRequests />
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/officer/messages'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="officer">
                                <MessageCenter />
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/officer/settings'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="officer">
                                <OfficerSettings />
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/officer/news'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="officer">
                                <OfficerNewsManagement />
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
            </Routes>
        </div>
    );
}

export default OfficerRoutes;