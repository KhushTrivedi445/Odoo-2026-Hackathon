import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_otp_email(email: str, otp: str):
    sender_email = settings.EMAIL_USER
    sender_password = settings.EMAIL_PASSWORD
    smtp_server = settings.EMAIL_HOST
    smtp_port = settings.EMAIL_PORT

    # Create the email message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = "CoreInventory Password Reset OTP"

    body = f"""Hello,

Your OTP for resetting your CoreInventory password is:

{otp}

This OTP will expire in 5 minutes.

If you did not request a password reset, ignore this email.
"""
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Connect to the server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Upgrade connection to secure
        
        # Login
        server.login(sender_email, sender_password)
        
        # Send the email
        server.send_message(msg)
        print(f"--- [INFO] OTP email successfully sent to {email} ---", flush=True)
    except Exception as e:
        print(f"--- [ERROR] Failed to send OTP email to {email}: {e} ---", flush=True)
    finally:
        server.quit()
