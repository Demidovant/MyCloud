from django.core.exceptions import ValidationError
import re


class PasswordComplexityValidator:
    def validate(self, password, user=None):
        if len(password) < 6:
            raise ValidationError("Длина пароля должна быть не менее 6 символов.")
        if not re.search(r'[A-Z]', password):
            raise ValidationError("Пароль должен содержать как минимум одну заглавную английскую букву.")
        if not re.search(r'\d', password):
            raise ValidationError("Пароль должен содержать как минимум одну цифру.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError("Пароль должен содержать как минимум один специальный символ.")

    def get_help_text(self):
        return (
            "Ваш пароль должен содержать не менее 6 символов, "
            "включая одну заглавную английскую букву, "
            "одну цифру и один специальный символ."
        )
