import { getSigner } from "src/utils/evm.utils";


const PRIVATE_KEY = "e81f4bec5987652f8e7641b58dd2dc3a2a6774911093713e878d07fb5819b903";

export const signer = getSigner(PRIVATE_KEY);