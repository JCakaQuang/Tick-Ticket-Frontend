'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '../types';

interface CartContextType {
  activeOrder: Order | null;
  secondsRemaining: number;
  setActiveOrder: (order: Order | null) => void;
  clearCart: () => void;
  formatCountdown: (seconds: number) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOrder, setActiveOrderState] = useState<Order | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    const savedOrder = localStorage.getItem('activeOrder');
    if (savedOrder) {
      try {
        const parsed: Order = JSON.parse(savedOrder);
        const exp = parsed.reservationExpiresAt || (parsed as any).expiresAt;
        if (exp) {
          const diff = Math.floor((new Date(exp).getTime() - Date.now()) / 1000);
          if (diff > 0) {
            setActiveOrderState(parsed);
            setSecondsRemaining(diff);
          } else {
            localStorage.removeItem('activeOrder');
          }
        }
      } catch (e) {
        localStorage.removeItem('activeOrder');
      }
    }
  }, []);

  useEffect(() => {
    const exp = activeOrder?.reservationExpiresAt || (activeOrder as any)?.expiresAt;
    if (!activeOrder || !exp) {
      setSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const currentExp = activeOrder.reservationExpiresAt || (activeOrder as any).expiresAt;
      const diff = Math.floor((new Date(currentExp!).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setSecondsRemaining(0);
        setActiveOrderState(null);
        localStorage.removeItem('activeOrder');
        clearInterval(interval);
      } else {
        setSecondsRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  const setActiveOrder = (order: Order | null) => {
    const exp = order?.reservationExpiresAt || (order as any)?.expiresAt;
    if (order && exp) {
      const normalizedOrder = {
        ...order,
        reservationExpiresAt: exp,
      };
      setActiveOrderState(normalizedOrder);
      const diff = Math.floor((new Date(exp).getTime() - Date.now()) / 1000);
      setSecondsRemaining(diff > 0 ? diff : 0);
      localStorage.setItem('activeOrder', JSON.stringify(normalizedOrder));
    } else {
      setActiveOrderState(order);
      setSecondsRemaining(0);
      localStorage.removeItem('activeOrder');
    }
  };


  const clearCart = () => {
    setActiveOrderState(null);
    setSecondsRemaining(0);
    localStorage.removeItem('activeOrder');
  };

  const formatCountdown = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return '00:00';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <CartContext.Provider
      value={{
        activeOrder,
        secondsRemaining,
        setActiveOrder,
        clearCart,
        formatCountdown,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};