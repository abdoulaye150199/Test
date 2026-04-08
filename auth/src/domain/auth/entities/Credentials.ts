import { Email, Password } from '../value-objects';

class Credentials {
  readonly email: Email;
  readonly password: Password;

  constructor(email: string, password: string) {
    this.email = new Email(email);
    this.password = new Password(password);
    Object.freeze(this);
  }

  async equals(other: any): Promise<boolean> {
    if (!(other instanceof Credentials)) return false;
    const emailEqual = this.email.equals(other.email);
    const passwordEqual = await this.password.equals(other.password);
    return emailEqual && passwordEqual;
  }

  toJSON(): Record<string, string> {
    return {
      email: this.email.toString(),
      password: this.password.toString(),
    };
  }
}

export { Credentials };