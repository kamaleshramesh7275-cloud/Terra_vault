"""
tngis_encryption.py
====================
Python replication of the TNGIS Encryption class (Encryption.js).

Algorithm:
  - AES-256-CBC
  - Key derivation: PBKDF2-HMAC-SHA512, 1000 iterations, 32-byte key
  - Random 16-byte salt, random 16-byte IV per encryption
  - Output: Base64( JSON({ ciphertext, iv, salt, iterations }) )
"""

import json
import base64
import os
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA512, HMAC
from Crypto.Util.Padding import pad, unpad


class TNGISEncryption:
    """
    Mirrors the JavaScript Encryption class used by TNGIS GI Viewer.
    """

    ITERATIONS = 1000
    KEY_SIZE   = 32   # AES-256 = 32 bytes
    IV_SIZE    = 16
    SALT_SIZE  = 16

    def encrypt(self, plaintext: str, key: str) -> str | None:
        if not plaintext or not key:
            return None
        try:
            salt = os.urandom(self.SALT_SIZE)
            iv   = os.urandom(self.IV_SIZE)

            derived_key = PBKDF2(
                password=key.encode("utf-8"),
                salt=salt,
                dkLen=self.KEY_SIZE,
                count=self.ITERATIONS,
                prf=lambda p, s: HMAC.new(p, s, SHA512).digest(),
            )

            cipher = AES.new(derived_key, AES.MODE_CBC, iv)
            ciphertext = cipher.encrypt(pad(plaintext.encode("utf-8"), AES.block_size))

            envelope = {
                "ciphertext": base64.b64encode(ciphertext).decode("utf-8"),
                "iv":         iv.hex(),
                "salt":       salt.hex(),
                "iterations": self.ITERATIONS,
            }

            json_str = json.dumps(envelope, separators=(",", ":"))
            return base64.b64encode(json_str.encode("utf-8")).decode("utf-8")

        except Exception as e:
            print(f"[Encryption] encrypt failed: {e}")
            return None

    def decrypt(self, encrypted_string: str, key: str) -> str | None:
        if not encrypted_string or not key:
            return None
        try:
            json_str  = base64.b64decode(encrypted_string).decode("utf-8")
            envelope  = json.loads(json_str)

            salt       = bytes.fromhex(envelope["salt"])
            iv         = bytes.fromhex(envelope["iv"])
            iterations = int(envelope.get("iterations", self.ITERATIONS))
            ciphertext = base64.b64decode(envelope["ciphertext"])

            derived_key = PBKDF2(
                password=key.encode("utf-8"),
                salt=salt,
                dkLen=self.KEY_SIZE,
                count=iterations,
                prf=lambda p, s: HMAC.new(p, s, SHA512).digest(),
            )

            cipher    = AES.new(derived_key, AES.MODE_CBC, iv)
            plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)
            return plaintext.decode("utf-8")

        except Exception as e:
            print(f"[Encryption] decrypt failed: {e}")
            return None


if __name__ == "__main__":
    enc = TNGISEncryption()
    key = "test_key_12345"
    msg = '{"latitude": 10.95, "longitude": 76.96}'

    cipher = enc.encrypt(msg, key)
    print(f"Encrypted: {cipher[:80]}...")
    plain = enc.decrypt(cipher, key)
    print(f"Decrypted: {plain}")
    assert plain == msg, "Round-trip FAILED!"
    print("OK Encryption round-trip test PASSED")
