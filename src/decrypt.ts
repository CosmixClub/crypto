import * as crypto from "node:crypto";

import type { CryptoConfig } from ".";
import { DecryptionFailedError, InvalidAuthTagError, InvalidCiphertextError, InvalidIVError } from "./errors";
import { keyBuilder } from "./key-builder";

export const decrypt = (config: CryptoConfig) => {
	// Deriva a chave de descriptografia usando a privacyKey e os demais parâmetros do config
	const key = keyBuilder(config.privacyKey, config.privacySalt, ...(config.keys || []));

	/**
	 * Função interna para descriptografar uma string criptografada no formato JSON usando o algoritmo AES-256-GCM.
	 *
	 * @param {string} content - O conteúdo que será descriptografado.
	 * @returns {string} - A string descriptografada.
	 * @throws {DecryptionFailedError} - Lança um erro se a verificação de integridade falhar.
	 */
	const algo = (content: string): string => {
		let parsedData;
		try {
			// Parse do JSON para extrair IV, ciphertext e AuthTag
			parsedData = JSON.parse(content);
		} catch {
			throw new InvalidCiphertextError("Falha ao parsear o conteúdo criptografado.");
		}

		const { authTag: authTagHex, encryptedData: encryptedHex, iv } = parsedData;

		// Conversão de IV, ciphertext e AuthTag para Buffer
		let ivBuffer: Buffer;
		let encryptedBuffer: Buffer;
		let authTagBuffer: Buffer;

		try {
			ivBuffer = Buffer.from(iv, "hex");
		} catch {
			throw new InvalidIVError("Falha ao converter IV para Buffer.");
		}

		try {
			encryptedBuffer = Buffer.from(encryptedHex, "hex");
		} catch {
			throw new InvalidCiphertextError("Falha ao converter ciphertext para Buffer.");
		}

		try {
			authTagBuffer = Buffer.from(authTagHex, "hex");
		} catch {
			throw new InvalidAuthTagError("Falha ao converter AuthTag para Buffer.");
		}

		const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "base64"), ivBuffer);
		decipher.setAuthTag(authTagBuffer);

		let decrypted: string;
		try {
			decrypted = decipher.update(encryptedBuffer, undefined, "utf8");
			decrypted += decipher.final("utf8");
		} catch {
			throw new DecryptionFailedError("Falha na descriptografia. O AuthTag ou o ciphertext pode estar inválido.");
		}

		return decrypted;
	};

	/**
	 * Descriptografa uma string criptografada no formato JSON usando o algoritmo AES-256-GCM.
	 *
	 * @param {string} content - O conteúdo que será descriptografado.
	 * @returns {string} - A string descriptografada.
	 * @throws {DecryptionFailedError} - Lança um erro se a verificação de integridade falhar.
	 */
	const fromString = (content: string): string => {
		return algo(content); // Chama a função algo para descriptografar
	};

	/**
	 * Descriptografa os valores das chaves selecionadas de um objeto, incluindo arrays e objetos aninhados.
	 *
	 * @template I
	 * @param {I} obj - O objeto cujos valores serão parcialmente descriptografados.
	 * @param {Array<string>} list - Lista de chaves a serem descriptografadas, suporta dot notation para chaves aninhadas.
	 * @returns {I} - Um novo objeto com os valores das chaves especificadas descriptografados.
	 * @throws {Error} - Se houver um tipo complexo que não pode ser descriptografado.
	 */
	const fromObject = <I extends Record<string, unknown>>(obj: I, list?: string[]): I => {
		// eslint-disable-next-line no-param-reassign -- modifies the list parameter
		list = list || Object.keys(obj);

		const decryptValue = (value: unknown, path: string): unknown => {
			if (Array.isArray(value)) {
				// Se for um array, descriptografa e parseia
				return list.includes(path) ? JSON.parse(algo(String(value))) : value;
			} else if (typeof value === "object" && value !== null) {
				// Verifica se o objeto pode ser descriptografado
				if (isComplexType(value)) {
					throw new Error(`Tipo não suportado para descriptografia em ${path}`);
				}
				// Descriptografa o objeto ou passa para suas propriedades
				return list.includes(path)
					? JSON.parse(algo(JSON.stringify(value)))
					: fromObject(value as Record<string, unknown>, filterNestedKeys(list, path));
			}
			// Descriptografa os valores primitivos
			return list.includes(path) ? algo(String(value)) : value;
		};

		const decryptedEntries = Object.entries(obj).map(([key, value]) => [key, decryptValue(value, key)]);

		return Object.fromEntries(decryptedEntries) as I;
	};

	return { fromObject, fromString };
};

/**
 * Verifica se o valor é de um tipo complexo que não pode ser descriptografado (ex: classe, função, Date).
 *
 * @param {any} value - O valor a ser verificado.
 * @returns {boolean} - Verdadeiro se for um tipo complexo não suportado.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is used to accept any type
const isComplexType = (value: any): boolean => {
	return (
		value instanceof Date ||
		value instanceof RegExp ||
		typeof value === "function" ||
		(value.constructor && value.constructor !== Object)
	);
};

/**
 * Filtra as chaves aninhadas para passar somente as chaves relevantes para o objeto filho.
 *
 * @param {Array<string>} list - A lista de chaves.
 * @param {string} parentPath - O caminho do objeto pai.
 * @returns {Array<string>} - As chaves filtradas para o objeto filho.
 */
const filterNestedKeys = (list: string[], parentPath: string): string[] => {
	return list.filter(key => key.startsWith(`${parentPath}.`)).map(key => key.replace(`${parentPath}.`, ""));
};
