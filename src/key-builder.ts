import * as crypto from "node:crypto";

/**
 * Gera uma chave derivada usando Argon2 para maior segurança, baseada em partes
 * do sistema fornecidas como entrada.
 *
 * @param {string} privacyKey - A chave de privacidade usada para derivar a chave.
 * @param {string} privacySalt - O sal de privacidade usado para derivar a chave.
 * @param {...string} content - As partes do sistema que serão combinadas para formar a chave.
 * @returns {string} - A chave de criptografia em formato Base64.
 */
export const keyBuilder = (privacyKey: string, privacySalt: string, ...content: string[]): string => {
	if (!privacyKey || privacyKey.length < 32) {
		throw new Error("A chave de privacidade deve ter pelo menos 32 caracteres.");
	}
	if (!privacySalt || privacySalt.length < 16) {
		throw new Error("O sal de privacidade deve ter pelo menos 16 caracteres.");
	}

	const dynamicSalt = content.join("::"); // Sal dinâmico gerado a partir do contexto
	const salt = `${privacySalt}::${dynamicSalt}`; // Sal dinâmico com parte aleatória

	// Utilizando Argon2 para derivação de chave
	const key = crypto.scryptSync(privacyKey, salt, 32);
	return key.toString("base64");
};
