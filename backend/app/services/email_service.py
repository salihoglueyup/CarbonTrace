"""
Email Service - SMTP email notifications
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from datetime import datetime


class EmailService:
    """Service for sending email notifications"""

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@cbamguard.com")
        self.from_name = "CBAM Guard"

    def is_configured(self) -> bool:
        """Check if email service is configured"""
        return bool(self.smtp_user and self.smtp_password)

    def _get_base_template(self, content: str, title: str = "CBAM Guard") -> str:
        """Get HTML email base template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #00874A 0%, #006837 100%); color: white; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; }}
                .content {{ padding: 30px; }}
                .footer {{ background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #718096; }}
                .button {{ display: inline-block; background: #00874A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; }}
                .stat-box {{ background: #f0fdf4; border-left: 4px solid #00874A; padding: 15px; margin: 15px 0; }}
                .warning-box {{ background: #fffbeb; border-left: 4px solid #F39200; padding: 15px; margin: 15px 0; }}
                .danger-box {{ background: #fef2f2; border-left: 4px solid #E53E3E; padding: 15px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛡️ {title}</h1>
                </div>
                <div class="content">
                    {content}
                </div>
                <div class="footer">
                    <p>© 2024 CBAM Guard - Garanti BBVA</p>
                    <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
                </div>
            </div>
        </body>
        </html>
        """

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send an email"""
        if not self.is_configured():
            print("Email service not configured")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            return True
        except Exception as e:
            print(f"Email error: {e}")
            return False

    async def send_welcome_email(self, to_email: str, name: str) -> bool:
        """Send welcome email to new user"""
        content = f"""
        <h2>Hoş Geldiniz, {name}! 👋</h2>
        <p>CBAM Guard platformuna kaydınız başarıyla tamamlandı.</p>
        
        <div class="stat-box">
            <strong>CBAM Guard ile neler yapabilirsiniz?</strong>
            <ul>
                <li>🌿 Emisyon verilerinizi takip edin</li>
                <li>💰 CBAM maliyetlerinizi hesaplayın</li>
                <li>📊 Detaylı raporlar oluşturun</li>
                <li>🤖 AI destekli öneriler alın</li>
            </ul>
        </div>
        
        <a href="http://localhost:5173" class="button">Platforma Git</a>
        """

        html = self._get_base_template(content, "CBAM Guard'a Hoş Geldiniz")
        return await self.send_email(to_email, "CBAM Guard'a Hoş Geldiniz! 🎉", html)

    async def send_deadline_reminder(
        self, to_email: str, deadline_name: str, deadline_date: str, days_remaining: int
    ) -> bool:
        """Send deadline reminder email"""
        urgency = "danger-box" if days_remaining <= 7 else "warning-box"

        content = f"""
        <h2>⏰ CBAM Deadline Hatırlatması</h2>
        
        <div class="{urgency}">
            <strong>{deadline_name}</strong>
            <p>Son tarih: <strong>{deadline_date}</strong></p>
            <p>Kalan süre: <strong>{days_remaining} gün</strong></p>
        </div>
        
        <p>Bu son tarihe yetişmek için gerekli aksiyonları almanızı öneririz.</p>
        
        <a href="http://localhost:5173/compliance" class="button">Uyumluluk Durumunu Kontrol Et</a>
        """

        html = self._get_base_template(content, "⏰ Deadline Hatırlatması")
        return await self.send_email(
            to_email, f"⚠️ CBAM Deadline: {days_remaining} gün kaldı", html
        )

    async def send_weekly_summary(self, to_email: str, name: str, stats: dict) -> bool:
        """Send weekly summary email"""
        content = f"""
        <h2>Haftalık Özet Raporu 📊</h2>
        <p>Merhaba {name},</p>
        <p>İşte bu haftanın CBAM Guard özeti:</p>
        
        <div class="stat-box">
            <table style="width: 100%;">
                <tr>
                    <td>📈 Toplam Emisyon</td>
                    <td style="text-align: right;"><strong>{stats.get('total_emissions', 'N/A')} tCO2e</strong></td>
                </tr>
                <tr>
                    <td>💰 Tahmini CBAM Maliyet</td>
                    <td style="text-align: right;"><strong>€{stats.get('cbam_cost', 'N/A')}</strong></td>
                </tr>
                <tr>
                    <td>✅ Tamamlanan Görevler</td>
                    <td style="text-align: right;"><strong>{stats.get('completed_tasks', 0)}</strong></td>
                </tr>
                <tr>
                    <td>⚠️ Bekleyen Görevler</td>
                    <td style="text-align: right;"><strong>{stats.get('pending_tasks', 0)}</strong></td>
                </tr>
            </table>
        </div>
        
        <a href="http://localhost:5173" class="button">Dashboard'a Git</a>
        """

        html = self._get_base_template(content, "📊 Haftalık Özet")
        return await self.send_email(
            to_email,
            f"CBAM Guard - Haftalık Özet ({datetime.now().strftime('%d/%m/%Y')})",
            html,
        )

    async def send_password_reset(self, to_email: str, reset_token: str) -> bool:
        """Send password reset email"""
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"

        content = f"""
        <h2>🔐 Şifre Sıfırlama</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        
        <a href="{reset_link}" class="button">Şifremi Sıfırla</a>
        
        <p style="color: #718096; font-size: 12px;">
            Bu bağlantı 1 saat geçerlidir.<br>
            Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        </p>
        """

        html = self._get_base_template(content, "🔐 Şifre Sıfırlama")
        return await self.send_email(to_email, "CBAM Guard - Şifre Sıfırlama", html)


# Global instance
email_service = EmailService()
