const API_BASE = import.meta.env.PUBLIC_API_BASE_URL;
const API_URL = `${API_BASE}/api/auth/login`;
const ANIMATION_DURATION = 400;

const CLS_DEFAULT = ['border-plm-gold', 'text-text-gray', 'focus:border-plm-navy', 'focus:text-black'];
const CLS_ERROR = ['border-error-red', 'text-error-red', 'focus:border-error-red', 'focus:text-error-red'];

// --- COOKIE HELPER ---
function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    // SameSite=Lax allows the cookie to be sent on navigation
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

export function initLogin() {
    const form = document.getElementById('loginForm') as HTMLFormElement | null;
    const errorMsg = document.getElementById('errorMessage') as HTMLElement | null;
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const loginCard = document.getElementById('loginCard') as HTMLElement | null;
    const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement | null;

    if (!form || !emailInput || !passwordInput || !loginBtn) return;

    setupInputClearing([emailInput, passwordInput]);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin(emailInput, passwordInput);
    });

    async function handleLogin(emailField: HTMLInputElement, passField: HTMLInputElement) {
        const email = emailField.value;
        const password = passField.value;

        if (!email || !password) return;
        if (loginBtn) loginBtn.disabled = true;

        try {
            const responseWrapper = await postLoginData(email, password);

            if (responseWrapper.success) {
                const backendData = responseWrapper.payload.data;
                const token = backendData.token;

                // Assume the first role is the active one, or default to STUDENT
                const roles = backendData.roles || [];
                let primaryRole = "STUDENT";
                if (roles.includes("ADMIN")) primaryRole = "ADMIN";
                else if (roles.includes("PROFESSOR")) primaryRole = "PROFESSOR";
                else if (roles.length > 0) primaryRole = roles[0];

                const profile = backendData.profile;

                // --- 1. SET COOKIES (Vital for Astro SSR) ---
                setCookie('jwt_token', token, 1);
                setCookie('user_role', primaryRole, 1);

                // Base64 encode profile to safely store in cookie
                // In production, simpler to just store ID and fetch profile on dashboard,
                // but this works for quick UI hydration.
                const safeProfile = btoa(JSON.stringify(profile));
                setCookie('user_profile', safeProfile, 1);

                // --- 2. REDIRECT ---
                // We always go to /dashboard. The server will decide what to show based on the cookie.
                window.location.href = '/dashboard';

            } else {
                passField.value = '';
                const msg = responseWrapper.payload?.message || 'Invalid credentials';
                displayError(msg);
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
            // Optional: fallback for dev
            // return { success: false, message: 'Config Error', payload: null };
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const payload = await response.json();
            const isSuccess = response.ok && payload.success;
            return { success: isSuccess, message: payload.message, payload };
        } catch (e) {
            return { success: false, message: 'Server unreachable', payload: null };
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