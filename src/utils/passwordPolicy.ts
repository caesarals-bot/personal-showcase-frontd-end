/**
 * Utilidades para validar y verificar políticas de contraseñas
 */

export interface PasswordPolicyResult {
  isValid: boolean;
  score: number;
  feedback: string[];
  strength: 'muy-debil' | 'debil' | 'media' | 'fuerte' | 'muy-fuerte';
}

/**
 * Política de contraseñas actual:
 * - Mínimo 8 caracteres
 * - Al menos una letra mayúscula
 * - Al menos un número
 */
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: false, // Opcional pero recomendado
} as const;

/**
 * Valida si una contraseña cumple con la política establecida
 */
export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const feedback: string[] = [];
  let score = 0;

  // Verificar longitud mínima
  if (password.length >= PASSWORD_POLICY.minLength) {
    score += 1;
  } else {
    feedback.push(`Al menos ${PASSWORD_POLICY.minLength} caracteres`);
  }

  // Verificar letra mayúscula
  if (PASSWORD_POLICY.requireUppercase && /[A-Z]/.test(password)) {
    score += 1;
  } else if (PASSWORD_POLICY.requireUppercase) {
    feedback.push('Una letra mayúscula');
  }

  // Verificar número
  if (PASSWORD_POLICY.requireNumber && /[0-9]/.test(password)) {
    score += 1;
  } else if (PASSWORD_POLICY.requireNumber) {
    feedback.push('Un número');
  }

  // Verificar carácter especial (opcional pero suma puntos)
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  // Determinar fortaleza
  const strength = score === 0 ? 'muy-debil' : 
                  score === 1 ? 'debil' : 
                  score === 2 ? 'media' : 
                  score === 3 ? 'fuerte' : 'muy-fuerte';

  // La contraseña es válida si cumple con todos los requisitos obligatorios
  const isValid = password.length >= PASSWORD_POLICY.minLength &&
                  (!PASSWORD_POLICY.requireUppercase || /[A-Z]/.test(password)) &&
                  (!PASSWORD_POLICY.requireNumber || /[0-9]/.test(password));

  return {
    isValid,
    score,
    feedback,
    strength
  };
}

/**
 * Verifica si una contraseña necesita ser actualizada según las políticas actuales
 */
export function needsPasswordUpdate(password: string): boolean {
  const result = validatePasswordPolicy(password);
  return !result.isValid;
}

/**
 * Genera sugerencias para mejorar la fortaleza de la contraseña
 */
export function getPasswordSuggestions(password: string): string[] {
  const suggestions: string[] = [];
  
  if (password.length < 12) {
    suggestions.push('Considera usar al menos 12 caracteres para mayor seguridad');
  }
  
  if (!/[a-z]/.test(password)) {
    suggestions.push('Añade letras minúsculas');
  }
  
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Añade letras mayúsculas');
  }
  
  if (!/[0-9]/.test(password)) {
    suggestions.push('Añade números');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    suggestions.push('Considera añadir caracteres especiales (!@#$%^&*)');
  }
  
  // Verificar patrones comunes débiles
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Evita repetir el mismo carácter consecutivamente');
  }
  
  if (/123|abc|qwe/i.test(password)) {
    suggestions.push('Evita secuencias obvias como "123" o "abc"');
  }
  
  return suggestions;
}

/**
 * Calcula el tiempo estimado para romper la contraseña (simplificado)
 */
export function estimateCrackTime(password: string): string {
  const charset = getCharsetSize(password);
  const entropy = Math.log2(Math.pow(charset, password.length));
  
  if (entropy < 30) return 'Menos de 1 segundo';
  if (entropy < 40) return 'Menos de 1 minuto';
  if (entropy < 50) return 'Menos de 1 hora';
  if (entropy < 60) return 'Menos de 1 día';
  if (entropy < 70) return 'Menos de 1 mes';
  if (entropy < 80) return 'Menos de 1 año';
  return 'Más de 100 años';
}

function getCharsetSize(password: string): number {
  let size = 0;
  
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^A-Za-z0-9]/.test(password)) size += 32; // Aproximación de caracteres especiales
  
  return size;
}