import{Routes,Route}from'react-router-dom';
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
           <Route path='/admin/dashboard' element={<AdminDashboard></AdminDashboard>}></Route>
          <Route path='/admin/manage-officers' element={<ManageOfficers></ManageOfficers>}></Route>
          <Route path='/admin/performance' element={<PerformanceMonitoring></PerformanceMonitoring>}></Route>
          <Route path='/admin/security-report' element={<SecurityReport></SecurityReport>}></Route>
            <Route path='/admin/settings' element={<AdminSettings></AdminSettings>}></Route>
        </Routes>
        </div>
        </>
    );
}

export default AdminRoutes;