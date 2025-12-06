const API_BASE = import.meta.env.PUBLIC_API_BASE_URL;
const API_URL = `${API_BASE}/api/auth/login`;
const ANIMATION_DURATION = 400;

const CLS_DEFAULT = ['border-plm-gold', 'text-text-gray', 'focus:border-plm-navy', 'focus:text-black'];
const CLS_ERROR = ['border-error-red', 'text-error-red', 'focus:border-error-red', 'focus:text-error-red'];

export function initLogin() {
    const form = document.getElementById('loginForm') as HTMLFormElement | null;
    const errorMsg = document.getElementById('errorMessage') as HTMLElement | null;
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const loginCard = document.getElementById('loginCard') as HTMLElement | null;
    const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement | null;

    if (!form || !emailInput || !passwordInput || !loginBtn) return;

    // EVENT LISTENERS
    setupInputClearing([emailInput, passwordInput]);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin(emailInput, passwordInput);
    });

    // HELPER FUNCTIONS

    async function handleLogin(emailField: HTMLInputElement, passField: HTMLInputElement) {
        const email = emailField.value;
        const password = passField.value;

        if (!email || !password) return;
        if (loginBtn) loginBtn.disabled = true;

        try {
            const data = await postLoginData(email, password);

            if (data.success) {
                const { token, role, accountId } = data.payload;
                localStorage.setItem('jwt_token', token);
                localStorage.setItem('user_role', role);
                localStorage.setItem('account_id', accountId);
                window.location.href = '/dashboard';
            } else {
                passField.value = '';
                displayError(data.message || 'Invalid credentials');
                triggerErrorState([emailField, passField]);
            }
        } catch (error) {
            console.error(error);
            passField.value = '';
            displayError('Cannot connect to server');
            triggerErrorState([emailField, passField]);
        } finally {
            if (loginBtn) loginBtn.disabled = false;
        }
    }

    async function postLoginData(email: string, password: string) {
        if (!API_BASE) {
            console.error("PUBLIC_API_BASE_URL is missing in .env");
            throw new Error("Configuration Error");
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        try {
            const payload = await response.json();
            return { success: response.ok, message: payload.message, payload };
        } catch (e) {
            return { success: false, message: 'Invalid server response', payload: null };
        }
    }

    function displayError(message: string) {
        if (errorMsg) {
            errorMsg.innerText = message;
            errorMsg.classList.remove('hidden');
            errorMsg.style.display = 'block';
        }
    }

    function triggerErrorState(inputs: HTMLInputElement[]) {
        inputs.forEach(input => {
            input.classList.remove(...CLS_DEFAULT);
            input.classList.add(...CLS_ERROR);
        });

        if (loginCard) {
            loginCard.classList.remove('animate-shake');
            void loginCard.offsetWidth;
            loginCard.classList.add('animate-shake');

            setTimeout(() => {
                loginCard.classList.remove('animate-shake');
            }, ANIMATION_DURATION);
        }
    }

    function setupInputClearing(inputs: HTMLInputElement[]) {
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove(...CLS_ERROR);
                input.classList.add(...CLS_DEFAULT);

                if (errorMsg) {
                    errorMsg.classList.add('hidden');
                    errorMsg.style.display = 'none';
                }
            });
        });
    }
}

initLogin();