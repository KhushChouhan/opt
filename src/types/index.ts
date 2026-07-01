export interface ProductSku {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: 'glasses' | 'sunglasses' | 'watches';
  stock: number;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  logoSrc: string;
  description: string;
  featuredSkus: ProductSku[];
  accentColor: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  location: string;
  stars: number;
  avatarSrc: string;
}

export interface UGCTile {
  id: string;
  imageSrc: string;
  customerName: string;
  productName: string;
  productHref: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'glasses' | 'sunglasses' | 'watches';
  price: number;
  description: string;
  image_url: string;
  overlay_image_url: string;
  stock: number;
  mrp?: number; // Original retail price for discount display
  discount?: number;
  specs?: {
    frameWidth?: string;
    lensWidth?: string;
    lugWidth?: string;
    material?: string;
    warranty?: string;
  };
}
