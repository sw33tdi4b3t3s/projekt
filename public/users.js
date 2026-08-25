export function initUsers() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = loginForm.querySelector('input[name="email"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;

            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token); //zapis tokenu w schowku przegladarki
                    alert(data.message);
                    window.location.href = '/dashboard'; //przeniesienie do dashboard
                } else {
                    alert(data.message || 'Błąd logowania');
                }
            } catch (err) {
                console.error('Błąd:', err);
                alert('Nie udało się połączyć z serwerem.');
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = registerForm.querySelector('input[name="name"]').value;
            const email = registerForm.querySelector('input[name="email"]').value;
            const password = registerForm.querySelector('input[name="password"]').value;

            try {
                const response = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    window.location.href = '/login';
                } else {
                    alert(data.message || 'Błąd rejestracji');
                }
            } catch (err) {
                console.error('Błąd:', err);
                alert('Nie udało się połączyć z serwerem.');
            }
        });
    }
}