import { Email } from '../value-objects';

type UserRole = 'customer' | 'creator' | 'admin';

class User {
  readonly id: number;
  readonly username: string;
  readonly email: Email;
  readonly role: UserRole;
  readonly createdAt: string;

  constructor(id: number, username: string, email: string, role: UserRole, createdAt: string) {
    this.id = id;
    this.username = username;
    this.email = new Email(email);
    this.role = role; // 'customer', 'creator', 'admin'
    this.createdAt = createdAt;
    Object.freeze(this);
  }

  isCustomer(): boolean {
    return this.role === 'customer';
  }

  isCreator(): boolean {
    return this.role === 'creator';
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  equals(other: User | unknown): boolean {
    return other instanceof User && this.id === other.id;
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      username: this.username,
      email: this.email.toString(),
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}

export { User };