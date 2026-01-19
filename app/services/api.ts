import AsyncStorage from '@react-native-async-storage/async-storage';

// LƯU Ý: Nếu bạn đang chạy Backend trên máy tính (Localhost) để test tính năng thanh toán mới,
// hãy đổi URL này thành IP máy tính của bạn (ví dụ: http://192.168.1.5:8080/api).
// Nếu Backend trên Railway đã được update code mới thì giữ nguyên.
const API_URL = 'https://ltd-be-production.up.railway.app/api';

// --- AUTH INTERFACES ---
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

// --- PRODUCT INTERFACES ---
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

// --- CART INTERFACES ---
export interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    price: number;
    cart?: CartItem | null;
}

export interface CartResponse {
    cartId: number | null;
    items: CartItem[] | null;
    totalItems: number;
    totalPrice: number;
}

export interface AddToCartRequest {
    productId: number;
    quantity: number;
}

// --- ADDRESS INTERFACES ---
export interface Address {
    id: number;
    receiverName: string;
    phone: string;
    address: string;
    isDefault: boolean;
}

export interface ErrorResponse {
    message: string;
}

// --- ORDER & PAYMENT INTERFACES (MỚI) ---
export interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    totalPrice: number;
    status: string; // PENDING, PAID, CANCELLED
    paymentMethod: string;
    createdAt: string;
    items: OrderItem[];
}

export interface CreateOrderRequest {
    addressId: number;
    paymentMethod: string; // TCB, MOMO, ZALOPAY, COD
    totalPrice: number;    
    items: { productId: number; quantity: number }[];
}

class ApiService {
    private baseUrl: string;
    private maxRetries: number = 3;

    constructor() {
        this.baseUrl = API_URL;
    }

    private async getToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem('userToken');
            // console.log('Retrieved token:', token ? `${token.substring(0, 20)}...` : 'null');
            return token;
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
            } else {
                console.warn('No token available for authenticated request');
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

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================================
    // AUTH APIs
    // ============================================================
    async register(data: RegisterRequest): Promise<{ message: string }> {
        try {
            console.log('Registering user:', data.email);
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
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            console.log('Logging in user:', data.email);
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
            console.log('Login successful, token saved');

            return result;
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async logout(): Promise<void> {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userEmail');
            console.log('Logout successful');
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

    // ============================================================
    // PRODUCT APIs
    // ============================================================
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
            if (error instanceof Error) throw error;
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
            if (error instanceof Error) throw error;
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
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    // ============================================================
    // CATEGORY APIs
    // ============================================================
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
            if (error instanceof Error) throw error;
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
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    // ============================================================
    // CART APIs
    // ============================================================
    async getCart(): Promise<CartResponse> {
        try {
            // console.log('Fetching cart items from API...');
            const headers = await this.getHeaders(true);

            const response = await fetch(`${this.baseUrl}/cart-items`, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Cart items fetch error:', errorText);
                throw new Error('Failed to fetch cart items');
            }

            const cartItems: CartItem[] = await response.json();
            // console.log('Raw cart items response:', JSON.stringify(cartItems, null, 2));

            const totalItems = cartItems.length;
            const totalPrice = cartItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            const cartId = cartItems.length > 0 ? cartItems[0].cart?.id || null : null;

            const result: CartResponse = {
                cartId: cartId,
                items: cartItems,
                totalItems: totalItems,
                totalPrice: totalPrice
            };

            return result;
        } catch (error) {
            console.error('getCart error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async addToCart(data: AddToCartRequest): Promise<{ message: string; cartVerified: boolean }> {
        try {
            console.log('Adding to cart:', data);
            const headers = await this.getHeaders(true);

            const response = await fetch(`${this.baseUrl}/cart/add`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to add to cart');
            }

            // RETRY MECHANISM
            // console.log('Verifying cart update with retry mechanism...');
            let attempts = 0;
            let cartHasItems = false;

            while (attempts < this.maxRetries && !cartHasItems) {
                attempts++;
                await this.delay(800 * attempts);
                const cartCheck = await this.getCart();
                if (cartCheck.items && cartCheck.items.length > 0) {
                    cartHasItems = true;
                }
            }

            return {
                message: result.message || 'Đã thêm vào giỏ hàng',
                cartVerified: cartHasItems
            };
        } catch (error) {
            console.error('addToCart error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async updateCartItem(cartItemId: number, quantity: number): Promise<{ message: string }> {
        try {
            console.log(`Updating cart item ${cartItemId} to quantity ${quantity}`);
            const response = await fetch(`${this.baseUrl}/cart/update/${cartItemId}`, {
                method: 'PUT',
                headers: await this.getHeaders(true),
                body: JSON.stringify({ quantity }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update cart');
            }

            await this.delay(500);
            return result;
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async removeFromCart(cartItemId: number): Promise<{ message: string }> {
        try {
            console.log(`Removing cart item ${cartItemId}`);
            const response = await fetch(`${this.baseUrl}/cart/remove/${cartItemId}`, {
                method: 'DELETE',
                headers: await this.getHeaders(true),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to remove from cart');
            }

            await this.delay(500);
            return result;
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async clearCart(): Promise<{ message: string }> {
        try {
            console.log('Clearing cart');
            const response = await fetch(`${this.baseUrl}/cart/clear`, {
                method: 'DELETE',
                headers: await this.getHeaders(true),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to clear cart');
            }

            return result;
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    // ============================================================
    // ADDRESS APIs
    // ============================================================
    async getAddresses(): Promise<Address[]> {
        try {
            const response = await fetch(`${this.baseUrl}/addresses`, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) throw new Error('Failed to fetch addresses');
            return await response.json();
        } catch (error) {
            console.error('getAddresses error:', error);
            throw error;
        }
    }

    async addAddress(data: Omit<Address, 'id'>): Promise<Address> {
        try {
            const response = await fetch(`${this.baseUrl}/addresses`, {
                method: 'POST',
                headers: await this.getHeaders(true),
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to add address');
            return await response.json();
        } catch (error) {
            console.error('addAddress error:', error);
            throw error;
        }
    }

    async updateAddress(id: number, data: Omit<Address, 'id'>): Promise<Address> {
        try {
            const response = await fetch(`${this.baseUrl}/addresses/${id}`, {
                method: 'PUT',
                headers: await this.getHeaders(true),
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update address');
            return await response.json();
        } catch (error) {
            console.error('updateAddress error:', error);
            throw error;
        }
    }

    async deleteAddress(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/addresses/${id}`, {
                method: 'DELETE',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) throw new Error('Failed to delete address');
        } catch (error) {
            console.error('deleteAddress error:', error);
            throw error;
        }
    }

    // ============================================================
    // ORDER & PAYMENT APIs (MỚI)
    // ============================================================

    // 1. Tạo đơn hàng (Trạng thái PENDING)
    async createOrder(data: CreateOrderRequest): Promise<Order> {
        try {
            console.log('Creating order:', JSON.stringify(data, null, 2));
            const response = await fetch(`${this.baseUrl}/orders`, {
                method: 'POST',
                headers: await this.getHeaders(true),
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create order');
            }

            return result;
        } catch (error) {
            console.error('createOrder error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    // 2. Lấy chi tiết đơn hàng (Dùng để polling kiểm tra trạng thái)
    async getOrderDetail(orderId: number): Promise<Order> {
        try {
            const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order detail');
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }
}

export default new ApiService();