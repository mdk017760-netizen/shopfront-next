import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const items = await apiService.getCart();
      setCartItems(items);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.addToCart(productId, quantity);
      await refreshCart();
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await apiService.removeFromCart(itemId);
      await refreshCart();
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    
    // Note: This would need to be implemented in the API
    // For now, we'll remove and re-add with new quantity
    try {
      const item = cartItems.find(item => item._id === itemId);
      if (item) {
        await apiService.removeFromCart(itemId);
        await apiService.addToCart(item.product._id, quantity);
        await refreshCart();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getTotalItems,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};