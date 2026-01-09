import { BrowserRouter } from "react-router-dom"
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css'
import { AuthProvider } from "./auth/AuthContext.jsx";
import { NotificationsProvider } from "./auth/NotificationsContext.jsx";
import { ApplicationProvider } from "./auth/ApplicationContext.jsx";
import { ChatProvider } from "./auth/ChatContext.jsx";
import CommonRoutes from "./routes/CommonRoutes";
import UserRoutes from "./routes/UserRoutes";
import OfficerRoutes from "./routes/OfficerRoutes";
import AdminRoutes from "./routes/AdminRoutes";

import { ProfileAssetsProvider } from './auth/ProfileAssetsContext.jsx';
import { PaymentProvider } from './auth/PaymentContext.jsx';

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <ProfileAssetsProvider>
            <PaymentProvider>
              <ApplicationProvider>
                <ChatProvider>
                  <div className="App">
                    <CommonRoutes />
                    <UserRoutes />
                    <OfficerRoutes />
                    <AdminRoutes />
                  </div>
                </ChatProvider>
              </ApplicationProvider>
            </PaymentProvider>
          </ProfileAssetsProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
