import { getSigner } from "src/utils/evm.utils";

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";

export const signer = getSigner(PRIVATE_KEY);