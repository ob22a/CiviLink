import {Routes,Route} from 'react-router-dom';
import Footer from '../components/Footer';
import Landing from '../pages/common/Landing';
import Navigation1 from '../components/Navigation1';
import About from '../pages/common/About';
import HelpCenter from '../pages/common/HelpCenter';
import Contact from '../pages/common/Contact';
import Login from '../pages/common/Login';
import Notifications from '../pages/common/Notifications';
import OAuthCallback from '../pages/common/OAuthCallback';


function CommonRoutes(){
    return (
        <Routes>
            {/*common pages*/}
            <Route path='/' element={<Landing/>}></Route>
            <Route path='/about' element={<About></About>}></Route>
            <Route path='/help' element={<HelpCenter></HelpCenter>}></Route>
            <Route path='/contact' element={<Contact></Contact>}></Route>
            <Route path='/login' element={<Login></Login>}></Route>
            <Route path='/notifications' element={<Notifications/>}></Route>
            <Route path='/auth/google/callback' element={<OAuthCallback/>}></Route>
        </Routes>
    )
}


export default CommonRoutes
