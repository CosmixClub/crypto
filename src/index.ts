export { decrypt } from "./decrypt";
export { encrypt } from "./encrypt";
export * from "./errors";
export { keyBuilder } from "./key-builder";

export type CryptoConfig = {
	/**
	 * Keys são chaves únicas adicionais que podem ser usadas para diferenciar ainda mais os dados criptografados em um mesmo banco de dados.
	 * A ideia é segmentar os dados por meio dessas chaves, para que até mesmo em tabelas iguais, os dados criptografados necessitem de métodos diferentes para serem descriptografados.
	 *
	 * Exemplo: Se você está trabalhando com chats, pode usar `chatId` e/ou `userId` como keys, para que os dados de um chat não possam ser descriptografados com a chave de outro chat.
	 *
	 * @deprecated Use `context` ao invés de `keys`.
	 * @type {?string[]}
	 */
	keys?: string[];
	/**
	 * Context são chaves únicas adicionais que podem ser usadas para diferenciar ainda mais os dados criptografados em um mesmo banco de dados.
	 * A ideia é segmentar os dados por meio dessas chaves, para que até mesmo em tabelas iguais, os dados criptografados necessitem de métodos diferentes para serem descriptografados.
	 *
	 * Exemplo: Se você está trabalhando com chats, pode usar `chatId` e/ou `userId` como context, para que os dados de um chat não possam ser descriptografados com a chave de outro chat.
	 *
	 * @type {?string[]}
	 */
	context?: string[];
	/**
	 * Chave secreta usada para criptografar e descriptografar os dados.
	 * Deve ser uma string de 32 caracteres.
	 *
	 * ! ATENÇÃO: Mantenha esta chave em segredo e não a compartilhe com ninguém.
	 * Vazar esta chave pode comprometer a segurança dos dados criptografados.
	 *
	 * @type {string}
	 */
	privacyKey: string;
	/**
	 * Sal para ser usado na criptografia.
	 * Deve ser uma string de 16 caracteres.
	 *
	 * ! ATENÇÃO: Mantenha este sal em segredo e não o compartilhe com ninguém.
	 * Vazar este sal pode comprometer a segurança dos dados criptografados.
	 *
	 * @type {string}
	 */
	privacySalt: string;
};
