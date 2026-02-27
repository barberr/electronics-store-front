// types/product.ts
export interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    parent: number | null;
    description: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProductImage {
    id: number;
    image: string;
    alt_text: string;
    order: number;
}

export interface ProductVariant {
    id: number;
    sku: string | null;
    attributes: Record<string, string>;
    price: string;
    old_price: string | null;
    is_active: boolean;
    stock: number | null;
}

// =============== ОСНОВНОЙ ТИП ТОВАРА ===============
export interface Product {
    id: number;
    name: string;
    slug: string;

    brand: Brand;
    category: Category;

    short_description: string;
    description: string;
    seo_title: string;
    seo_description: string;

    is_active: boolean;
    is_preorder: boolean;
    delivery_text: string;
    warranty_months: number;

    created_at: string; // ISO дата
    updated_at: string; // ISO дата

    images: ProductImage[]; // Может быть пустым []
    variants: ProductVariant[]; // Может быть пустым []

    // Свойства для удобства (можно вычислять)
    min_price?: number;
    max_price?: number;
    total_stock?: number;
    is_in_stock?: boolean;
    has_variants?: boolean;
}

// Дополнительные типы для API ответов
export interface CategoryResponse {
    id: number;
    name: string;
    slug: string;
    description?: string;
    products?: Product[]; // Если API возвращает товары внутри категории
}

export interface ProductListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
}

export interface BrandResponse {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
}

export interface HeroBlock {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    status: string;
    is_active: boolean;
    order: number;
    published_at: string; // ISO 8601 datetime
    created_at: string;
    updated_at: string;
    product?: number;
    product_slug?: string;
    product_name?: string;
    video_mp4?: string;        // ← добавлено
    image?: string;
    background_image?: string;
    background_color: string;
    text_color: string;
    button_text?: string;
    button_link?: string;
}

export interface HeroBlockResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: HeroBlock[];
}


