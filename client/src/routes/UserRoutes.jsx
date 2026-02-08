import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard.jsx';
import { RoleGuard } from '../guards/RoleGuard.jsx';
import { IDGuard } from '../guards/IDGuard.jsx';
import UserDashboard from '../pages/user/UserDashboard';
import Tracking from '../pages/user/Tracking';
import MarriageForm from '../pages/user/MarriageForm';
import BirthForm from '../pages/user/BirthForm';
import TIN from '../pages/user/TIN';
import Settings from '../pages/user/Settings';
import CitizenMessages from '../pages/user/CitizenMessages';
import PaymentResult from '../pages/user/PaymentResult';

function UserRoutes() {
    return (
        <div className="user-routes">
            <Routes>
                {/* ... existing routes ... */}
                <Route
                    path='/user/payment-result'
                    element={
                        <AuthGuard>
                            <PaymentResult />
                        </AuthGuard>
                    }
                />

                <Route
                    path='/user/dashboard'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="citizen">
                                <UserDashboard />
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/user/messages'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="citizen">
                                <CitizenMessages />
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/user/applications'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="citizen">
                                <Tracking /> {/* Removed IDGuard since user can see previous applications even if he doesn't have all id info*/}
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/user/marriage-form'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="citizen">
                                <IDGuard>
                                    <MarriageForm />
                                </IDGuard>
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/user/birth-form'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="citizen">
                                <IDGuard>
                                    <BirthForm />
                                </IDGuard>
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/user/tin-form'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="citizen">
                                <IDGuard>
                                    <TIN />
                                </IDGuard>
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
                <Route
                    path='/user/settings'
                    element={
                        <AuthGuard>
                            <RoleGuard allowedRoles="citizen">
                                <Settings />
                            </RoleGuard>
                        </AuthGuard>
                    }
                />
            </Routes>
        </div>
    )
};


export default UserRoutes;