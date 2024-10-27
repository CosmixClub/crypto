## @cosmixclub/crypto

Este pacote fornece funções robustas de criptografia e descriptografia utilizando o algoritmo AES-256-GCM, com chaves derivadas por meio de Argon2 e suporte para operações de criptografia em strings e objetos aninhados. Além disso, oferece funcionalidades para geração de hash de strings e propriedades específicas de objetos usando diversos algoritmos de hash.

### Índice

-   [@cosmixclub/crypto](#cosmixclubcrypto)
    -   [Índice](#índice)
-   [Instalação](#instalação)
-   [Uso](#uso)
    -   [Configurando](#configurando)
    -   [Criptografando uma String](#criptografando-uma-string)
    -   [Criptografando Objetos](#criptografando-objetos)
    -   [Descriptografando uma String](#descriptografando-uma-string)
    -   [Descriptografando Objetos](#descriptografando-objetos)
    -   [Gerando Hash de Strings](#gerando-hash-de-strings)
    -   [Gerando Hash de Objetos](#gerando-hash-de-objetos)
-   [API](#api)
    -   [Funções de Criptografia](#funções-de-criptografia)
        -   [`encrypt(config: CryptoConfig)`](#encryptconfig-cryptoconfig)
    -   [Funções de Descriptografia](#funções-de-descriptografia)
        -   [`decrypt(config: CryptoConfig)`](#decryptconfig-cryptoconfig)
    -   [Funções de Hash](#funções-de-hash)
        -   [`hash(algorithm: HashAlgorithm)`](#hashalgorithm-hashalgorithm)
-   [Erros](#erros)
    -   [Tipos de Erros](#tipos-de-erros)
-   [Contribuição](#contribuição)

## Instalação

```bash
pnpm add @cosmixclub/crypto
```

## Uso

### Configurando

As funções `encrypt` e `decrypt` necessitam de um objeto de configuração com as chaves secretas e contexto adicional (opcional). Tome cuidado com o armazenamento das suas chaves e contexto, vazamentos irão comprometer a segurança dos seus dados.

```typescript
import { type CryptoConfig } from "@cosmixclub/crypto";

const config: CryptoConfig = {
	privacyKey: "uma_chave_privada_secreta_de_32_caracteres_no_minimo",
	privacySalt: "um_salt_aleatorio_de_16_caracteres_no_minimo",
	context: ["context1", "context2"], // Opcional
};
```

### Criptografando uma String

Você pode usar a função `fromString` para criptografar uma string de texto simples. A chave de criptografia é derivada de uma chave de privacidade e um sal dinâmico.

```typescript
import { encrypt } from "@cosmixclub/crypto";

const encryptedString = encrypt(config).fromString("Hello World");
console.log("Encrypted String:", encryptedString);
```

### Criptografando Objetos

A função `fromObject` permite criptografar seletivamente as propriedades de um objeto, incluindo suporte para objetos aninhados e arrays.

Assim como na função `decrypt`, o usuário tem a opção de passar uma lista de chaves do objeto para selecionar quais valores serão decriptados. Se nenhum valor for passado, ou a lista não for passada, todos os valores serão criptografados/decriptografados.

```typescript
import { encrypt } from "@cosmixclub/crypto";

const user = {
	name: "John Doe",
	email: "john@example.com",
	age: 30,
};

const encryptedUser = encrypt(config).fromObject(user, ["email"]);
console.log("Encrypted Object:", encryptedUser);
```

### Descriptografando uma String

Para descriptografar uma string criptografada, você pode usar a função `fromString` no módulo `decrypt`.

```typescript
import { decrypt } from "@cosmixclub/crypto";

const decryptedString = decrypt(config).fromString(encryptedString);
console.log("Decrypted String:", decryptedString);
```

### Descriptografando Objetos

A função `fromObject` no módulo `decrypt` pode descriptografar propriedades específicas de um objeto, permitindo também trabalhar com objetos aninhados e arrays.

```typescript
import { decrypt } from "@cosmixclub/crypto";

const decryptedUser = decrypt(config).fromObject(encryptedUser, ["email"]);
console.log("Decrypted User:", decryptedUser);
```

### Gerando Hash de Strings

Utilize a função `fromString` para gerar o hash de uma string. Por padrão, o algoritmo SHA-512 é utilizado, mas você pode especificar outros algoritmos suportados.

```typescript
import { hash } from "@cosmixclub/crypto";

const hashedString = hash("sha256").fromString("Hello World");
console.log("Hashed String:", hashedString);
```

### Gerando Hash de Objetos

A função `fromObject` permite gerar hash de propriedades específicas de um objeto, com suporte para dot notation. Esta função evita aplicar hash em tipos complexos (como funções e instâncias de classes) e permite gerar hash de objetos aninhados ou arrays.

```typescript
import { hash } from "@cosmixclub/crypto";

const user = {
	name: "John Doe",
	password: "supersecret",
	profile: {
		email: "john@example.com",
		phone: "123456789",
	},
};

const hashedUser = hash("sha512").fromObject(user, ["password", "profile.email"]);
console.log("Hashed Object:", hashedUser);
```

## API

### Funções de Criptografia

#### `encrypt(config: CryptoConfig)`

-   **Parâmetros**:
    -   `config` (Object): Objeto de configuração para criptografia.
-   **Retorno**: Um objeto com as funções:
    -   `fromString(plainText: string): string`: Criptografa uma string.
    -   `fromObject<I, K>(obj: I, keys?: K[]): EncryptNestedKeys<I, K>`: Criptografa as chaves especificadas de um objeto.

### Funções de Descriptografia

#### `decrypt(config: CryptoConfig)`

-   **Parâmetros**:
    -   `config` (Object): Configuração usada na criptografia.
-   **Retorno**: Um objeto com as funções:
    -   `fromString(content: string): string`: Descriptografa uma string.
    -   `fromObject<I>(obj: I, list?: string[]): I`: Descriptografa as chaves especificadas de um objeto.

### Funções de Hash

#### `hash(algorithm: HashAlgorithm)`

-   **Parâmetros**:
    -   `algorithm` (string, opcional): Algoritmo de hash a ser utilizado. Suporta `"sha1"`, `"sha256"`, `"sha384"`, `"sha512"`, `"md5"`, e `"ripemd160"`. O padrão é `"sha512"`.
-   **Retorno**: Um objeto com as funções:
    -   `fromString(str: string): string`: Gera o hash de uma string.
    -   `fromObject<I, K>(obj: I, keys?: K[]): EncryptNestedKeys<I, K>`: Gera o hash de propriedades específicas de um objeto com suporte a dot notation.

## Erros

O pacote lança erros personalizados para facilitar a identificação de problemas.

### Tipos de Erros

-   **CryptoError**: Classe base para todos os erros de criptografia.
-   **InvalidPrefixError**: Prefixo inválido na string criptografada.
-   **InvalidIVError**: IV inválido.
-   **InvalidCiphertextError**: Ciphertext inválido.
-   **InvalidAuthTagError**: `authTag` inválido.
-   **EncryptionFailedError**: Erro ao criptografar.
-   **DecryptionFailedError**: Erro ao descriptografar.
-   **HashFailedError**: Erro ao gerar hash.

## Contribuição

1. Faça um fork do repositório.
2. Crie uma nova branch (`git checkout -b feature/nova-funcionalidade`).
3. Faça commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`).
4. Envie para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request.

---

Este pacote é projetado para fornecer uma maneira segura e eficiente de criptografar, descriptografar e hashear dados, com funcionalidades adicionais para criptografia seletiva em objetos aninhados e arrays, além de suporte a múltiplos algoritmos de hash para diferentes necessidades de segurança.
