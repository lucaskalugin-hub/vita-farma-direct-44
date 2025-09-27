import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit, Save, Cancel, Upload, Download, RotateCcw, Eye, EyeOff, Settings } from 'lucide-react';
import { adminAuth, AdminUser } from '../lib/adminAuth';
import { adminDB, Product, BrandSettings } from '../lib/adminDatabase';
import { toast } from 'sonner';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  brandColors: { brandA: string; brandB: string };
  onBrandColorsChange: (colors: { brandA: string; brandB: string }) => void;
  customProducts: Record<string, any>;
  onCustomProductsChange: (products: Record<string, any>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  brandColors,
  onBrandColorsChange,
  customProducts,
  onCustomProductsChange
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'brand' | 'backup'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Estados para novo produto
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: '',
    category: 'Outros',
    name: '',
    subtitle: '',
    description: [''],
    doses: [{ value: '', label: '', price: 0, image: '' }],
    forma_options: [],
    requires_prescription: false,
    is_active: true
  });

  useEffect(() => {
    if (isOpen) {
      const user = adminAuth.getCurrentUser();
      setCurrentUser(user);
      loadProducts();
      loadBrandSettings();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const dbProducts = await adminDB.getProducts();
      setProducts(dbProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const loadBrandSettings = async () => {
    try {
      const settings = await adminDB.getBrandSettings();
      if (settings) {
        onBrandColorsChange({
          brandA: settings.brand_a_color,
          brandB: settings.brand_b_color
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da marca:', error);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.id || !newProduct.name) {
      toast.error('ID e nome são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const result = await adminDB.createProduct(newProduct as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
      
      if (result.success) {
        toast.success('Produto criado com sucesso');
        setIsCreating(false);
        setNewProduct({
          id: '',
          category: 'Outros',
          name: '',
          subtitle: '',
          description: [''],
          doses: [{ value: '', label: '', price: 0, image: '' }],
          forma_options: [],
          requires_prescription: false,
          is_active: true
        });
        loadProducts();
      } else {
        toast.error(result.error || 'Erro ao criar produto');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    setLoading(true);
    try {
      const result = await adminDB.updateProduct(product.id, product);
      
      if (result.success) {
        toast.success('Produto atualizado com sucesso');
        setEditingProduct(null);
        loadProducts();
      } else {
        toast.error(result.error || 'Erro ao atualizar produto');
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    setLoading(true);
    try {
      const result = await adminDB.deleteProduct(id);
      
      if (result.success) {
        toast.success('Produto excluído com sucesso');
        loadProducts();
      } else {
        toast.error(result.error || 'Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductStatus = async (id: string, isActive: boolean) => {
    setLoading(true);
    try {
      const result = await adminDB.toggleProductStatus(id, isActive);
      
      if (result.success) {
        toast.success(`Produto ${isActive ? 'ativado' : 'desativado'} com sucesso`);
        loadProducts();
      } else {
        toast.error(result.error || 'Erro ao alterar status do produto');
      }
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      toast.error('Erro ao alterar status do produto');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandColorsChange = async (colors: { brandA: string; brandB: string }) => {
    setLoading(true);
    try {
      const result = await adminDB.updateBrandSettings({
        brand_a_color: colors.brandA,
        brand_b_color: colors.brandB
      });

      if (result.success) {
        onBrandColorsChange(colors);
        toast.success('Cores da marca atualizadas com sucesso');
      } else {
        toast.error(result.error || 'Erro ao atualizar cores da marca');
      }
    } catch (error) {
      console.error('Erro ao atualizar cores da marca:', error);
      toast.error('Erro ao atualizar cores da marca');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const data = await adminDB.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vitafit-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup exportado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const result = await adminDB.importData(data);
      
      if (result.success) {
        toast.success('Dados importados com sucesso');
        loadProducts();
        loadBrandSettings();
      } else {
        toast.error(result.error || 'Erro ao importar dados');
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('Erro ao importar dados');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleLogout = () => {
    adminAuth.logout();
    onClose();
    toast.success('Logout realizado com sucesso');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Settings className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Painel Administrativo</h2>
              {currentUser && (
                <p className="text-sm text-gray-600">Logado como: {currentUser.username}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'products', label: 'Produtos', icon: '📦' },
            { id: 'brand', label: 'Marca', icon: '🎨' },
            { id: 'backup', label: 'Backup', icon: '💾' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gerenciar Produtos</h3>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} />
                  Novo Produto
                </button>
              </div>

              {/* Create Product Form */}
              {isCreating && (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h4 className="font-semibold">Criar Novo Produto</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">ID do Produto</label>
                      <input
                        type="text"
                        value={newProduct.id}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, id: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="ex: novo-produto"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoria</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="TG">TG</option>
                        <option value="Lipoless">Lipoless</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Nome do produto"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Subtítulo</label>
                      <input
                        type="text"
                        value={newProduct.subtitle}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Subtítulo do produto"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.requires_prescription}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, requires_prescription: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm font-medium">Requer prescrição médica</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateProduct}
                      disabled={loading}
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Save size={16} />
                      Criar Produto
                    </button>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Cancel size={16} />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Products List */}
              <div className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{product.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.category === 'TG' ? 'bg-blue-100 text-blue-800' :
                            product.category === 'Lipoless' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {product.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{product.subtitle}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.doses.length} dose(s) • Criado em {new Date(product.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleProductStatus(product.id, !product.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.is_active 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={product.is_active ? 'Desativar produto' : 'Ativar produto'}
                        >
                          {product.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar produto"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {products.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum produto encontrado
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Brand Tab */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Configurações da Marca</h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cor Primária (Brand A)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandColors.brandA}
                        onChange={(e) => handleBrandColorsChange({ ...brandColors, brandA: e.target.value })}
                        className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandColors.brandA}
                        onChange={(e) => handleBrandColorsChange({ ...brandColors, brandA: e.target.value })}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="#0B6A6D"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Cor Secundária (Brand B)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandColors.brandB}
                        onChange={(e) => handleBrandColorsChange({ ...brandColors, brandB: e.target.value })}
                        className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandColors.brandB}
                        onChange={(e) => handleBrandColorsChange({ ...brandColors, brandB: e.target.value })}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="#22C55E"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-3">Pré-visualização</h4>
                  <div className="flex gap-4">
                    <div 
                      className="w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: brandColors.brandA }}
                    >
                      A
                    </div>
                    <div 
                      className="w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: brandColors.brandB }}
                    >
                      B
                    </div>
                    <div 
                      className="w-40 h-20 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ background: `linear-gradient(90deg, ${brandColors.brandA}, ${brandColors.brandB})` }}
                    >
                      Gradiente
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Backup e Restauração</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Exportar Dados</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Faça o download de todos os produtos e configurações em formato JSON.
                  </p>
                  <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Download size={16} />
                    Exportar Backup
                  </button>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Importar Dados</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Restaure produtos e configurações a partir de um arquivo de backup.
                  </p>
                  <label className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer">
                    <Upload size={16} />
                    Importar Backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 mt-0.5">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Atenção</h4>
                    <p className="text-sm text-yellow-700">
                      A importação de dados irá sobrescrever as configurações existentes. 
                      Certifique-se de fazer um backup antes de importar novos dados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;