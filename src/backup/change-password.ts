// src/scripts/change-password.ts
import { apiRequest } from "../lib/api.ts";

// 1. Password Visibility Toggle Logic
// We attach this to the window object if it's called via onclick="..." in HTML,
// OR better yet, we attach listeners directly here to avoid polluting 'window'.
function setupToggle(inputId: string, btnId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const btn = document.getElementById(btnId);

    if (!input || !btn) return;

    btn.addEventListener('click', () => {
        const icon = btn.querySelector('svg');
        if (input.type === "password") {
            input.type = "text";
            // Update Icon to Open Eye
            if(icon) icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
        } else {
            input.type = "password";
            // Update Icon to Closed Eye
            if(icon) icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />`;
        }
    });
}

// 2. Form Submission Logic
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPass = (document.getElementById('current-password') as HTMLInputElement).value;
        const newPass = (document.getElementById('new-password') as HTMLInputElement).value;
        const confirmPass = (document.getElementById('confirm-password') as HTMLInputElement).value;

        if (newPass !== confirmPass) {
            alert("New passwords do not match!");
            return;
        }

        try {
            const response = await apiRequest("/account/change-password", "POST", { oldPass, newPass });
            alert(response.message);
            form.reset();
        } catch (error: any) {
            alert("Error: " + error.message);
        }
    });
}

// Initialize Toggles (Assuming you add IDs to your toggle buttons in HTML)
setupToggle('current-password', 'btn-toggle-current');
setupToggle('new-password', 'btn-toggle-new');
setupToggle('confirm-password', 'btn-toggle-confirm');