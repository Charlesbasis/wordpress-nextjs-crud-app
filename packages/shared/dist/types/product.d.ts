export interface Product {
    id: number;
    title: string;
    price: number;
    sku: string;
    stock: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    totalPages: number;
}
export interface ProductCreateDto {
    title: string;
    price: number;
    sku: string;
    stock: number;
    status?: 'publish' | 'draft';
    content?: string;
    excerpt?: string;
}
export interface ProductUpdateDto extends Partial<ProductCreateDto> {
    id: number;
}
//# sourceMappingURL=product.d.ts.map