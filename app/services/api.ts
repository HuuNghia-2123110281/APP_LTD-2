import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.100.127:8080/api';

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    email: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    image: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    rating: number;
    sold: number;
    stock: number;
    category: Category;
}

export interface ErrorResponse {
    message: string;
}

class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('userToken');
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    private async getHeaders(includeAuth: boolean = false): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = await this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private validateImageUrl(url: string | null | undefined): string | null {
        if (!url) return null;

        try {
            const urlObj = new URL(url);
            return urlObj.href;
        } catch {
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            return null;
        }
    }

    async register(data: RegisterRequest): Promise<{ message: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }

            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }

            await AsyncStorage.setItem('userToken', result.token);
            await AsyncStorage.setItem('userEmail', result.email);

            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    async logout(): Promise<void> {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userEmail');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return token !== null;
    }

    async getUserEmail(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('userEmail');
        } catch (error) {
            console.error('Error getting user email:', error);
            return null;
        }
    }

    async getProducts(search?: string): Promise<Product[]> {
        try {
            let url = `${this.baseUrl}/products`;
            if (search) {
                url += `?search=${encodeURIComponent(search)}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const products = await response.json();

            return products.map((product: Product) => ({
                ...product,
                image: this.validateImageUrl(product.image)
            }));
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    async getProductById(id: number): Promise<Product> {
        try {
            const response = await fetch(`${this.baseUrl}/products/${id}`, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }

            const product = await response.json();
            return {
                ...product,
                image: this.validateImageUrl(product.image)
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    async getProductsByCategory(categoryId: number): Promise<Product[]> {
        try {
            const response = await fetch(`${this.baseUrl}/products/category/${categoryId}`, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products by category');
            }

            const products = await response.json();

            return products.map((product: Product) => ({
                ...product,
                image: this.validateImageUrl(product.image)
            }));
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    async getCategories(): Promise<Category[]> {
        try {
            const response = await fetch(`${this.baseUrl}/categories`, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const categories = await response.json();

            return categories.map((category: Category) => ({
                ...category,
                image: this.validateImageUrl(category.image)
            }));
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    async getCategoryById(id: number): Promise<Category> {
        try {
            const response = await fetch(`${this.baseUrl}/categories/${id}`, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch category');
            }

            const category = await response.json();
            return {
                ...category,
                image: this.validateImageUrl(category.image)
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }
    
}

export default new ApiService();