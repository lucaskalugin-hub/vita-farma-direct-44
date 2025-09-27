import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  category: string;
  name: string;
  subtitle: string;
  description: string[];
  doses: Array<{
    value: string;
    label: string;
    price: number;
    image: string;
    unavailable?: boolean;
  }>;
  forma_options?: Array<{
    value: string;
    label: string;
    priceAdd: number;
  }>;
  requires_prescription: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandSettings {
  id: string;
  brand_a_color: string;
  brand_b_color: string;
  updated_at: string;
}

export class AdminDatabaseService {
  private static instance: AdminDatabaseService;

  static getInstance(): AdminDatabaseService {
    if (!AdminDatabaseService.instance) {
      AdminDatabaseService.instance = new AdminDatabaseService();
    }
    return AdminDatabaseService.instance;
  }

  // Produtos
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          ...product,
          description: JSON.stringify(product.description),
          doses: JSON.stringify(product.doses),
          forma_options: product.forma_options ? JSON.stringify(product.forma_options) : null
        }]);

      if (error) {
        console.error('Erro ao criar produto:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { ...product };
      
      if (product.description) {
        updateData.description = JSON.stringify(product.description);
      }
      if (product.doses) {
        updateData.doses = JSON.stringify(product.doses);
      }
      if (product.forma_options) {
        updateData.forma_options = JSON.stringify(product.forma_options);
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar produto:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  async toggleProductStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        console.error('Erro ao alterar status do produto:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Configurações da marca
  async getBrandSettings(): Promise<BrandSettings | null> {
    try {
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações da marca:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar configurações da marca:', error);
      return null;
    }
  }

  async updateBrandSettings(settings: { brand_a_color: string; brand_b_color: string }): Promise<{ success: boolean; error?: string }> {
    try {
      // Primeiro, tentar buscar configuração existente
      const { data: existing } = await supabase
        .from('brand_settings')
        .select('id')
        .limit(1)
        .single();

      let result;
      if (existing) {
        // Atualizar existente
        result = await supabase
          .from('brand_settings')
          .update(settings)
          .eq('id', existing.id);
      } else {
        // Criar nova
        result = await supabase
          .from('brand_settings')
          .insert([settings]);
      }

      if (result.error) {
        console.error('Erro ao atualizar configurações da marca:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar configurações da marca:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Backup e Restore
  async exportData(): Promise<{ products: Product[]; brandSettings: BrandSettings | null }> {
    const products = await this.getProducts();
    const brandSettings = await this.getBrandSettings();
    
    return { products, brandSettings };
  }

  async importData(data: { products?: Product[]; brandSettings?: BrandSettings }): Promise<{ success: boolean; error?: string }> {
    try {
      // Importar produtos
      if (data.products && data.products.length > 0) {
        const { error: productsError } = await supabase
          .from('products')
          .upsert(data.products.map(p => ({
            ...p,
            description: JSON.stringify(p.description),
            doses: JSON.stringify(p.doses),
            forma_options: p.forma_options ? JSON.stringify(p.forma_options) : null
          })));

        if (productsError) {
          console.error('Erro ao importar produtos:', productsError);
          return { success: false, error: productsError.message };
        }
      }

      // Importar configurações da marca
      if (data.brandSettings) {
        const result = await this.updateBrandSettings({
          brand_a_color: data.brandSettings.brand_a_color,
          brand_b_color: data.brandSettings.brand_b_color
        });

        if (!result.success) {
          return result;
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }
}

export const adminDB = AdminDatabaseService.getInstance();