// src/services/wordpress.ts

const WC_URL = (import.meta as any).env.VITE_WC_URL || '';
const CONSUMER_KEY = (import.meta as any).env.VITE_WC_CONSUMER_KEY || '';
const CONSUMER_SECRET = (import.meta as any).env.VITE_WC_CONSUMER_SECRET || '';

const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);

export interface Product {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: { src: string; alt: string }[];
  categories: { id: number; name: string }[];
  attributes: { name: string; options: string[] }[];
}

export const fetchProducts = async (): Promise<Product[]> => {
  if (!WC_URL || !CONSUMER_KEY) return [];
  
  try {
    const response = await fetch(`${WC_URL}/wp-json/wc/v3/products?per_page=20`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('WooCommerce Fetch Error:', error);
    return [];
  }
};

export const createOrder = async (orderData: any) => {
  if (!WC_URL || !CONSUMER_KEY) return null;

  try {
    const response = await fetch(`${WC_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return await response.json();
  } catch (error) {
    console.error('WooCommerce Order Error:', error);
    return null;
  }
};

// SEO Helper: Fetch WordPress Page/Post Meta
export const fetchPageMeta = async (slug: string) => {
  if (!WC_URL) return null;
  
  try {
    const response = await fetch(`${WC_URL}/wp-json/wp/v2/pages?slug=${slug}`);
    if (!response.ok) throw new Error('Failed to fetch page meta');
    const pages = await response.json();
    return pages[0] || null;
  } catch (error) {
    console.error('WordPress Meta Error:', error);
    return null;
  }
};
