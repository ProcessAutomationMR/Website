import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { CookieConsent } from './components/CookieConsent';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ContactPage } from './pages/ContactPage';
import { AllProjectsPage } from './pages/AllProjectsPage';
import { MentionsLegalesPage } from './pages/MentionsLegalesPage';
import { PolitiqueConfidentialitePage } from './pages/PolitiqueConfidentialitePage';
import { SarlatPage } from './pages/SarlatPage';
import { BordeauxPage } from './pages/BordeauxPage';
import { ArcachonPage } from './pages/ArcachonPage';
import { CapFerretPage } from './pages/CapFerretPage';
import { BergeracPage } from './pages/BergeracPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<AllProjectsPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/product/:projectId" element={<ProductDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/menuisier-sarlat" element={<SarlatPage />} />
            <Route path="/menuisier-bordeaux" element={<BordeauxPage />} />
            <Route path="/menuisier-arcachon" element={<ArcachonPage />} />
            <Route path="/menuisier-cap-ferret" element={<CapFerretPage />} />
            <Route path="/menuisier-bergerac" element={<BergeracPage />} />
            <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialitePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <CookieConsent />
    </BrowserRouter>
  );
}

export default App;
