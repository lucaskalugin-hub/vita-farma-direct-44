import React, { useState, useEffect } from 'react';
import { X, Settings, Upload, Plus, Trash2, Image as ImageIcon, Eye, CreditCard as Edit3, EyeOff, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

// Default products from the site
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
      { value: '30mg', label: '30 mg', price: 0, image: '/src/assets/venvanse-50mg.png' },
      { value: '50mg', label: '50 mg', price: 0, image: '/src/assets/venvanse-50mg.png' },
      { value: '70mg', label: '70 mg', price: 0, image: '/src/assets/venvanse-50mg.png' }
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
      { value: '10mg', label: '10 mg', price: 0, image: '/src/assets/ritalina-10mg.png' },
      { value: '20mg', label: '20 mg', price: 0, image: '/src/assets/ritalina-10mg.png' }
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
      { value: '200mcg', label: '200 mcg', price: 0, image: '/src/assets/cytotec-200mcg.png' }
    ],
    requiresPrescription: true
  }
};

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  brandColors: { brandA: string; brandB: string };
  onBrandColorsChange: (colors: { brandA: string; brandB: string }) => void;
  customProducts: any;
  onCustomProductsChange: (products: any) => void;
}

interface ProductFormData {
  name: string;
  subtitle: string;
  category: 'TG' | 'Lipoless' | 'Outros';
  requiresPrescription: boolean;
  description: string[];
  doses: Array<{
    value: string;
    label: string;
    price: number;
    image: string;
  }>;
  formaOptions?: Array<{
    value: string;
    label: string;
    priceAdd: number;
  }>;
}

interface BannerData {
  id: string;
  name: string;
  image: string;
  active: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  brandColors,
  onBrandColorsChange,
  customProducts,
  onCustomProductsChange
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    subtitle: '',
    category: 'TG',
    requiresPrescription: false,
    description: ['', '', ''],
    doses: [{ value: '', label: '', price: 0, image: '' }],
    formaOptions: []
  });
  
  // Banner management states
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    name: '',
    image: '',
    active: true
  });

  // Estados de loading
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [loadingDeleteProduct, setLoadingDeleteProduct] = useState<string | null>(null);
  const [loadingDeleteBanner, setLoadingDeleteBanner] = useState<string | null>(null);
  const [loadingToggleProduct, setLoadingToggleProduct] = useState<string | null>(null);
  const [loadingToggleBanner, setLoadingToggleBanner] = useState<string | null>(null);

  // Estado de produtos inativos agora será controlado pelo Supabase (campo active)
  // Não precisamos mais de inactiveProducts local
  // Produtos customizados do Supabase
  const [customProductsState, setCustomProductsState] = useState<any>({});

  // Função para buscar produtos do Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*');
      if (error) {
        if (error.code === '28P01' || error.code === '42501') {
          toast({ title: 'Acesso negado', description: 'Você não tem permissão para acessar os produtos.', variant: 'destructive' });
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Failed to fetch')) {
          toast({ title: 'Erro de conexão', description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro ao buscar produtos', description: error.message || 'Erro desconhecido', variant: 'destructive' });
        }
        return;
      }
      const productsObj: any = {};
      data?.forEach((p: any) => {
        productsObj[p.id] = {
          id: p.id,
          name: p.nome,
          subtitle: p.subtitulo,
          category: p.categoria,
          requiresPrescription: p.requires_prescription,
          description: p.descricao || [],
          doses: p.doses || [],
          formaOptions: p.forma_options || [],
          active: p.active !== false
        };
      });
      setCustomProductsState(productsObj);
    } catch (err: any) {
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro ao buscar produtos. Tente novamente.', variant: 'destructive' });
    }
  };

  // Função para buscar banners do Supabase
  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*');
      if (error) {
        if (error.code === '28P01' || error.code === '42501') {
          toast({ title: 'Acesso negado', description: 'Você não tem permissão para acessar os banners.', variant: 'destructive' });
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Failed to fetch')) {
          toast({ title: 'Erro de conexão', description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro ao buscar banners', description: error.message || 'Erro desconhecido', variant: 'destructive' });
        }
        return;
      }
      setBanners(data || []);
    } catch (err: any) {
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro ao buscar banners. Tente novamente.', variant: 'destructive' });
    }
  };

  // Buscar produtos e banners ao abrir o painel
  useEffect(() => {
    if (!isOpen) return;
    fetchProducts();
    fetchBanners();
  }, [isOpen]);


  // Toggle product active/inactive status via Supabase
  const toggleProductStatus = async (productId: string) => {
    const product = customProductsState[productId];
    if (!product) return;
    try {
      setLoadingToggleProduct(productId);
      const newActive = !product.active;
      const { error } = await supabase.from('produtos').update({ active: newActive }).eq('id', productId);
      setLoadingToggleProduct(null);
      if (error) {
        if (error.code === '28P01' || error.code === '42501') {
          toast({ title: 'Acesso negado', description: 'Você não tem permissão para atualizar status.', variant: 'destructive' });
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Failed to fetch')) {
          toast({ title: 'Erro de conexão', description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro ao atualizar status do produto', description: error.message || 'Erro desconhecido', variant: 'destructive' });
        }
        return;
      }
      toast({
        title: "Salvo com sucesso",
        description: newActive ? "Produto ativado!" : "Produto inativado!",
      });
      fetchProducts();
    } catch (err: any) {
      setLoadingToggleProduct(null);
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro ao atualizar status do produto. Tente novamente.', variant: 'destructive' });
    }
  };

  // Get all products (default + custom)
  const getAllProducts = () => {
    // Só os customizados têm campo active, os default são sempre ativos
    return { ...DEFAULT_PRODUCTS, ...customProductsState };
  };

  // Product management functions
  const generateProductId = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15) + '_' + Date.now().toString(36);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'banner' = 'product', doseIndex?: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Imagem deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      if (type === 'product' && typeof doseIndex === 'number') {
        setProductForm(prev => {
          const newDoses = prev.doses.map((d, i) => i === doseIndex ? { ...d, image: imageData } : d);
          return { ...prev, doses: newDoses };
        });
      } else if (type === 'banner') {
        setBannerForm(prev => ({ ...prev, image: imageData }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addDose = () => {
    setProductForm(prev => ({
      ...prev,
      doses: [
        ...Array.isArray(prev.doses) ? prev.doses : [],
        { value: '', label: '', price: 0, image: '' }
      ]
    }));
  };

  const removeDose = (index: number) => {
    if (productForm.doses.length > 1) {
      setProductForm(prev => ({
        ...prev,
        doses: prev.doses.filter((_, i) => i !== index)
      }));
    }
  };

  const saveProduct = async () => {
    if (loadingProduct) return;
    try {
      // Validações obrigatórias
      if (!productForm.name.trim()) {
        toast({
          title: "Erro",
          description: "Nome do produto é obrigatório",
          variant: "destructive"
        });
        return;
      }
      if (!productForm.category) {
        toast({
          title: "Erro",
          description: "Categoria é obrigatória",
          variant: "destructive"
        });
        return;
      }
      if (!productForm.doses || !Array.isArray(productForm.doses) || productForm.doses.length === 0) {
        toast({
          title: "Erro",
          description: "Pelo menos uma dose é obrigatória",
          variant: "destructive"
        });
        return;
      }
      // Pelo menos uma descrição preenchida
      const filledDescriptions = productForm.description.filter((d) => d && d.trim() !== '');
      if (filledDescriptions.length === 0) {
        toast({
          title: "Erro",
          description: "Pelo menos uma descrição é obrigatória",
          variant: "destructive"
        });
        return;
      }
      for (let i = 0; i < productForm.doses.length; i++) {
        const d = productForm.doses[i];
        if (!d.value.trim() || !d.label.trim()) {
          toast({
            title: "Erro",
            description: `Preencha valor e label da dose ${i + 1}`,
            variant: "destructive"
          });
          return;
        }
        if (!d.image) {
          toast({
            title: "Erro",
            description: `Imagem da dose ${i + 1} é obrigatória`,
            variant: "destructive"
          });
          return;
        }
        // Se não for sob consulta, preço deve ser maior que zero
        if (d.price !== 0 && (!d.price || d.price <= 0)) {
          toast({
            title: "Erro",
            description: `Preço da dose ${i + 1} deve ser maior que zero ou marcado como 'Sob consulta'`,
            variant: "destructive"
          });
          return;
        }
      }

      const isNew = editingProduct === 'new';
      let productId = editingProduct;
      if (isNew) {
        productId = undefined;
      }

      const dbProduct = {
        nome: productForm.name,
        subtitulo: productForm.subtitle,
        categoria: productForm.category,
        requires_prescription: productForm.requiresPrescription,
        descricao: productForm.description.map(d => d.trim()).filter(Boolean),
        doses: productForm.doses,
        forma_options: productForm.formaOptions || []
      };

      setLoadingProduct(true);
      let result;
      if (isNew) {
        result = await supabase.from('produtos').insert([dbProduct]);
      } else {
        result = await supabase.from('produtos').update(dbProduct).eq('id', productId);
      }
      setLoadingProduct(false);
      const { error } = result;
      if (error) {
        if (error.code === '28P01' || error.code === '42501') {
          toast({ title: 'Acesso negado', description: 'Você não tem permissão para salvar produtos.', variant: 'destructive' });
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Failed to fetch')) {
          toast({ title: 'Erro de conexão', description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro ao salvar produto', description: error.message || 'Erro desconhecido', variant: 'destructive' });
        }
        return;
      }

      toast({
        title: "Salvo com sucesso",
        description: isNew ? "Produto cadastrado!" : "Produto atualizado!",
      });

      fetchProducts();
      resetProductForm();
      setEditingProduct(null);
    } catch (err: any) {
      setLoadingProduct(false);
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro ao salvar produto. Tente novamente.', variant: 'destructive' });
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      subtitle: '',
      category: 'TG',
      requiresPrescription: false,
      description: ['', '', ''],
      doses: [{ value: '', label: '', price: 0, image: '' }],
      formaOptions: []
    });
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      setLoadingDeleteProduct(productId);
      const { error } = await supabase.from('produtos').delete().eq('id', productId);
      setLoadingDeleteProduct(null);
      if (error) {
        if (error.code === '28P01' || error.code === '42501') {
          toast({ title: 'Acesso negado', description: 'Você não tem permissão para excluir produtos.', variant: 'destructive' });
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Failed to fetch')) {
          toast({ title: 'Erro de conexão', description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro ao excluir produto', description: error.message || 'Erro desconhecido', variant: 'destructive' });
        }
        return;
      }
      toast({
        title: "Produto excluído",
        description: "Produto removido com sucesso",
      });
      fetchProducts();
    } catch (err: any) {
      setLoadingDeleteProduct(null);
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro ao excluir produto. Tente novamente.', variant: 'destructive' });
    }
  };

  const editProduct = (product: any) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name || '',
      subtitle: product.subtitle || '',
      category: product.category || 'TG',
      requiresPrescription: !!product.requiresPrescription,
      description: Array.isArray(product.description) ? [...product.description, '', '', ''].slice(0, 3) : ['', '', ''],
      doses: Array.isArray(product.doses) && product.doses.length > 0
        ? product.doses.map((d: any) => ({ ...d }))
        : [{ value: '', label: '', price: 0, image: '' }],
      formaOptions: Array.isArray(product.formaOptions) ? [...product.formaOptions] : []
    });
    setActiveTab('new-product');
  };


  // Banner management functions (Supabase)
  const saveBanner = async () => {
    if (loadingBanner) return;
    try {
      // Validações obrigatórias
      if (!bannerForm.name.trim()) {
        toast({
          title: "Erro",
          description: "Nome do banner é obrigatório",
          variant: "destructive"
        });
        return;
      }
      if (!bannerForm.image) {
        toast({
          title: "Erro",
          description: "Imagem do banner é obrigatória",
          variant: "destructive"
        });
        return;
      }

      const isNew = editingBanner === 'new';
      let bannerId = editingBanner;
      if (isNew) {
        bannerId = undefined;
      }

      const dbBanner = {
        name: bannerForm.name,
        image: bannerForm.image,
        active: bannerForm.active
      };

      setLoadingBanner(true);
      let result;
      if (isNew) {
        result = await supabase.from('banners').insert([dbBanner]);
      } else {
        result = await supabase.from('banners').update(dbBanner).eq('id', bannerId);
      }
      setLoadingBanner(false);
      const { error } = result;
      if (error) {
        if (error.code === '28P01' || error.code === '42501') {
          toast({ title: 'Acesso negado', description: 'Você não tem permissão para salvar banners.', variant: 'destructive' });
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Failed to fetch')) {
          toast({ title: 'Erro de conexão', description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro ao salvar banner', description: error.message || 'Erro desconhecido', variant: 'destructive' });
        }
        return;
      }

      toast({
        title: "Sucesso",
        description: isNew ? "Banner criado!" : "Banner atualizado!",
      });

      fetchBanners();
      resetBannerForm();
    } catch (err: any) {
      setLoadingBanner(false);
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro ao salvar banner. Tente novamente.', variant: 'destructive' });
    }
  };

  const resetBannerForm = () => {
    setEditingBanner(null);
    setBannerForm({
      name: '',
      image: '',
      active: true
    });
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;
    try {
      setLoadingDeleteBanner(bannerId);
      const { error } = await supabase.from('banners').delete().eq('id', bannerId);
      setLoadingDeleteBanner(null);
      if (error) {
        if (error.code === '28P01' || error.code === '42501') {
          toast({ title: 'Acesso negado', description: 'Você não tem permissão para excluir banners.', variant: 'destructive' });
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Failed to fetch')) {
          toast({ title: 'Erro de conexão', description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro ao excluir banner', description: error.message || 'Erro desconhecido', variant: 'destructive' });
        }
        return;
      }
      toast({
        title: "Banner excluído",
        description: "Banner removido com sucesso",
      });
      fetchBanners();
    } catch (err: any) {
      setLoadingDeleteBanner(null);
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro ao excluir banner. Tente novamente.', variant: 'destructive' });
    }
  };

  const toggleBannerStatus = async (bannerId: string) => {
    const banner = banners.find(b => b.id === bannerId);
    if (!banner) return;
    try {
      setLoadingToggleBanner(bannerId);
      const { error } = await supabase.from('banners').update({ active: !banner.active }).eq('id', bannerId);
      setLoadingToggleBanner(null);
      if (error) {
        if (error.code === '28P01' || error.code === '42501') {
          toast({ title: 'Acesso negado', description: 'Você não tem permissão para atualizar status.', variant: 'destructive' });
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Failed to fetch')) {
          toast({ title: 'Erro de conexão', description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', variant: 'destructive' });
        } else {
          toast({ title: 'Erro ao atualizar status do banner', description: error.message || 'Erro desconhecido', variant: 'destructive' });
        }
        return;
      }
      fetchBanners();
    } catch (err: any) {
      setLoadingToggleBanner(null);
      toast({ title: 'Erro inesperado', description: 'Ocorreu um erro ao atualizar status do banner. Tente novamente.', variant: 'destructive' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Painel Admin
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            aria-label="Fechar painel admin"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6 overflow-x-auto">
            {[
              { id: 'products', label: 'Produtos Cadastrados', icon: Eye },
              { id: 'new-product', label: 'Cadastrar Produto', icon: Plus },
              { id: 'banners', label: 'Gerenciar Banners', icon: ImageIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Products List Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Produtos Cadastrados</h3>
                <Button 
                  onClick={() => {
                    resetProductForm();
                    setEditingProduct('new');
                    setActiveTab('new-product');
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Novo Produto
                </Button>
              </div>

              {Object.keys(getAllProducts()).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum produto disponível.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imagem</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Preço Base</TableHead>
                        <TableHead>Receita</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(getAllProducts()).map((product: any) => {
                        const isDefault = DEFAULT_PRODUCTS.hasOwnProperty(product.id);
                        // Produtos customizados usam campo active, default são sempre ativos
                        const isInactive = !isDefault && product.active === false;
                        return (
                          <TableRow key={product.id} className={isInactive ? 'opacity-50' : ''}>
                            <TableCell>
                              {product.doses?.[0]?.image ? (
                                <img 
                                  src={product.doses[0].image} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                  <ImageIcon size={20} className="text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.subtitle}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {product.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              {product.doses?.[0]?.price ? 
                                `A partir de R$ ${product.doses[0].price.toLocaleString('pt-BR')}` : 
                                'Sob consulta'
                              }
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                product.requiresPrescription ? 
                                  'bg-red-100 text-red-800' : 
                                  'bg-green-100 text-green-800'
                              }`}>
                                {product.requiresPrescription ? 'Sim' : 'Não'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isInactive ? 
                                  'bg-gray-100 text-gray-800' : 
                                  'bg-green-100 text-green-800'
                              }`}>
                                {isInactive ? 'Inativo' : 'Ativo'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isDefault ? 
                                  'bg-blue-100 text-blue-800' : 
                                  'bg-purple-100 text-purple-800'
                              }`}>
                                {isDefault ? 'Padrão' : 'Custom'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {/* Edit button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editProduct(product)}
                                  className="h-8 w-8 p-0"
                                  title="Editar produto"
                                >
                                  <Pencil size={12} />
                                </Button>
                                
                                {/* Toggle active/inactive */}
                                <Button
                                  variant={isInactive ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleProductStatus(product.id)}
                                  className="h-8 w-8 p-0"
                                  title={isInactive ? "Ativar produto" : "Inativar produto"}
                                  disabled={loadingToggleProduct === product.id}
                                >
                                  {loadingToggleProduct === product.id ? '...' : (isInactive ? <Eye size={12} /> : <EyeOff size={12} />)}
                                </Button>
                                
                                {/* Delete button */}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteProduct(product.id)}
                                  className="h-8 w-8 p-0"
                                  title="Excluir produto"
                                  disabled={loadingDeleteProduct === product.id}
                                >
                                  {loadingDeleteProduct === product.id ? '...' : <X size={12} />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* New/Edit Product Tab */}
          {activeTab === 'new-product' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingProduct === 'new' ? 'Cadastrar Novo Produto' : 'Editar Produto'}
                </h3>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetProductForm();
                    setActiveTab('products');
                  }}
                >
                  Voltar
                </Button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome do Produto *</label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: TG - Tirzepatida"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subtítulo</label>
                    <Input
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Ex: Mais econômico"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value as 'TG' | 'Lipoless' | 'Outros' }))}
                      className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
                    >
                      <option value="TG">TG</option>
                      <option value="Lipoless">Lipoless</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requiresPrescription"
                      checked={productForm.requiresPrescription}
                      onChange={(e) => setProductForm(prev => ({ ...prev, requiresPrescription: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="requiresPrescription" className="text-sm font-medium">
                      Requer receita médica
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrições (máx. 3)</label>
                    {productForm.description.map((desc, index) => (
                      <Input
                        key={index}
                        value={desc}
                        onChange={(e) => {
                          const newDesc = [...productForm.description];
                          newDesc[index] = e.target.value;
                          setProductForm(prev => ({ ...prev, description: newDesc }));
                        }}
                        placeholder={`Descrição ${index + 1}`}
                        className="mb-2"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Doses Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Dosagens e Preços</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addDose}
                  >
                    <Plus size={14} className="mr-2" />
                    Adicionar Dose
                  </Button>
                </div>

                <div className="space-y-4">
                  {productForm.doses.map((dose, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Dose {index + 1}</h5>
                        {productForm.doses.length > 1 && (
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeDose(index)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Valor</label>
                          <Input
                            value={dose.value}
                            onChange={(e) => {
                              const newDoses = [...productForm.doses];
                              newDoses[index].value = e.target.value;
                              setProductForm(prev => ({ ...prev, doses: newDoses }));
                            }}
                            placeholder="Ex: 5mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Label</label>
                          <Input
                            value={dose.label}
                            onChange={(e) => {
                              const newDoses = [...productForm.doses];
                              newDoses[index].label = e.target.value;
                              setProductForm(prev => ({ ...prev, doses: newDoses }));
                            }}
                            placeholder="Ex: 5 mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Preço</label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`consultation-${index}`}
                                name={`price-type-${index}`}
                                checked={dose.price === 0}
                                onChange={() => {
                                  const newDoses = [...productForm.doses];
                                  newDoses[index].price = 0;
                                  setProductForm(prev => ({ ...prev, doses: newDoses }));
                                }}
                                className="w-4 h-4"
                              />
                              <label htmlFor={`consultation-${index}`} className="text-sm">
                                Sob consulta
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`price-${index}`}
                                name={`price-type-${index}`}
                                checked={dose.price > 0}
                                onChange={() => {
                                  const newDoses = [...productForm.doses];
                                  if (newDoses[index].price === 0) {
                                    newDoses[index].price = 100;
                                  }
                                  setProductForm(prev => ({ ...prev, doses: newDoses }));
                                }}
                                className="w-4 h-4"
                              />
                              <label htmlFor={`price-${index}`} className="text-sm">
                                Valor específico (R$)
                              </label>
                            </div>
                            {dose.price > 0 && (
                              <Input
                                type="number"
                                value={dose.price}
                                onChange={(e) => {
                                  const newDoses = [...productForm.doses];
                                  newDoses[index].price = Number(e.target.value);
                                  setProductForm(prev => ({ ...prev, doses: newDoses }));
                                }}
                                placeholder="Digite o preço"
                                min="1"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
                        <div className="flex items-center gap-4">
                          {dose.image && (
                            <img 
                              src={dose.image} 
                              alt={`Dose ${index + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
                          )}
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              <Upload size={16} />
                              {dose.image ? 'Trocar Imagem' : 'Carregar Imagem'}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'product', index)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button onClick={saveProduct} className="flex-1" disabled={loadingProduct}>
                  {loadingProduct ? 'Salvando...' : (editingProduct === 'new' ? 'Cadastrar Produto' : 'Salvar Alterações')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetProductForm();
                    setActiveTab('products');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Banner Management Tab */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gerenciar Banners</h3>
                <Button 
                  onClick={() => {
                    setEditingBanner('new');
                    setBannerForm({ name: '', image: '', active: true });
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Novo Banner
                </Button>
              </div>

              {/* Banner List */}
              {banners.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum banner cadastrado ainda.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {banners.map((banner) => (
                    <div key={banner.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100 relative">
                        {banner.image ? (
                          <img 
                            src={banner.image} 
                            alt={banner.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={32} className="text-gray-400" />
                          </div>
                        )}
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                          banner.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {banner.active ? 'Ativo' : 'Inativo'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium mb-2">{banner.name}</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBannerStatus(banner.id)}
                            disabled={loadingToggleBanner === banner.id}
                          >
                            {loadingToggleBanner === banner.id ? '...' : (banner.active ? 'Desativar' : 'Ativar')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingBanner(banner.id);
                              setBannerForm({
                                name: banner.name,
                                image: banner.image,
                                active: banner.active
                              });
                            }}
                          >
                            <Edit3 size={14} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteBanner(banner.id)}
                            disabled={loadingDeleteBanner === banner.id}
                          >
                            {loadingDeleteBanner === banner.id ? '...' : <Trash2 size={14} />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Banner Form */}
              {editingBanner && (
                <div className="p-4 sm:p-6 bg-gray-50 rounded-lg space-y-4">
                  <h4 className="font-medium">
                    {editingBanner === 'new' ? 'Novo Banner' : 'Editar Banner'}
                  </h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome do Banner *</label>
                      <Input
                        value={bannerForm.name}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Banner Principal"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="bannerActive"
                        checked={bannerForm.active}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, active: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <label htmlFor="bannerActive" className="text-sm font-medium">
                        Banner ativo
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Imagem do Banner *</label>
                    <div className="space-y-4">
                      {bannerForm.image && (
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-md">
                          <img 
                            src={bannerForm.image} 
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <label className="cursor-pointer inline-block">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          <Upload size={16} />
                          {bannerForm.image ? 'Trocar Imagem' : 'Carregar Imagem'}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'banner')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={saveBanner} disabled={loadingBanner}>
                      {loadingBanner ? 'Salvando...' : (editingBanner === 'new' ? 'Criar Banner' : 'Salvar Alterações')}
                    </Button>
                    <Button variant="outline" onClick={resetBannerForm}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;