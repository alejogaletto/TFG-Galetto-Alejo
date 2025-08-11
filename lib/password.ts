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


