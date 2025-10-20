/**
 * Hook para implementar rate limiting en formularios
 * Previene spam y abuso limitando la frecuencia de envíos
 */

import { useState, useEffect, useCallback } from 'react';

interface RateLimitConfig {
  /** Número máximo de intentos permitidos */
  maxAttempts: number;
  /** Ventana de tiempo en milisegundos */
  windowMs: number;
  /** Tiempo de bloqueo después de exceder el límite (en milisegundos) */
  blockDurationMs?: number;
}

interface RateLimitState {
  /** Si el usuario está actualmente bloqueado */
  isBlocked: boolean;
  /** Número de intentos restantes */
  attemptsRemaining: number;
  /** Tiempo restante de bloqueo en segundos */
  timeRemaining: number;
  /** Función para verificar si se puede hacer un intento */
  canAttempt: () => boolean;
  /** Función para registrar un intento */
  recordAttempt: () => void;
  /** Función para resetear el contador */
  reset: () => void;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutos
  blockDurationMs: 30 * 60 * 1000, // 30 minutos
};

/**
 * Hook para implementar rate limiting
 * @param key - Clave única para identificar el rate limit (ej: 'contact-form')
 * @param config - Configuración del rate limiting
 */
export function useRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
): RateLimitState {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const storageKey = `rateLimit_${key}`;

  const [isBlocked, setIsBlocked] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(finalConfig.maxAttempts);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Cargar estado desde localStorage
  const loadState = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const data = JSON.parse(stored);
      const now = Date.now();

      // Si ha pasado la ventana de tiempo, resetear
      if (now - data.firstAttempt > finalConfig.windowMs) {
        localStorage.removeItem(storageKey);
        return null;
      }

      // Si está bloqueado, verificar si el bloqueo ha expirado
      if (data.blockedUntil && now < data.blockedUntil) {
        return {
          attempts: data.attempts,
          firstAttempt: data.firstAttempt,
          blockedUntil: data.blockedUntil,
          isBlocked: true,
        };
      }

      // Si el bloqueo ha expirado, resetear
      if (data.blockedUntil && now >= data.blockedUntil) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return {
        attempts: data.attempts,
        firstAttempt: data.firstAttempt,
        blockedUntil: null,
        isBlocked: false,
      };
    } catch {
      localStorage.removeItem(storageKey);
      return null;
    }
  }, [storageKey, finalConfig.windowMs]);

  // Guardar estado en localStorage
  const saveState = useCallback((attempts: number, firstAttempt: number, blockedUntil?: number) => {
    const data = {
      attempts,
      firstAttempt,
      blockedUntil: blockedUntil || null,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey]);

  // Actualizar estado basado en localStorage
  const updateState = useCallback(() => {
    const state = loadState();
    
    if (!state) {
      setIsBlocked(false);
      setAttemptsRemaining(finalConfig.maxAttempts);
      setTimeRemaining(0);
      return;
    }

    const remaining = finalConfig.maxAttempts - state.attempts;
    setAttemptsRemaining(Math.max(0, remaining));
    setIsBlocked(state.isBlocked);

    if (state.blockedUntil) {
      const timeLeft = Math.max(0, Math.ceil((state.blockedUntil - Date.now()) / 1000));
      setTimeRemaining(timeLeft);
    } else {
      setTimeRemaining(0);
    }
  }, [loadState, finalConfig.maxAttempts]);

  // Verificar si se puede hacer un intento
  const canAttempt = useCallback(() => {
    const state = loadState();
    if (!state) return true;
    
    if (state.blockedUntil && Date.now() < state.blockedUntil) {
      return false;
    }

    return state.attempts < finalConfig.maxAttempts;
  }, [loadState, finalConfig.maxAttempts]);

  // Registrar un intento
  const recordAttempt = useCallback(() => {
    const now = Date.now();
    const state = loadState();

    if (!state) {
      // Primer intento
      saveState(1, now);
      setAttemptsRemaining(finalConfig.maxAttempts - 1);
      return;
    }

    const newAttempts = state.attempts + 1;
    
    if (newAttempts >= finalConfig.maxAttempts) {
      // Bloquear usuario
      const blockedUntil = now + (finalConfig.blockDurationMs || finalConfig.windowMs);
      saveState(newAttempts, state.firstAttempt, blockedUntil);
      setIsBlocked(true);
      setTimeRemaining(Math.ceil((finalConfig.blockDurationMs || finalConfig.windowMs) / 1000));
    } else {
      saveState(newAttempts, state.firstAttempt);
    }

    setAttemptsRemaining(Math.max(0, finalConfig.maxAttempts - newAttempts));
  }, [loadState, saveState, finalConfig]);

  // Resetear contador
  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setIsBlocked(false);
    setAttemptsRemaining(finalConfig.maxAttempts);
    setTimeRemaining(0);
  }, [storageKey, finalConfig.maxAttempts]);

  // Actualizar estado al montar y cada segundo si está bloqueado
  useEffect(() => {
    updateState();
    
    let interval: NodeJS.Timeout;
    if (isBlocked && timeRemaining > 0) {
      interval = setInterval(() => {
        updateState();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [updateState, isBlocked, timeRemaining]);

  return {
    isBlocked,
    attemptsRemaining,
    timeRemaining,
    canAttempt,
    recordAttempt,
    reset,
  };
}