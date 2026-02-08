import{Routes,Route}from'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard.jsx';
import { RoleGuard } from '../guards/RoleGuard.jsx';
import AdminDashboard from'../pages/admin/AdminDashboard';
import ManageOfficers from '../pages/admin/ManageOfficers';
import PerformanceMonitoring from '../pages/admin/PerformanceMonitoring';
import SecurityReport from '../pages/admin/SecurityReport';
import AdminSettings from '../pages/admin/AdminSettings';
function AdminRoutes(){
    return(
        <>
        <div className="admin-routes">
        <Routes>
           <Route path='/admin/dashboard' element={<AuthGuard><RoleGuard allowedRoles="admin"><AdminDashboard /></RoleGuard></AuthGuard>}></Route>
          <Route path='/admin/manage-officers' element={<AuthGuard><RoleGuard allowedRoles="admin"><ManageOfficers /></RoleGuard></AuthGuard>}></Route>
          <Route path='/admin/performance' element={<AuthGuard><RoleGuard allowedRoles="admin"><PerformanceMonitoring /></RoleGuard></AuthGuard>}></Route>
          <Route path='/admin/security-report' element={<AuthGuard><RoleGuard allowedRoles="admin"><SecurityReport /></RoleGuard></AuthGuard>}></Route>
            <Route path='/admin/settings' element={<AuthGuard><RoleGuard allowedRoles="admin"><AdminSettings /></RoleGuard></AuthGuard>}></Route>
        </Routes>
        </div>
        </>
    );
}

export default AdminRoutes;