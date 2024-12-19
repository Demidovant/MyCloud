from django.core.exceptions import ValidationError
import re


class PasswordComplexityValidator:
    def validate(self, password, user=None):
        if len(password) < 6:
            raise ValidationError("Password must be at least 6 characters long.")
        if not re.search(r'[A-Z]', password):
            raise ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'\d', password):
            raise ValidationError("Password must contain at least one digit.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError("Password must contain at least one special character.")

    def get_help_text(self):
        return (
            "Your password must contain at least 6 characters, including one uppercase letter, "
            "one digit, and one special character."
        )
