// E-commerce API service layer
const BASE_URL = 'https://e-commarce-3rq4.onrender.com';

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  userId: string;
}

export interface Order {
  _id: string;
  user: string;
  products: Array<{
    product: Product;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Authentication
  async register(userData: { name: string; email: string; password: string }) {
    const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  }

  async logout() {
    const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    this.token = null;
    localStorage.removeItem('authToken');
    
    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${BASE_URL}/api/v1/product/all`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    return data.products || [];
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${BASE_URL}/api/v1/product/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Cart
  async addToCart(productId: string, quantity: number = 1) {
    const response = await fetch(`${BASE_URL}/api/v1/cart/add`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    return response.json();
  }

  async getCart(): Promise<CartItem[]> {
    const response = await fetch(`${BASE_URL}/api/v1/cart`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    return data.cartItems || [];
  }

  async removeFromCart(itemId: string) {
    const response = await fetch(`${BASE_URL}/api/v1/cart/${itemId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Orders
  async createOrder(orderData: any) {
    const response = await fetch(`${BASE_URL}/api/v1/order/create-order`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });
    return response.json();
  }

  async getAllOrders(): Promise<Order[]> {
    const response = await fetch(`${BASE_URL}/api/v1/order/all`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const data = await response.json();
    return data.orders || [];
  }

  // Payment
  async initializePayment(paymentData: any) {
    const response = await fetch(`${BASE_URL}/api/v1/payment/init`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return response.json();
  }
}

export const apiService = new ApiService();