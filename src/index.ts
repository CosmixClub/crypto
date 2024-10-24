export { decrypt } from "./decrypt";
export { encrypt } from "./encrypt";
export * from "./errors";
export { keyBuilder } from "./key-builder";

export type CryptoConfig = {
	keys: string[];
	privacyKey: string;
	privacySalt: string;
};
