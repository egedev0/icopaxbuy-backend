import { getSigner } from "../utils/evm.utils";

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
if (!PRIVATE_KEY) {
  // fail fast in production to avoid non-deterministic random wallet
  if (process.env.NODE_ENV === 'production') {
    throw new Error('PRIVATE_KEY is not set');
  }
}
export const signer = getSigner(PRIVATE_KEY);