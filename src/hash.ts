import * as crypto from "node:crypto";

import type { DotNotationKeys, EncryptNestedKeys } from "./encrypt";
import { HashFailedError } from "./errors";

export type HashAlgorithm = "sha1" | "sha256" | "sha384" | "sha512" | "md5" | "ripemd160";

/**
 * Função principal para gerar hashes de strings e objetos com suporte a diferentes algoritmos.
 * O algoritmo SHA-512 é usado como padrão.
 *
 * @param {HashAlgorithm} algorithm - Algoritmo de hash a ser usado (padrão: "sha512").
 * @returns {{ fromObject: (obj: Record<string, unknown>, keys?: string[]) => void; fromString: (str: string) => string }}
 * Um objeto com métodos para gerar o hash de uma string ou de um objeto.
 */
export const hash = (algorithm: HashAlgorithm = "sha512") => {
	/**
	 * Gera o hash de uma string usando o algoritmo especificado.
	 *
	 * @param {string} content - A string que será hashada.
	 * @returns {string} - A string contendo o hash da string fornecida.
	 * @throws {HashFailedError} - Lança um erro se o algoritmo especificado não for suportado ou em caso de erro interno.
	 */
	const algo = (content: string): string => {
		try {
			const hash = crypto.createHash(algorithm);
			hash.update(content);
			return hash.digest("hex");
		} catch (error) {
			throw new HashFailedError("Falha na geração do hash: algoritmo não suportado ou erro interno.");
		}
	};

	/**
	 * Cria hash dos valores das chaves selecionadas de um objeto.
	 *
	 * @template I - Tipo do objeto original
	 * @template K - Chaves cujos valores serão hasheados
	 * @param {I} obj - O objeto cujos valores serão parcialmente hasheados.
	 * @param {Array<K>} keys - Uma lista das chaves cujos valores devem ser hasheados. Se não for fornecido, todas as chaves serão encriptadas.
	 * @returns {EncryptNestedKeys<I, K>} - Um novo objeto com os valores das chaves especificadas hasheados.
	 */
	const fromObject = <I extends Record<string, unknown>, K extends DotNotationKeys<I>>(
		obj: I,
		keys?: K[],
	): EncryptNestedKeys<I, K> => {
		// eslint-disable-next-line no-param-reassign -- modifies the keys parameter
		keys = keys || (Object.keys(obj) as K[]);

		const isComplexType = (value: unknown): boolean => {
			return typeof value === "function" || value instanceof Date || value instanceof RegExp;
		};

		const filterNestedKeys = (keys: string[], path: string): string[] => {
			return keys.filter(key => key.startsWith(`${path}.`)).map(key => key.slice(path.length + 1));
		};

		const execute = (value: unknown, path: string): unknown => {
			if (Array.isArray(value)) {
				// Se for um array, serializa e hasheia
				return keys.includes(path as K) ? algo(JSON.stringify(value)) : value;
			} else if (typeof value === "object" && value !== null) {
				// Verifica se o objeto é hasheável
				if (isComplexType(value)) {
					throw new Error(`Tipo não suportado para criptografia em ${path}`);
				}
				// Hasheia o objeto inteiro ou passa para suas propriedades
				return keys.includes(path as K)
					? algo(JSON.stringify(value))
					: fromObject(value as Record<string, unknown>, filterNestedKeys(keys.map(String), path));
			}
			// Hasheia os valores primitivos
			return keys.includes(path as K) ? algo(String(value)) : value;
		};

		const hashedEntries = Object.entries(obj).map(([key, value]) => [key, execute(value, key)]);
		return Object.fromEntries(hashedEntries) as EncryptNestedKeys<I, K>;
	};

	/**
	 * Gera o hash de uma string usando o algoritmo especificado.
	 *
	 * @param {string} str - A string a ser hashada.
	 * @returns {string} - A string contendo o hash da string fornecida.
	 */
	const fromString = (str: string): string => {
		return algo(str);
	};

	return {
		fromObject,
		fromString,
	};
};
