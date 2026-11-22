/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ArticleDetail from './pages/ArticleDetail';
import CarDetails from './pages/CarDetails';
import Catalog from './pages/Catalog';
import Compare from './pages/Compare';
import CookiePolicy from './pages/CookiePolicy';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import DealerDashboard from './pages/DealerDashboard';
import DealerPricing from './pages/DealerPricing';
import DealerProfile from './pages/DealerProfile';
import DealerRegister from './pages/DealerRegister';
import Dealers from './pages/Dealers';
import EditListing from './pages/EditListing';
import Help from './pages/Help';
import Home from './pages/Home';
import Messages from './pages/Messages';
import AutoNews from './pages/AutoNews';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Rental from './pages/Rental';
import RentalCatalog from './pages/RentalCatalog';
import Terms from './pages/Terms';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ArticleDetail": ArticleDetail,
    "CarDetails": CarDetails,
    "Catalog": Catalog,
    "Compare": Compare,
    "CookiePolicy": CookiePolicy,
    "CreateListing": CreateListing,
    "Dashboard": Dashboard,
    "DealerDashboard": DealerDashboard,
    "DealerPricing": DealerPricing,
    "DealerProfile": DealerProfile,
    "DealerRegister": DealerRegister,
    "Dealers": Dealers,
    "EditListing": EditListing,
    "Help": Help,
    "Home": Home,
    "Messages": Messages,
    "AutoNews": AutoNews,
    "PrivacyPolicy": PrivacyPolicy,
    "Rental": Rental,
    "RentalCatalog": RentalCatalog,
    "Terms": Terms,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};