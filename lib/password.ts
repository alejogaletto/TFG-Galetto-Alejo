import bcrypt from "bcryptjs"

export async function hashPassword(plainTextPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plainTextPassword, salt)
}

export async function verifyPassword(
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  // Backward-compatibility: if stored password is not a bcrypt hash, compare directly
  if (!hashedPassword.startsWith("$2")) {
    return plainTextPassword === hashedPassword
  }
  return bcrypt.compare(plainTextPassword, hashedPassword)
}

/**
 * Password policy validation
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special symbol
 */
export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe tener al menos una letra mayúscula")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("La contraseña debe tener al menos un número")
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("La contraseña debe tener al menos un símbolo especial")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get individual password requirements status
 */
export function getPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }
}

