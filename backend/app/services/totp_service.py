"""
TOTP (Time-based One-Time Password) Service for 2FA
"""

import pyotp
import qrcode
import io
import base64
from typing import Tuple, Optional


class TOTPService:
    """Service for 2FA using TOTP"""

    ISSUER_NAME = "CBAM Guard"

    def generate_secret(self) -> str:
        """Generate a new TOTP secret"""
        return pyotp.random_base32()

    def get_totp_uri(self, secret: str, email: str) -> str:
        """Get the provisioning URI for authenticator apps"""
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=email, issuer_name=self.ISSUER_NAME)

    def generate_qr_code(self, secret: str, email: str) -> str:
        """Generate QR code as base64 string"""
        uri = self.get_totp_uri(secret, email)

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_base64}"

    def verify_token(self, secret: str, token: str) -> bool:
        """Verify a TOTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)  # Allow 1 step tolerance

    def get_current_token(self, secret: str) -> str:
        """Get current TOTP token (for testing)"""
        totp = pyotp.TOTP(secret)
        return totp.now()


# Simple in-memory 2FA storage (use database in production)
user_2fa_secrets = {}


def enable_2fa(user_id: int, email: str) -> Tuple[str, str]:
    """Enable 2FA for a user, returns (secret, qr_code_base64)"""
    service = TOTPService()
    secret = service.generate_secret()
    qr_code = service.generate_qr_code(secret, email)

    # Store temporarily until verified
    user_2fa_secrets[f"pending_{user_id}"] = secret

    return secret, qr_code


def verify_and_activate_2fa(user_id: int, token: str) -> bool:
    """Verify token and activate 2FA"""
    service = TOTPService()
    secret = user_2fa_secrets.get(f"pending_{user_id}")

    if not secret:
        return False

    if service.verify_token(secret, token):
        # Move from pending to active
        user_2fa_secrets[user_id] = secret
        del user_2fa_secrets[f"pending_{user_id}"]
        return True

    return False


def verify_2fa_login(user_id: int, token: str) -> bool:
    """Verify 2FA token during login"""
    service = TOTPService()
    secret = user_2fa_secrets.get(user_id)

    if not secret:
        return True  # 2FA not enabled

    return service.verify_token(secret, token)


def is_2fa_enabled(user_id: int) -> bool:
    """Check if 2FA is enabled for user"""
    return user_id in user_2fa_secrets


def disable_2fa(user_id: int) -> bool:
    """Disable 2FA for user"""
    if user_id in user_2fa_secrets:
        del user_2fa_secrets[user_id]
        return True
    return False


# Global instance
totp_service = TOTPService()
