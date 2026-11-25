import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import CarDetails from './pages/CarDetails';
import Notifications from './pages/Notifications';
import CarModelDetails from './pages/CarModelDetails';
import LuxuryCarDetails from './pages/LuxuryCarDetails';
import LuxuryAdmin from './pages/LuxuryAdmin';
import LuxuryBrand from './pages/LuxuryBrand';
import FAQ from './pages/FAQ';
import { Navigate, useLocation } from 'react-router-dom';
import GetOffers from './pages/GetOffers';
import AutoNews from './pages/AutoNews';
import Advertising from './pages/Advertising';
import AdvertisingInfo from './pages/AdvertisingInfo';
import AllBrands from './pages/AllBrands';
import LuxuryCatalog from './pages/LuxuryCatalog';
import VehicleCatalog from './pages/VehicleCatalog';
import VehicleDetails from './pages/VehicleDetails';
import MotorcycleBrands from './pages/MotorcycleBrands';
import MotorcycleModels from './pages/MotorcycleModels';
import MotorcycleModelDetails from './pages/MotorcycleModelDetails';
import DetailedSearch from './pages/DetailedSearch';
import Referral from './pages/Referral';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Caro from '@/pages/Caro';
import PrivatePricing from '@/pages/PrivatePricing';
import DealershipPricing from '@/pages/DealershipPricing';

const accountPages = new Set(['Dashboard', 'DealerDashboard', 'CreateListing', 'EditListing', 'Messages', 'DealerRegister']);
const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const location = useLocation();
  const returnTo = location.pathname + location.search + location.hash;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).filter(([path]) => !accountPages.has(path) && path !== mainPageKey).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/PrivatePricing" element={<LayoutWrapper currentPageName="PrivatePricing"><PrivatePricing /></LayoutWrapper>} />
      <Route path="/DealershipPricing" element={<LayoutWrapper currentPageName="DealershipPricing"><DealershipPricing /></LayoutWrapper>} />

      <Route path="/CarModelDetails" element={<LayoutWrapper currentPageName="CarModelDetails"><CarModelDetails /></LayoutWrapper>} />
      <Route path="/LuxuryCarDetails" element={<LayoutWrapper currentPageName="LuxuryCarDetails"><LuxuryCarDetails /></LayoutWrapper>} />

      <Route path="/LuxuryBrand" element={<LayoutWrapper currentPageName="LuxuryBrand"><LuxuryBrand /></LayoutWrapper>} />
      <Route path="/LegalHub" element={<Navigate to="/PrivacyPolicy" replace />} />

      <Route path="/Advertising" element={<LayoutWrapper currentPageName="Advertising"><Advertising /></LayoutWrapper>} />
      <Route path="/Advertising/:section" element={<LayoutWrapper currentPageName="AdvertisingInfo"><AdvertisingInfo /></LayoutWrapper>} />
      <Route path="/AutoNews" element={<LayoutWrapper currentPageName="AutoNews"><AutoNews /></LayoutWrapper>} />
      <Route path="/AllBrands" element={<LayoutWrapper currentPageName="AllBrands"><AllBrands /></LayoutWrapper>} />
      <Route path="/FAQ" element={<LayoutWrapper currentPageName="FAQ"><FAQ /></LayoutWrapper>} />
      <Route path="/LuxuryCatalog" element={<LayoutWrapper currentPageName="LuxuryCatalog"><LuxuryCatalog /></LayoutWrapper>} />
      <Route path="/VehicleCatalog" element={<LayoutWrapper currentPageName="VehicleCatalog"><VehicleCatalog /></LayoutWrapper>} />
      <Route path="/VehicleDetails" element={<LayoutWrapper currentPageName="VehicleDetails"><VehicleDetails /></LayoutWrapper>} />
      <Route path="/MotorcycleBrands" element={<LayoutWrapper currentPageName="MotorcycleBrands"><MotorcycleBrands /></LayoutWrapper>} />
      <Route path="/MotorcycleModels" element={<LayoutWrapper currentPageName="MotorcycleModels"><MotorcycleModels /></LayoutWrapper>} />
      <Route path="/MotorcycleModelDetails" element={<LayoutWrapper currentPageName="MotorcycleModelDetails"><MotorcycleModelDetails /></LayoutWrapper>} />
      <Route path="/DetailedSearch" element={<LayoutWrapper currentPageName="DetailedSearch"><DetailedSearch /></LayoutWrapper>} />

      <Route path="/cardetails/:shortId" element={<LayoutWrapper currentPageName="CarDetails"><CarDetails /></LayoutWrapper>} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />} />}>
        {Object.entries(Pages).filter(([path]) => accountPages.has(path)).map(([path, Page]) => (
          <Route key={path} path={`/${path}`} element={<LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>} />
        ))}
        <Route path="/Caro" element={<LayoutWrapper currentPageName="Caro"><Caro /></LayoutWrapper>} />
        <Route path="/x9-admin" element={<AdminPanel />} />
        <Route path="/LuxuryAdmin" element={<LayoutWrapper currentPageName="LuxuryAdmin"><LuxuryAdmin /></LayoutWrapper>} />
        <Route path="/Notifications" element={<LayoutWrapper currentPageName="Notifications"><Notifications /></LayoutWrapper>} />
        <Route path="/GetOffers" element={<LayoutWrapper currentPageName="GetOffers"><GetOffers /></LayoutWrapper>} />
        <Route path="/Referral" element={<LayoutWrapper currentPageName="Referral"><Referral /></LayoutWrapper>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="bottom-right" richColors closeButton />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App