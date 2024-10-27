export class CryptoError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CryptoError";
	}
}

export class InvalidPrefixError extends CryptoError {
	constructor(message: string) {
		super(message);
		this.name = "InvalidPrefixError";
	}
}

export class InvalidIVError extends CryptoError {
	constructor(message: string) {
		super(message);
		this.name = "InvalidIVError";
	}
}

export class InvalidCiphertextError extends CryptoError {
	constructor(message: string) {
		super(message);
		this.name = "InvalidCiphertextError";
	}
}

export class InvalidAuthTagError extends CryptoError {
	constructor(message: string) {
		super(message);
		this.name = "InvalidAuthTagError";
	}
}

export class EncryptionFailedError extends CryptoError {
	constructor(message: string) {
		super(message);
		this.name = "EncryptionFailedError";
	}
}

export class DecryptionFailedError extends CryptoError {
	constructor(message: string) {
		super(message);
		this.name = "DecryptionFailedError";
	}
}

export class HashFailedError extends CryptoError {
	constructor(message: string) {
		super(message);
		this.name = "HashFailedError";
	}
}
