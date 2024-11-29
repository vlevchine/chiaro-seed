import { hash, verify } from "@node-rs/argon2";
import crypto from 'crypto';
//import { encodeBase64, decodeBase64} from "@oslojs/encoding";
//import { Base32Encoding } from "@oslo/encoding";
//  import { Base32Encoding, // encodeBase32LowerCaseNoPadding,encodeHexLowerCase,} from "@oslo/";
const dynamicImport = new Function("specifier", "return import(specifier)");

export async function generateSessionToken(id: string): Promise<string> {
    const bytes: Uint8Array = new TextEncoder().encode(id);
    const oslo: any = await dynamicImport("@oslojs/encoding");
    //encodeHexLowerCase(sha256(bytes));
    const encoded = oslo.encodeHexLowerCase(bytes);//encodeBase64
  return encoded;
}

export async function getIdFromToken(token: string) {
    const oslo = await dynamicImport("@oslojs/encoding");
    const decoded = oslo.decodeHex(token);//decodeBase64
    return new TextDecoder().decode(decoded); 
}


export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return verify(hash, password);
}
