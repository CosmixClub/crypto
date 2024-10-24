## @cosmixclub/crypto

Este pacote fornece funções robustas de criptografia e descriptografia utilizando o algoritmo AES-256-GCM com chaves derivadas por meio de Argon2 e suporte para operações de criptografia em strings e objetos aninhados. Ele é construído para garantir segurança e integridade dos dados em aplicações que exigem alta proteção.

### Índice

-   [@cosmixclub/crypto](#cosmixclubcrypto)
    -   [Índice](#índice)
-   [Instalação](#instalação)
-   [Uso](#uso)
    -   [Criptografando uma String](#criptografando-uma-string)
    -   [Criptografando Objetos](#criptografando-objetos)
    -   [Descriptografando uma String](#descriptografando-uma-string)
    -   [Descriptografando Objetos](#descriptografando-objetos)
-   [API](#api)
    -   [Funções de Criptografia](#funções-de-criptografia)
        -   [`encrypt(config: CryptoConfig)`](#encryptconfig-cryptoconfig)
    -   [Funções de Descriptografia](#funções-de-descriptografia)
        -   [`decrypt(config: CryptoConfig)`](#decryptconfig-cryptoconfig)
-   [Erros](#erros)
    -   [Tipos de Erros](#tipos-de-erros)
-   [Contribuição](#contribuição)

## Instalação

```bash
npm install @cosmixclub/crypto
```

## Uso

### Criptografando uma String

Você pode usar a função `fromString` para criptografar uma string de texto simples. A chave de criptografia é derivada de uma chave de privacidade e um sal dinâmico.

```typescript
import { encrypt } from "@cosmixclub/crypto";

const config = {
	privacyKey: "uma_chave_privada_secreta_de_32_caracteres_no_minimo",
	privacySalt: "um_salt_aleatorio",
	keys: ["context1", "context2"],
};

const encryptedString = encrypt(config).fromString("Hello World");
console.log("Encrypted String:", encryptedString);
```

### Criptografando Objetos

A função `fromObject` permite criptografar seletivamente as propriedades de um objeto, incluindo suporte para objetos aninhados e arrays.

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

## API

### Funções de Criptografia

#### `encrypt(config: CryptoConfig)`

-   **Parâmetros**:
    -   `config` (Object): Configuração com as seguintes propriedades:
        -   `privacyKey` (string): Chave de privacidade (mínimo de 32 caracteres).
        -   `privacySalt` (string): Um sal de privacidade (mínimo de 16 caracteres).
        -   `keys` (Array<string>): Array com informações contextuais para derivação da chave.
-   **Retorno**: Um objeto com as funções:
    -   `fromString(plainText: string): string`: Criptografa uma string.
    -   `fromObject<I, K>(obj: I, keys?: K[]): EncryptNestedKeys<I, K>`: Criptografa os valores das chaves selecionadas de um objeto.

### Funções de Descriptografia

#### `decrypt(config: CryptoConfig)`

-   **Parâmetros**:

    -   `config` (Object): Configuração com as mesmas propriedades usadas na criptografia.

-   **Retorno**: Um objeto com as funções:
    -   `fromString(content: string): string`: Descriptografa uma string.
    -   `fromObject<I>(obj: I, list?: string[]): I`: Descriptografa os valores das chaves selecionadas de um objeto.

## Erros

Este pacote lança uma série de erros personalizados para facilitar a identificação de problemas durante o processo de criptografia/descriptografia.

### Tipos de Erros

-   **CryptoError**: Classe base para todos os erros de criptografia.
-   **InvalidPrefixError**: Lançado quando o prefixo da string criptografada é inválido.
-   **InvalidIVError**: Lançado quando o IV não pode ser convertido adequadamente.
-   **InvalidCiphertextError**: Lançado quando o ciphertext não é válido.
-   **InvalidAuthTagError**: Lançado quando a `authTag` não corresponde.
-   **EncryptionFailedError**: Lançado quando a criptografia falha.
-   **DecryptionFailedError**: Lançado quando a descriptografia falha.

## Contribuição

1. Faça um fork do repositório.
2. Crie uma nova branch (`git checkout -b feature/nova-funcionalidade`).
3. Faça o commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`).
4. Envie para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request.

---

Este pacote foi desenvolvido para fornecer uma maneira segura e eficiente de criptografar e descriptografar dados, especialmente em aplicações que exigem alta segurança para proteger informações sensíveis.
