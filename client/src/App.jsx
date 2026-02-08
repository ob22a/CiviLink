import { BrowserRouter } from "react-router-dom"
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css'
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationsProvider } from "./context/NotificationsContext.jsx";
import { ApplicationProvider } from "./context/ApplicationContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import CommonRoutes from "./routes/CommonRoutes";
import UserRoutes from "./routes/UserRoutes";
import OfficerRoutes from "./routes/OfficerRoutes";
import AdminRoutes from "./routes/AdminRoutes";

import { ProfileAssetsProvider } from './context/ProfileAssetsContext.jsx';
import { PaymentProvider } from './context/PaymentContext.jsx';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const titles = {
  "/": "Home | CiviLink",
  "/login": "Login | CiviLink",
  "/about": "About Us | CiviLink",
  "/help": "Help Center | CiviLink",
  "/contact": "Contact Us | CiviLink",
  "/notifications": "Notifications | CiviLink",
  "/user/dashboard": "Dashboard | CiviLink",
  "/user/applications": "My Applications | CiviLink",
  "/user/messages": "Messages | CiviLink",
  "/user/settings": "Settings | CiviLink",
  "/user/marriage-form": "Marriage Certificate | CiviLink",
  "/user/birth-form": "Birth Certificate | CiviLink",
  "/user/tin-form": "TIN Application | CiviLink",
  "/officer/dashboard": "Officer Dashboard | CiviLink",
  "/officer/applications": "Review Requests | CiviLink",
  "/officer/messages": "Communications | CiviLink",
  "/officer/settings": "Officer Settings | CiviLink",
  "/officer/news": "News Management | CiviLink",
  "/admin/dashboard": "Admin Dashboard | CiviLink",
  "/admin/manage-officers": "Manage Staff | CiviLink",
  "/admin/performance": "Performance | CiviLink",
  "/admin/security-report": "Security Audit | CiviLink",
  "/admin/settings": "Admin Settings | CiviLink",
};

function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const currentTitle = titles[location.pathname] || "CiviLink";
    document.title = currentTitle;
  }, [location]);

  return null; // This component doesn't render anything
}


function App() {

  return (
    <BrowserRouter>
      <TitleManager />
      <AuthProvider>
        <NotificationsProvider>
              <ApplicationProvider>
                <ChatProvider>
                  <div className="App">
                    <CommonRoutes />
                    <ProfileAssetsProvider>
                        <PaymentProvider>
                            <UserRoutes />
                        </PaymentProvider>
                    </ProfileAssetsProvider>
                    <OfficerRoutes />
                    <AdminRoutes />
                  </div>
                </ChatProvider>
              </ApplicationProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
