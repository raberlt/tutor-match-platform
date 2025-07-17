    document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const errorDiv = document.getElementById('passwordError');

        form.addEventListener('submit', function (e) {
            if (password.value !== confirmPassword.value) {
            e.preventDefault(); // Ngăn gửi form
            errorDiv.textContent = 'Mật khẩu không khớp.';
            errorDiv.style.display = 'block';
            } else {
                errorDiv.style.display = 'none';
            }
        });
    });

