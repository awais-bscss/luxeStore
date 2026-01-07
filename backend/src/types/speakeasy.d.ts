declare module 'speakeasy' {
  export interface GenerateSecretOptions {
    length?: number;
    name?: string;
    issuer?: string;
  }

  export interface GeneratedSecret {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url?: string;
  }

  export interface TotpVerifyOptions {
    secret: string;
    encoding?: string;
    token: string;
    window?: number;
  }

  export interface TotpOptions {
    secret: string;
    encoding?: string;
  }

  export function generateSecret(options?: GenerateSecretOptions): GeneratedSecret;
  export function totp(options: TotpOptions): string;
  export namespace totp {
    function verify(options: TotpVerifyOptions): boolean;
  }
}
