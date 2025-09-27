import React, { useState, useCallback, useEffect } from 'react';
import { X, MapPin, Phone, ChevronDown, Minus, Plus, ExternalLink, MessageCircle, Settings, Upload, Download, RotateCcw } from 'lucide-react';
import heroBackground from '../assets/hero-background-with-logo.jpg';
import AdminPanel from '../components/AdminPanel';
import venvanse50mg from '../assets/venvanse-50mg.png';
import ritalina10mg from '../assets/ritalina-10mg.png';
import cytotec200mcg from '../assets/cytotec-200mcg.png';
import { WppLink } from '../components/WppLink';

// Vial with leaf SVG icon component
const VialLeafIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#064E4F" 
    strokeWidth="2" 
    className={className}
  >
    <path d="M19 7L17 12H7L5 7"/>
    <path d="M3 7h18"/>
    <circle cx="8" cy="17" r="1"/>
    <circle cx="16" cy="17" r="1"/>
    <path d="M12 3v3M12 9l-2 2h4l-2-2"/>
    <path d="M16 7c0-2-1-4-4-4s-4 2-4 4"/>
  </svg>
);

// Product data with new "Outros" category
const DEFAULT_PRODUCTS = {
  tg: {
    id: 'tg',
    category: 'TG',
    name: 'TG — Tirzepatida',
    subtitle: 'Mais econômico',
    description: [
      '💰 Preços competitivos direto do Paraguai',
      '🚚 Entrega regional (PR, SC, RS, Grande SP)',
      '📱 Atendimento rápido via WhatsApp'
    ],
    doses: [
      { value: '5mg', label: '5 mg', price: 1442, image: 'https://i.ibb.co/tTDjz73v/image.png' },
      { value: '10mg', label: '10 mg', price: 1946, image: 'https://http2.mlstatic.com/D_NQ_NP_987475-MLB86452352029_062025-O.webp' },
      { value: '10mg-canetas', label: '10 mg (canetas)', price: 2618, image: 'https://http2.mlstatic.com/D_NQ_NP_987475-MLB86452352029_062025-O.webp', unavailable: true },
      { value: '12.5mg', label: '12,5 mg', price: 2114, image: 'https://atacadopods.com/wp-content/uploads/2025/09/T.G-TIRZEPATIDE-125-MG-05ML.webp' },
      { value: '15mg', label: '15 mg', price: 2618, image: 'https://http2.mlstatic.com/D_NQ_NP_614492-MLB87856316390_072025-O.webp' }
    ],
    forma: '4 ampolas',
    requiresPrescription: false
  },
  lipoless: {
    id: 'lipoless',
    category: 'Lipoless',
    name: 'Lipoless — Tirzepatida',
    subtitle: 'Premium',
    description: [
      '⭐ Qualidade premium e confiabilidade',
      '💉 Opções em ampolas e canetas',
      '📱 Atendimento especializado via WhatsApp'
    ],
    doses: [
      { value: '5mg', label: '5 mg', price: 1582, image: 'https://http2.mlstatic.com/D_NQ_NP_814025-MLB87238774933_072025-O.webp' },
      { value: '7.5mg', label: '7,5 mg', price: 1890, image: 'https://http2.mlstatic.com/D_NQ_NP_612104-MLB86230067185_062025-O.webp' },
      { value: '10mg', label: '10 mg', price: 2086, image: 'https://http2.mlstatic.com/D_NQ_NP_869082-MLB84324990331_052025-O.webp' },
      { value: '12.5mg', label: '12,5 mg', price: 2254, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8vG8mJ-iO1hCZAmZXMnXcA5IrVovYoAlZ3Q&s' },
      { value: '15mg', label: '15 mg', price: 2758, image: 'https://http2.mlstatic.com/D_NQ_NP_783579-MLB87009976071_062025-O.webp' }
    ],
    formaOptions: [
      { value: 'ampola', label: '4 ampolas + seringa', priceAdd: 0 },
      { value: 'caneta', label: 'Caneta (+ R$ 400)', priceAdd: 400 }
    ],
    requiresPrescription: false
  },
  venvanse: {
    id: 'venvanse',
    category: 'Outros',
    name: 'Venvanse — lisdexanfetamina',
    subtitle: 'Sob prescrição',
    description: [
      '📋 Venda somente com receita',
      '📱 Atendimento via WhatsApp',
      '📦 Envio sob disponibilidade'
    ],
    doses: [
      { value: '30mg', label: '30 mg', price: 0, image: venvanse50mg },
      { value: '50mg', label: '50 mg', price: 0, image: venvanse50mg },
      { value: '70mg', label: '70 mg', price: 0, image: venvanse50mg }
    ],
    requiresPrescription: true
  },
  ritalina: {
    id: 'ritalina',
    category: 'Outros',
    name: 'Ritalina — metilfenidato',
    subtitle: 'Sob prescrição',
    description: [
      '📋 Venda somente com receita',
      '📱 Atendimento via WhatsApp',
      '📦 Envio sob disponibilidade'
    ],
    doses: [
      { value: '10mg', label: '10 mg', price: 0, image: ritalina10mg },
      { value: '20mg', label: '20 mg', price: 0, image: ritalina10mg }
    ],
    requiresPrescription: true
  },
  cytotec: {
    id: 'cytotec',
    category: 'Outros',
    name: 'Cytotec — misoprostol',
    subtitle: 'Sob prescrição',
    description: [
      '📋 Venda somente com receita',
      '📱 Atendimento via WhatsApp',
      '📦 Envio sob disponibilidade'
    ],
    doses: [
      { value: '200mcg', label: '200 mcg', price: 0, image: cytotec200mcg }
    ],
    requiresPrescription: true
  }
};



const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.486"/>
  </svg>
);

const VitaFitFarma = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    dose: '',
    forma: '',
    uf: 'PR',
    cidade: '',
    quantidade: 2,
    hasValidPrescription: false
  });
  const [showBanner, setShowBanner] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [headerShadow, setHeaderShadow] = useState(false);
  const [logoCompact, setLogoCompact] = useState(false);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminKeySequence, setAdminKeySequence] = useState('');
  const [adminKeyTimeout, setAdminKeyTimeout] = useState(null);
  const [customProducts, setCustomProducts] = useState({});
  const [brandColors, setBrandColors] = useState({
    brandA: '#0B6A6D',
    brandB: '#22C55E'
  });

  // Load admin state and custom data from localStorage
  useEffect(() => {
    const adminKey = localStorage.getItem('adminKey');
    if (adminKey === 'vitafit-admin') {
      setIsAdmin(true);
    }
    
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        setCustomProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error('Error loading custom products:', e);
      }
    }

    const savedColors = localStorage.getItem('brandColors');
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors);
        setBrandColors(colors);
        updateCSSVariables(colors);
      } catch (e) {
        console.error('Error loading brand colors:', e);
      }
    }
  }, []);

  // Update CSS variables
  const updateCSSVariables = useCallback((colors) => {
    const root = document.documentElement;
    // Convert hex to HSL for CSS variables
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
    
    root.style.setProperty('--brandA', hexToHsl(colors.brandA));
    root.style.setProperty('--brandB', hexToHsl(colors.brandB));
  }, []);

  // Admin key sequence detection
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (adminKeyTimeout) clearTimeout(adminKeyTimeout);
      
      const newSequence = adminKeySequence + e.key.toLowerCase();
      setAdminKeySequence(newSequence);
      
      if (newSequence === 'vfadmin') {
        localStorage.setItem('adminKey', 'vitafit-admin');
        setIsAdmin(true);
        setAdminKeySequence('');
        return;
      }
      
      const timeout = setTimeout(() => {
        setAdminKeySequence('');
      }, 6000);
      setAdminKeyTimeout(timeout);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (adminKeyTimeout) clearTimeout(adminKeyTimeout);
    };
  }, [adminKeySequence, adminKeyTimeout]);

  // URL admin parameter check
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === '1') {
      localStorage.setItem('adminKey', 'vitafit-admin');
      setIsAdmin(true);
    }
  }, []);

  // Get merged products (default + custom), filtering out inactive ones
  const getProducts = useCallback(() => {
    const inactiveProducts = JSON.parse(localStorage.getItem('inactiveProducts') || '[]');
    const allProducts = { ...DEFAULT_PRODUCTS, ...customProducts };
    
    // Filter out inactive products
    const activeProducts = {} as typeof DEFAULT_PRODUCTS;
    Object.keys(allProducts).forEach(key => {
      if (!inactiveProducts.includes(key)) {
        activeProducts[key] = allProducts[key];
      }
    });
    
    return activeProducts;
  }, [customProducts]);

  // Scroll detection for header shadow and logo shrink
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setHeaderShadow(scrolled);
      setLogoCompact(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get minimum boxes based on UF
  const getMinBoxes = useCallback((uf) => {
    return ['PR', 'SC', 'RS'].includes(uf) ? 2 : 5;
  }, []);

  // Get current product price
  const getCurrentPrice = useCallback(() => {
    if (!selectedProduct || !formData.dose) return 0;
    
    const products = getProducts();
    const product = products[selectedProduct.id];
    const dose = product.doses.find(d => d.value === formData.dose);
    
    if (!dose) return 0;
    
    let price = dose.price;
    
    // Add caneta price for Lipoless
    if (product.id === 'lipoless' && formData.forma === 'caneta') {
      const formaOption = product.formaOptions.find(f => f.value === 'caneta');
      price += formaOption?.priceAdd || 0;
    }
    
    return price;
  }, [selectedProduct, formData, getProducts]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    const minBoxes = getMinBoxes(formData.uf);
    const products = getProducts();
    const currentDose = products[selectedProduct?.id]?.doses.find(d => d.value === formData.dose);
    
    // For prescription products, require prescription confirmation
    if (products[selectedProduct?.id]?.requiresPrescription && !formData.hasValidPrescription) {
      return false;
    }
    
    return (
      formData.dose &&
      formData.cidade.trim() &&
      formData.quantidade >= minBoxes &&
      !currentDose?.unavailable
    );
  }, [formData, selectedProduct, getMinBoxes, getProducts]);

  // Get WhatsApp parameters for the current form state
  const getWhatsAppParams = useCallback((product = null) => {
    if (!product) return {};
    
    const products = getProducts();
    const productData = products[product.id];
    
    // Special handling for prescription products
    if (productData.requiresPrescription) {
      return {
        produto: `${productData.name} (tenho receita válida)`,
        cidade: formData.cidade,
        uf: formData.uf
      };
    }
    
    const productName = product.id === 'tg' ? 'TG' : 'Lipoless';
    const forma = product.id === 'tg' ? '4 ampolas' : 
      formData.forma === 'caneta' ? 'Caneta' : '4 ampolas + seringa';
    
    return {
      produto: productName,
      dose: formData.dose,
      forma: forma,
      qtd: formData.quantidade,
      cidade: formData.cidade,
      uf: formData.uf
    };
  }, [formData, getProducts]);

  // Open product modal
  const openProductModal = useCallback((product) => {
    setSelectedProduct(product);
    setFormData({
      dose: product.doses[0]?.value || '',
      forma: product.formaOptions?.[0]?.value || '4 ampolas',
      uf: 'PR',
      cidade: '',
      quantidade: 2,
      hasValidPrescription: false
    });
  }, []);

  // Scroll to section
  const scrollToSection = useCallback((sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const filteredProducts = Object.values(getProducts()).filter(product => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'TG (ampolas)') return product.id === 'tg';
    if (activeFilter === 'Lipoless (ampolas/caneta)') return product.id === 'lipoless';
    if (activeFilter === 'Outros (sob prescrição)') return product.category === 'Outros';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-gradient-end">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-shadow duration-200 ${headerShadow ? 'shadow-lg' : ''} bg-brand-gradient backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-1">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => scrollToSection('inicio')}
              className={`focus-ring rounded-lg bg-white/20 backdrop-blur-sm p-3 shadow-lg border border-white/30 logo-shrink ${logoCompact ? 'logo-compact' : ''} relative z-20`}
              aria-label="Voltar ao início"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            >
              <div className="flex items-center gap-2">
                <VialLeafIcon size={logoCompact ? 28 : 32} className="logo-mark" />
                <div className="logo-full">
                  <img 
                    src="https://i.ibb.co/N6jMRywM/logo-vitafit-fundobranco-removebg-preview.png" 
                    alt="VitaFit Farma" 
                    className="h-8 w-8 md:h-10 md:w-10"
                    loading="eager"
                  />
                </div>
                <div className="logo-mark">
                  <span className="text-primary font-bold text-lg">VitaFit</span>
                </div>
              </div>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {[
                { name: 'Início', id: 'inicio' },
                { name: 'Como Comprar', id: 'como-comprar' },
                { name: 'Produtos', id: 'produtos' },
                { name: 'Dúvidas', id: 'duvidas' },
                { name: 'Contato', id: 'contato' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-white/90 hover:text-white transition-colors focus-ring rounded px-2 py-1"
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* WhatsApp CTA */}
            <WppLink
              className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-xl font-medium animate-pulse-green focus-ring backdrop-blur-sm"
              ariaLabel="Falar no WhatsApp"
            >
              <WhatsAppIcon size={18} />
              <span className="hidden sm:inline">Falar no WhatsApp</span>
            </WppLink>

          </div>
        </div>
      </header>

      {/* Regional Minimum Banner - Separated */}
      {showBanner && (
        <div className="bg-red-600 text-white py-3 px-4 animate-fade-in shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-sm font-bold text-white drop-shadow-sm">
              PR • SC • RS: pedido mínimo 2 caixas • Outras regiões: mínimo 5 caixas
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white hover:bg-white/20 rounded p-1 focus-ring"
              aria-label="Fechar banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="inicio" className="relative">
        {/* Banner Image */}
        <div className="relative h-[210px] sm:h-[260px] lg:h-[360px] overflow-hidden rounded-b-2xl">
          <img
            src={heroBackground}
            alt="VitaFit Farma - Medicamentos diversos"
            className="w-full h-full object-contain"
            loading="eager"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-brand-gradient"></div>
          
          
        </div>
      </section>

      {/* Section Ribbon - Como Comprar */}
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-brand-gradient h-2"></div>
      </div>

      {/* Como Comprar */}
      <section id="como-comprar" className="py-16 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como Comprar</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Escolha o produto e a dose', desc: 'Navegue pelos nossos produtos TG e Lipoless e selecione a dose ideal.' },
              { step: '2', title: 'Clique em "Pedir no WhatsApp"', desc: 'Preencha os dados do pedido e clique no botão verde para ir ao WhatsApp.' },
              { step: '3', title: 'Confirme cidade e quantidade', desc: 'Nossa equipe responderá rapidamente com o valor final e forma de pagamento.' }
            ].map(item => (
              <div key={item.step} className="glass-card rounded-2xl p-6 text-center animate-fade-in">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Ribbon - Produtos */}
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-brand-gradient h-2"></div>
      </div>

      {/* Produtos */}
      <section id="produtos" className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Produtos & Preços</h2>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['Todos', 'TG (ampolas)', 'Lipoless (ampolas/caneta)', 'Outros (sob prescrição)'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full font-medium transition-colors focus-ring ${
                  activeFilter === filter
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/80 text-text-muted hover:bg-primary/10'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="glass-card rounded-2xl p-6 animate-fade-in">
                <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
                  <img
                    src={product.doses[0]?.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-text-muted mb-4">{product.subtitle}</p>
                
                {/* Dose chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.doses.slice(0, 3).map(dose => (
                    <span key={dose.value} className="bg-accent-cyan/20 text-accent-cyan px-2 py-1 rounded text-sm">
                      {dose.label}
                    </span>
                  ))}
                  {product.doses.length > 3 && (
                    <span className="text-text-muted text-sm">+{product.doses.length - 3} mais</span>
                  )}
                </div>

                <p className="text-lg font-semibold mb-4">
                  {product.requiresPrescription ? (
                    <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-medium">
                      Sob consulta
                    </span>
                  ) : (
                    `A partir de R$ ${Math.min(...product.doses.map(d => d.price)).toLocaleString('pt-BR')}`
                  )}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => openProductModal(product)}
                    className="flex-1 bg-gray-100 text-text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-200 focus-ring"
                  >
                    Ver detalhes
                  </button>
                  <WppLink
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium animate-pulse-green focus-ring flex items-center gap-2"
                    ariaLabel={`Pedir ${product.name} no WhatsApp`}
                  >
                    <WhatsAppIcon size={16} />
                  </WppLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Ribbon - Dúvidas */}
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-brand-gradient h-2"></div>
      </div>

      {/* Dúvidas */}
      <section id="duvidas" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Dúvidas rápidas</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { q: 'Como faço o pedido?', a: 'Escolha o produto, dose e quantidade, depois clique em "Pedir no WhatsApp". Nossa equipe responderá rapidamente.' },
              { q: 'Qual o mínimo por região?', a: 'PR, SC e RS: mínimo 2 caixas. Outras regiões: mínimo 5 caixas.' },
              { q: 'Quais regiões atendem?', a: 'Entregamos principalmente em PR, SC, RS e Grande SP. Consulte disponibilidade para outras regiões.' }
            ].map((faq, i) => (
              <div key={i} className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-3">{faq.q}</h3>
                <p className="text-text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Sobre a VitaFit</h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-text-muted leading-relaxed">
              <strong>VitaFit Farma</strong> é uma farmácia moderna em Foz do Iguaçu que se destaca pelo acesso direto a medicamentos de ponta. 
              Nosso diferencial está em <strong>importar tirzepatida e outros produtos exclusivos do Paraguai e do mundo</strong>, oferecendo{' '}
              <strong>preços competitivos e venda em atacado</strong> para todo o Brasil. Atendimento rápido via WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Contato</h2>
          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPin size={20} className="text-primary" />
                <p className="text-lg">417 R. Olávo Bilac — Foz do Iguaçu, PR</p>
              </div>
              <p className="text-text-muted mb-6">
                Importa do Paraguai e do mundo e vende em atacado no Brasil
              </p>
              <WppLink className="inline-flex items-center gap-3 bg-secondary text-secondary-foreground px-8 py-4 rounded-xl font-medium text-lg animate-pulse-green focus-ring">
                <WhatsAppIcon size={24} />
                Falar no WhatsApp
              </WppLink>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-gradient text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <VialLeafIcon size={32} className="text-white" />
              <div>
                <p className="font-semibold">VitaFit Farma</p>
                <p className="text-sm text-white/80">417 R. Olávo Bilac — Foz do Iguaçu, PR</p>
              </div>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
              {['Início', 'Produtos', 'Dúvidas', 'Contato'].map(item => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace('ú', 'u').replace('í', 'i'))}
                  className="text-white/80 hover:text-white transition-colors focus-ring rounded px-2 py-1"
                >
                  {item}
                </button>
              ))}
            </nav>
            
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} VitaFit Farma
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <WppLink
          className={`flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-full font-medium shadow-lg backdrop-blur-sm ${
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '' : 'animate-pulse-green'
          } focus-ring`}
          ariaLabel="Resposta imediata no WhatsApp"
        >
          <WhatsAppIcon size={20} />
          <span className="text-sm">Resposta imediata</span>
        </WppLink>
      </div>


      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <nav className="text-sm text-text-muted">
                <span>Início</span> › <span>Produtos</span> › <span className="text-text-primary">{selectedProduct.name}</span>
              </nav>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 focus-ring rounded p-1"
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 p-6">
              {/* Product Image & Info */}
              <div>
                <div className="aspect-square bg-gray-100 rounded-xl mb-6 overflow-hidden">
                  <img
                    src={getProducts()[selectedProduct.id].doses.find(d => d.value === formData.dose)?.image || selectedProduct.doses[0]?.image}
                    alt={`${selectedProduct.name} - ${formData.dose}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <h1 className="text-2xl font-bold mb-3">{selectedProduct.name}</h1>
                <div className="space-y-2">
                  {selectedProduct.description.map((item, i) => (
                    <p key={i} className="text-text-muted">{item}</p>
                  ))}
                </div>
              </div>

              {/* Order Form */}
              <div className="lg:sticky lg:top-24">
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-6">Fazer Pedido</h2>
                  
                  {/* Dose Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Dose</label>
                    <div className="relative">
                      <select
                        value={formData.dose}
                        onChange={(e) => setFormData(prev => ({ ...prev, dose: e.target.value }))}
                        className="w-full p-3 border border-input rounded-lg bg-white focus-ring appearance-none"
                      >
                        {getProducts()[selectedProduct.id].doses.map(dose => (
                          <option key={dose.value} value={dose.value} disabled={dose.unavailable}>
                            {dose.label} {dose.unavailable ? '(Sob consulta)' : dose.price > 0 ? `- R$ ${dose.price.toLocaleString('pt-BR')}` : '(Sob consulta)'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Forma Selection (Lipoless only) */}
                  {selectedProduct.id === 'lipoless' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Forma</label>
                      <div className="relative">
                        <select
                          value={formData.forma}
                          onChange={(e) => setFormData(prev => ({ ...prev, forma: e.target.value }))}
                          className="w-full p-3 border border-input rounded-lg bg-white focus-ring appearance-none"
                        >
                          {getProducts()[selectedProduct.id].formaOptions?.map(forma => {
                            const isCanetaAvailable = formData.dose === '10mg';
                            const disabled = forma.value === 'caneta' && !isCanetaAvailable;
                            
                            return (
                              <option key={forma.value} value={forma.value} disabled={disabled}>
                                {forma.label} {disabled ? '(Indisponível para esta dose)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                      </div>
                    </div>
                  )}

                  {/* UF Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Estado/UF</label>
                    <div className="relative">
                      <select
                        value={formData.uf}
                        onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value, quantidade: getMinBoxes(e.target.value) }))}
                        className="w-full p-3 border border-input rounded-lg bg-white focus-ring appearance-none"
                      >
                        {ESTADOS_BR.map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Cidade */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                      className="w-full p-3 border border-input rounded-lg bg-white focus-ring"
                      placeholder="Digite sua cidade"
                    />
                  </div>

                  {/* Quantidade */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Quantidade (caixas) - Mínimo: {getMinBoxes(formData.uf)}
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, quantidade: Math.max(1, prev.quantidade - 1) }))}
                        className="w-10 h-10 border border-input rounded-lg flex items-center justify-center hover:bg-gray-50 focus-ring"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={formData.quantidade}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                        className="flex-1 p-3 border border-input rounded-lg bg-white focus-ring text-center"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, quantidade: prev.quantidade + 1 }))}
                        className="w-10 h-10 border border-input rounded-lg flex items-center justify-center hover:bg-gray-50 focus-ring"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {formData.quantidade < getMinBoxes(formData.uf) && (
                      <p className="text-destructive text-sm mt-1">
                        Quantidade mínima para {formData.uf}: {getMinBoxes(formData.uf)} caixas
                      </p>
                    )}
                  </div>

                  {/* Price Display */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Preço por dose:</span>
                      <span className="text-xl font-bold text-primary">
                        {selectedProduct.requiresPrescription 
                          ? 'Sob consulta'
                          : getCurrentPrice() > 0 
                            ? `R$ ${getCurrentPrice().toLocaleString('pt-BR')}`
                            : 'Sob consulta'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Prescription Checkbox (for prescription products) */}
                  {selectedProduct.requiresPrescription && (
                    <div className="mb-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.hasValidPrescription}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasValidPrescription: e.target.checked }))}
                          className="mt-1 w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                        <span className="text-sm text-text-muted">
                          Tenho receita válida (anexarei no WhatsApp)
                        </span>
                      </label>
                    </div>
                  )}

                  {/* WhatsApp CTA */}
                  <div className={`w-full ${!isFormValid() ? 'pointer-events-none' : ''}`}>
                    <WppLink
                      params={isFormValid() ? getWhatsAppParams(selectedProduct) : {}}
                      className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium text-lg focus-ring ${
                        isFormValid()
                          ? 'bg-secondary text-secondary-foreground animate-pulse-green'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      ariaLabel={`Pedir ${selectedProduct.name} - ${formData.dose} no WhatsApp`}
                    >
                      <WhatsAppIcon size={24} />
                      Pedir no WhatsApp
                      <ExternalLink size={18} />
                    </WppLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        brandColors={brandColors}
        onBrandColorsChange={(colors) => {
          setBrandColors(colors);
          updateCSSVariables(colors);
        }}
        customProducts={customProducts}
        onCustomProductsChange={setCustomProducts}
      />
    </div>
  );
};

export default VitaFitFarma;