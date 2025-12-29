import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple
from tortoise.exceptions import DoesNotExist
from tortoise.expressions import Q
from src.services.mail_service import MailService

from src.models import Users, UserRole
from src.security import hash_password, verify_password, create_access_token
from src.config import logger

class AuthService:
    
    # Geçici token deposu (Gerçek projede Redis veya DB tablosu daha iyidir)
    # format: {"token_string": {"user_id": 123, "expires": datetime}}
    _reset_tokens = {}

    @staticmethod
    async def register_user(data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        try:
            student_number = data.get("student_number")
            email = data.get("email")
            password = data.get("password")
            first_name = data.get("first_name")
            last_name = data.get("last_name")
            department = data.get("department")

            if not all([student_number, email, password, first_name, last_name]):
                return {"error": "Lütfen tüm zorunlu alanları doldurun."}, 400
            
            existing_user = await Users.filter(
                Q(user_id=student_number) | Q(email=email)
            ).exists()
            
            if existing_user:
                return {"error": "Bu öğrenci numarası veya e-posta adresi zaten kullanımda."}, 400
            
            hashed = hash_password(password)
            user = await Users.create(
                user_id=student_number,
                email=email,
                password=hashed,
                first_name=first_name.strip(),
                last_name=last_name.strip(),
                role=UserRole.STUDENT,
                department=department
            )
            
            token = create_access_token(user.user_id, user.role.value)
            return {
                "token": token, 
                "user": {
                    "id": user.user_id, 
                    "email": user.email, 
                    "role": user.role.value,
                    "full_name": f"{user.first_name} {user.last_name}"
                }
            }, 201
            
        except Exception as e:
            logger.error(f"Registration Error: {str(e)}")
            return {"error": "Kayıt sırasında bir hata oluştu."}, 500

    @staticmethod
    async def login_user(data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        email = data.get("email")
        password = data.get("password")
        required_role = data.get("role")

        try:
            user = await Users.get(email=email)
            
            if user.is_deleted:
                return {"error": "Hesabınız askıya alınmıştır."}, 403

            if not verify_password(password, user.password):
                raise DoesNotExist 

            if required_role and user.role.value != required_role:
                return {"error": "Bu alan için yetkiniz bulunmamaktadır."}, 403

            token = create_access_token(user.user_id, user.role.value)
            return {
                "token": token,
                "user": {
                    "id": user.user_id,
                    "email": user.email,
                    "role": user.role.value,
                    "full_name": f"{user.first_name} {user.last_name}"
                }
            }, 200

        except DoesNotExist:
            return {"error": "E-posta veya şifre hatalı."}, 401
        except Exception as e:
            logger.error(f"Login Error: {str(e)}")
            return {"error": "Giriş sırasında bir hata oluştu."}, 500

    # --- ŞİFRE SIFIRLAMA MANTIĞI ---

    @staticmethod
    async def request_password_reset(email: str) -> Tuple[Dict[str, Any], int]:
        """Sıfırlama tokeni üretir ve (simüle edilmiş) mail gönderir."""
        try:
            user = await Users.get(email=email)
            
            # Güvenli, benzersiz bir token üret (32 karakter)
            token = secrets.token_urlsafe(32)
            expiry = datetime.now() + timedelta(minutes=30) # 30 dk geçerli
            
            # Belleğe kaydet (Üretim aşamasında veritabanına kaydedilmeli)
            AuthService._reset_tokens[token] = {
                "user_id": user.user_id,
                "expires": expiry
            }

            # E-posta Gönderim Simülasyonu
            logger.info(f"PASSWORD RESET LINK: http://localhost:5173/reset-password?token={token}")
            
            await MailService.send_reset_email(email, token)
            
            return {"message": "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."}, 200
            
        except DoesNotExist:
            # Güvenlik için e-posta yoksa bile başarı mesajı dönülür
            return {"message": "Eğer hesap mevcutsa sıfırlama maili gönderilecektir."}, 200

    @staticmethod
    async def complete_password_reset(token: str, new_password: str) -> Tuple[Dict[str, Any], int]:
        """Tokenı doğrular ve şifreyi günceller."""
        try:
            reset_data = AuthService._reset_tokens.get(token)

            # 1. Token geçerlilik kontrolü
            if not reset_data:
                return {"error": "Geçersiz veya kullanılmış token."}, 400
            
            # 2. Süre kontrolü
            if datetime.now() > reset_data["expires"]:
                del AuthService._reset_tokens[token]
                return {"error": "Token süresi dolmuş. Lütfen tekrar deneyin."}, 400

            # 3. Şifreyi güncelle
            user = await Users.get(user_id=reset_data["user_id"])
            user.password = hash_password(new_password)
            await user.save()

            # 4. Token'ı imha et (Tek kullanımlık)
            del AuthService._reset_tokens[token]
            
            logger.info(f"Password updated for user ID: {user.user_id}")
            return {"message": "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz."}, 200

        except Exception as e:
            logger.error(f"Reset Password Completion Error: {str(e)}")
            return {"error": "Şifre güncellenirken bir hata oluştu."}, 500