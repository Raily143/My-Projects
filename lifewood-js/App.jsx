import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';
import ServiceDetail from './pages/ServiceDetail';
import ESG from './pages/ESG';
import GlobalPresence from './pages/GlobalPresence';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import JoinUsNow from './pages/JoinUsNow';
import InternalNews from './pages/InternalNews';
import CookiePolicy from './pages/CookiePolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import AdminPortal from './pages/AdminPortal';
import useSecretAdminTrigger from './hooks/useSecretAdminTrigger';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppLayout = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const isJoinUsFormRoute = pathname === '/create-account';
  useSecretAdminTrigger({ keyword: 'admin rai', redirectTo: '/admin/login' });

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow pt-0 min-w-0">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/esg" element={<ESG />} />
          <Route path="/offices" element={<GlobalPresence />} />
          <Route path="/presence" element={<GlobalPresence />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/create-account" element={<JoinUsNow />} />
          <Route path="/news" element={<InternalNews />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/admin/login" element={<AdminPortal />} />
          <Route path="/admin/forgot-password" element={<AdminPortal />} />
          <Route path="/admin/reset-password" element={<AdminPortal />} />
        </Routes>
      </main>
      {!isAdminRoute && !isJoinUsFormRoute && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
};

export default App;
