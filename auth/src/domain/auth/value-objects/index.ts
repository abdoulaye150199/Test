/**
 * Value Objects pour le domaine d'authentification
 * Encapsulent la logique métier complexe (validation, hashing, etc.)
 */

import { passwordSchema } from '../schemas';
import { AUTH_CONFIG } from '../../../config/authConfig';

/**
 * Email Value Object - Valide et normalise les adresses email
 */
class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email format');
    }
    this.value = value.trim().toLowerCase();
    Object.freeze(this);
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: any): boolean {
    return other instanceof Email && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Hash Value Object - Représente une valeur hachée en base64
 */
class Hash {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static fromUint8Array(data: Uint8Array): Hash {
    const base64 = btoa(String.fromCharCode(...data));
    return new Hash(base64);
  }

  static fromBase64(base64: string): Hash {
    return new Hash(base64);
  }

  getBase64(): string {
    return this.value;
  }

  toUint8Array(): Uint8Array {
    const binary = atob(this.value);
    const result = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      result[i] = binary.charCodeAt(i);
    }
    return result;
  }

  equals(other: Hash): boolean {
    return this.value === other.value;
  }
}

/**
 * Password Value Object - Gère hachage PBKDF2 et validation
 */
class Password {
  private readonly value: string;
  private readonly hash?: Hash;
  private readonly salt?: Hash;

  constructor(value: string, hash?: Hash, salt?: Hash) {
    this.value = passwordSchema.parse(value);
    this.hash = hash;
    this.salt = salt;
    Object.freeze(this);
  }

  async equals(other: Password): Promise<boolean> {
    if (!(other instanceof Password)) {
      return false;
    }
    if (!this.hash && !other.hash) {
      return this.value === other.value;
    }
    if (this.hash && other.value) {
      const hashedOther = await Password.hashPassword(other.value, this.salt);
      return this.hash.equals(hashedOther.hash);
    }

    if (this.hash && other.hash) {
      return this.hash.equals(other.hash);
    }

    return false;
  }

  toString(): string {
    return this.value;
  }

  getHash(): Hash | undefined {
    return this.hash;
  }

  getSalt(): Hash | undefined {
    return this.salt;
  }

  static async hashPassword(password: string, customSalt?: Hash): Promise<{ hash: Hash; salt: Hash }> {
    try {
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);

      let saltBuffer: ArrayBuffer;
      let saltArray: Uint8Array;
      if (customSalt) {
        saltArray = customSalt.toUint8Array();
        saltBuffer = saltArray.buffer as ArrayBuffer;
      } else {
        saltBuffer = new ArrayBuffer(16);
        saltArray = new Uint8Array(saltBuffer);
        crypto.getRandomValues(saltArray);
      }

      const key = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: AUTH_CONFIG.password.iterations,
          hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);
      const hashArray = new Uint8Array(exportedKey);
      const hash = Hash.fromUint8Array(hashArray);
      const salt = customSalt || Hash.fromUint8Array(saltArray);

      return { hash, salt };
    } catch (error) {
      throw new Error('Impossible de hasher le mot de passe');
    }
  }

  static async createHashed(plainTextPassword: string): Promise<Password> {
    const { hash, salt } = await Password.hashPassword(plainTextPassword);
    return new Password(plainTextPassword, hash, salt);
  }

  static createFromHash(hash: Hash, salt: Hash): Password {
    return new Password('', hash, salt);
  }
}

export { Email, Hash, Password };
