import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
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

// --- ORDER & PAYMENT INTERFACES ---
export interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    totalPrice: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    items: OrderItem[];
}

export interface OrderItemDetail {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
}

export interface OrderDetail {
    id: number;
    totalPrice: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    items: OrderItemDetail[];
}

export interface CreateOrderRequest {
    addressId: number;
    paymentMethod: string;
    totalPrice: number;
    items: {
        productId: number;
        quantity: number;
        price?: number;
    }[];
}

export interface CreatePaymentRequest {
    orderId: number;
    amount?: number;
    returnUrl?: string;
    cancelUrl?: string;
    expiredAt?: number;
}

export interface CreatePaymentResponse {
    success: boolean;
    paymentUrl?: string;
    qrCode?: string; // QR code URL từ PayOS
    orderCode?: number;
    orderId?: number;
    amount?: number;
    error?: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    orderId: number;
    orderCode: number;
    isPaid: boolean;
    status: string;
    totalPrice: number;
    paymentMethod: string;
    error?: string;
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

    async sendOtp(email: string): Promise<{ message: string }> {
        try {
            console.log('Sending OTP to:', email);
            // SỬA: Endpoint đổi thành /auth/forgot-password cho khớp với Backend Controller
            const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gửi OTP thất bại');
            }

            return result;
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Lỗi kết nối mạng');
        }
    }

    // 2. Xác nhận OTP và Đổi mật khẩu
    async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
        try {
            console.log('Resetting password for:', data.email);

            // SỬA: Backend Java đang mong đợi field "token" thay vì "otp"
            // Ta map lại dữ liệu trước khi gửi
            const payload = {
                token: data.otp, // Map 'otp' từ UI sang 'token' cho Backend
                newPassword: data.newPassword
            };

            const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Đặt lại mật khẩu thất bại');
            }

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
    // ORDER & PAYMENT APIs
    // ============================================================
    async createOrder(data: CreateOrderRequest): Promise<Order> {
        try {
            console.log('📤 Creating order with full details:');
            console.log('- Address ID:', data.addressId);
            console.log('- Payment Method:', data.paymentMethod);
            console.log('- Total Price:', data.totalPrice);
            console.log('- Items:', JSON.stringify(data.items, null, 2));

            const response = await fetch(`${this.baseUrl}/orders`, {
                method: 'POST',
                headers: await this.getHeaders(true),
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('❌ Order creation failed:', result);
                throw new Error(result.message || 'Failed to create order');
            }

            console.log('✅ Order created successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ createOrder error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async confirmPayment(orderId: number): Promise<{ message: string; status: string }> {
        try {
            console.log(`Confirming payment for Order ID: ${orderId}`);
            const response = await fetch(`${this.baseUrl}/payment/confirm/${orderId}`, {
                method: 'PUT',
                headers: await this.getHeaders(true),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to confirm payment');
            }

            return result;
        } catch (error) {
            console.error('confirmPayment error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
        try {
            console.log('Creating PayOS payment:', data);
            const response = await fetch(`${this.baseUrl}/payment/create`, {
                method: 'POST',
                headers: await this.getHeaders(true),
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create payment');
            }

            // PayOS trả về QR code URL trong field "qrCode"
            console.log('✅ Payment response:', result);

            return result;
        } catch (error) {
            console.error('createPayment error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async verifyPayment(orderCode: number): Promise<VerifyPaymentResponse> {
        try {
            console.log('Verifying payment:', orderCode);
            const response = await fetch(`${this.baseUrl}/payment/verify/${orderCode}`, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to verify payment');
            }

            return result;
        } catch (error) {
            console.error('verifyPayment error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async getPaymentHistory(orderId: number): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/payment/history/${orderId}`, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) {
                throw new Error('Failed to get payment history');
            }

            return await response.json();
        } catch (error) {
            console.error('getPaymentHistory error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async getOrders(): Promise<OrderDetail[]> {
        try {
            const headers = await this.getHeaders(true);
            console.log('🔍 Fetching orders with headers:', headers);

            const response = await fetch(`${this.baseUrl}/orders`, {
                method: 'GET',
                headers: headers,
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`Failed to fetch orders: ${response.status} - ${errorText}`);
            }

            const orders = await response.json();
            console.log('✅ Orders fetched:', orders);

            return orders.map((order: OrderDetail) => ({
                ...order,
                items: order.items.map(item => ({
                    ...item,
                    productImage: this.validateImageUrl(item.productImage) || ''
                }))
            }));
        } catch (error) {
            console.error('💥 getOrders error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    async getOrderDetail(orderId: number): Promise<OrderDetail> {
        try {
            console.log(`🔍 Fetching order detail for ID: ${orderId}`);

            const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
                method: 'GET',
                headers: await this.getHeaders(true),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Order detail error:', errorText);
                throw new Error('Failed to fetch order detail');
            }

            const order = await response.json();

            console.log('📦 Raw order data:', order);
            console.log('📦 Order items:', order.items);

            return {
                ...order,
                items: order.items.map((item: OrderItemDetail) => ({
                    ...item,
                    productImage: this.validateImageUrl(item.productImage) || 'https://via.placeholder.com/60'
                }))
            };
        } catch (error) {
            console.error('💥 getOrderDetail error:', error);
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }


}

export default new ApiService();