import * as crypto from "node:crypto";

import type { CryptoConfig } from ".";
import { CryptoError } from "../dist";
import { EncryptionFailedError } from "./errors";
import { keyBuilder } from "./key-builder";

export type DotNotationKeys<T> = T extends object
	? {
			[K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${DotNotationKeys<T[K]>}` | K : K) : never;
		}[keyof T]
	: never;

export type EncryptNestedKeys<I, K extends string> = K extends `${infer P}.${infer Rest}`
	? P extends keyof I
		? I[P] extends object
			? { [Key in keyof I]: Key extends P ? EncryptNestedKeys<I[Key], Rest> : I[Key] }
			: I
		: I
	: { [Key in keyof I]: Key extends K ? string : I[Key] };

export const encrypt = (config: CryptoConfig) => {
	const key = keyBuilder(config.privacyKey, config.privacySalt, ...(config.context || config.keys || []));

	/**
	 * Função interna para criptografar uma string usando o algoritmo AES-256-GCM.
	 *
	 * @param {string} content - O conteúdo que será criptografado.
	 * @returns {string} - A string criptografada no formato JSON contendo IV, dados criptografados e AuthTag.
	 * @throws {EncryptionFailedError} - Lança um erro se a criptografia falhar.
	 */
	const algo = (content: string): string => {
		const iv = crypto.randomBytes(12); // Gera um IV aleatório de 12 bytes (recomendado para AES-GCM)
		const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "base64"), iv);

		let encrypted: string;
		try {
			encrypted = cipher.update(content, "utf8", "hex");
			encrypted += cipher.final("hex");
		} catch {
			throw new EncryptionFailedError("Falha na criptografia.");
		}

		const authTag = cipher.getAuthTag().toString("hex"); // Captura o AuthTag para verificação de integridade

		// Retorna os dados criptografados em formato JSON
		return JSON.stringify({
			authTag,
			encryptedData: encrypted,
			iv: iv.toString("hex"),
		});
	};

	/**
	 * Encripta os valores das chaves selecionadas de um objeto.
	 *
	 * @template I - Tipo do objeto original
	 * @template K - Chaves cujos valores serão criptografados
	 * @param {I} obj - O objeto cujos valores serão parcialmente encriptados.
	 * @param {Array<K>} keys - Uma lista das chaves cujos valores devem ser encriptados. Se não for fornecido, todas as chaves serão encriptadas.
	 * @returns {EncryptNestedKeys<I, K>} - Um novo objeto com os valores das chaves especificadas encriptados.
	 */
	const fromObject = <I extends Record<string, unknown>, K extends DotNotationKeys<I>>(
		obj: I,
		keys?: K[],
	): EncryptNestedKeys<I, K> => {
		// eslint-disable-next-line no-param-reassign -- modifies the keys parameter
		keys = keys || (Object.keys(obj) as K[]);

		const encryptValue = (value: unknown, path: string): unknown => {
			if (!keys.includes(path as K)) return value;

			if (Array.isArray(value)) {
				// Se for um array, serializa e encripta
				return algo(JSON.stringify(value));
			} else if (typeof value === "object" && value !== null) {
				// Verifica se o objeto é criptografável
				if (isComplexType(value)) {
					throw new CryptoError(`Tipo não suportado para criptografia em ${path}`);
				}
				// Criptografa o objeto inteiro ou passa para suas propriedades
				return keys.includes(path as K)
					? algo(JSON.stringify(value))
					: fromObject(value as Record<string, unknown>, filterNestedKeys(keys.map(String), path));
			}
			// Criptografa os valores primitivos
			return algo(String(value));
		};

		const encryptedEntries = Object.entries(obj).map(([key, value]) => [key, encryptValue(value, key)]);
		return Object.fromEntries(encryptedEntries) as EncryptNestedKeys<I, K>;
	};

	/**
	 * Criptografa uma string utilizando o algoritmo AES-256-GCM.
	 *
	 * Utiliza uma chave derivada a partir de entradas fornecidas pelo sistema e um IV aleatório
	 * para garantir segurança.
	 *
	 * @param {string} plainText - O conteúdo de texto simples que será criptografado.
	 * @returns {string} - A string criptografada no formato JSON contendo IV, dados criptografados e AuthTag.
	 *
	 * @throws {EncryptionFailedError} - Lança um erro se a criptografia falhar.
	 *
	 * @example
	 * const encryptedString = await fromString('Hello World');
	 * console.log(encryptedString);
	 * // Saída: '{"iv":"abc123...","encryptedData":"def456...","authTag":"ghi789..."}'
	 */
	const fromString = (plainText: string): string => {
		const iv = crypto.randomBytes(12); // Gera um IV aleatório de 12 bytes (recomendado para AES-GCM)
		const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "base64"), iv);

		let encrypted: string;
		try {
			encrypted = cipher.update(plainText, "utf8", "hex");
			encrypted += cipher.final("hex");
		} catch {
			throw new EncryptionFailedError("Falha na criptografia da string.");
		}

		const authTag = cipher.getAuthTag().toString("hex"); // Captura o AuthTag para verificação de integridade

		// Retorna os dados criptografados em formato JSON
		return JSON.stringify({
			authTag,
			encryptedData: encrypted,
			iv: iv.toString("hex"),
		});
	};

	return { fromObject, fromString };
};

/**
 * Verifica se o valor é de um tipo complexo que não pode ser encriptado (ex: classe, função, Date).
 *
 * @param {any} value - O valor a ser verificado.
 * @returns {boolean} - Verdadeiro se for um tipo complexo não suportado.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any type is necessary here
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
