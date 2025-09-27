import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminPanel from '../components/AdminPanel';
import AdminLogin from '../components/AdminLogin';
import { adminAuth } from '../lib/adminAuth';
import { adminDB } from '../lib/adminDatabase';
import { toast } from 'sonner';

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customProducts, setCustomProducts] = useState({});
  const [brandColors, setBrandColors] = useState({
    brandA: '#0B6A6D',
    brandB: '#22C55E'
  });

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = adminAuth.checkSession();
      setIsAuthenticated(isAuth);
      setIsLoading(false);

      if (isAuth) {
        await loadData();
      }
    };

    checkAuth();
  }, []);

  const loadData = async () => {
    try {
      // Load brand settings from database
      const brandSettings = await adminDB.getBrandSettings();
      if (brandSettings) {
        setBrandColors({
          brandA: brandSettings.brand_a_color,
          brandB: brandSettings.brand_b_color
        });
      }

      // Load products from database
      const products = await adminDB.getProducts();
      const productsObj = {};
      products.forEach(product => {
        productsObj[product.id] = product;
      });
      setCustomProducts(productsObj);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    }
  };
  // Apply brand colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    const hexToHsl = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    
    root.style.setProperty('--brandA', hexToHsl(brandColors.brandA));
    root.style.setProperty('--brandB', hexToHsl(brandColors.brandB));
  }, [brandColors]);

  const handleCustomProductsChange = async (products) => {
    setCustomProducts(products);
    // Products are now managed through the database
  };

  const handleBrandColorsChange = async (colors) => {
    setBrandColors(colors);
    
    try {
      await adminDB.updateBrandSettings({
        brand_a_color: colors.brandA,
        brand_b_color: colors.brandB
      });
    } catch (error) {
      console.error('Error updating brand colors:', error);
      toast.error('Erro ao atualizar cores da marca');
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    loadData();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-gradient flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Voltar ao Site</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Admin - VitaFit</h1>
        </div>
      </header>

      {/* Admin Panel Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <AdminPanel
            isOpen={true}
            onClose={() => navigate('/')} // Navigate to home when closing
            brandColors={brandColors}
            onBrandColorsChange={handleBrandColorsChange}
            customProducts={customProducts}
            onCustomProductsChange={handleCustomProductsChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;