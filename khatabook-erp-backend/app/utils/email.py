# app/utils/email.py

from app.config import settings


async def send_password_reset_email(email: str, reset_token: str):
    reset_url = f"{settings.FRONTEND_URL}/forgot-password/reset?token={reset_token}"

    try:
        from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

        conf = ConnectionConfig(
            MAIL_USERNAME   = settings.MAIL_USERNAME,
            MAIL_PASSWORD   = settings.MAIL_PASSWORD,
            MAIL_FROM       = settings.MAIL_FROM,
            MAIL_PORT       = settings.MAIL_PORT,
            MAIL_SERVER     = settings.MAIL_SERVER,
            MAIL_FROM_NAME  = settings.MAIL_FROM_NAME,
            MAIL_STARTTLS   = True,
            MAIL_SSL_TLS    = False,
            USE_CREDENTIALS = True,
        )

        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">
            <h2 style="color: #1a1a2e;">Khatabook ERP — Password Reset</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password.</p>
            <p>Click the button below — link valid for <strong>15 minutes</strong>.</p>
            <a href="{reset_url}"
               style="display:inline-block; margin-top:16px; padding:12px 24px;
                      background:#4f46e5; color:#fff; text-decoration:none;
                      border-radius:6px; font-size:14px;">
                Reset Password
            </a>
            <p style="margin-top:24px; font-size:12px; color:#666;">
                If you did not request this, ignore this email.
            </p>
        </div>
        """

        message = MessageSchema(
            subject    = "Reset Your Khatabook ERP Password",
            recipients = [email],
            body       = html_body,
            subtype    = MessageType.html,
        )

        fm = FastMail(conf)
        await fm.send_message(message)

    except Exception as e:
        print(f"Email send failed: {e}")