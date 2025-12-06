import { apiRequest } from "../lib/api.ts";

// --- INTERFACES ---
interface SectionDTO {
    sectionNo: number;
    sectionName: string;
    subjectCode: string;
    subjectTitle: string;
    units: number;
    schedule: string;
    status: string;
}

interface EnrollmentOfferingResponse {
    termName: string;
    studentType: string;
    sections: SectionDTO[];
    enrollmentStatus: string; // "ENROLLED" | "DRAFT" | "NONE"
    remarks?: string;
}

// --- STATE ---
let availableSections: SectionDTO[] = [];
const selectedSectionIds = new Set<number>();

// ==========================================
// 1. INITIALIZATION & ROUTING
// ==========================================
async function initEnrollment() {
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step');
    const year = urlParams.get('year');
    const sem = urlParams.get('sem');

    console.log("Init Enrollment with params:", { step, year, sem });

    // ROUTING LOGIC: Force the UI to match the URL
    if (step === '2') {
        // We are on Step 2: Hide Step 1, Show Step 2
        document.getElementById('step-1')?.classList.add('hidden');
        document.getElementById('step-2')?.classList.remove('hidden');

        // Update Header Text
        const displayYear = document.getElementById('display-year');
        const displaySem = document.getElementById('display-sem');
        if(displayYear && year) displayYear.innerText = decodeURIComponent(year);
        if(displaySem && sem) displaySem.innerText = decodeURIComponent(sem);

        // FETCH DATA
        await fetchEnrollmentOptions();
    } else {
        // We are on Step 1: Show Step 1, Hide Step 2
        document.getElementById('step-1')?.classList.remove('hidden');
        document.getElementById('step-2')?.classList.add('hidden');
    }
}

// ==========================================
// 2. FETCH DATA
// ==========================================
async function fetchEnrollmentOptions() {
    console.log("Fetching enrollment options...");

    try {
        const data = await apiRequest("/enrollment/options", "GET") as EnrollmentOfferingResponse;
        console.log("API Data:", data);

        availableSections = data.sections;

        // If user is already officially enrolled, we might want to disable checkboxes or show a message
        if (data.enrollmentStatus === 'ENROLLED') {
            console.warn("User is already enrolled. View might be read-only.");
            // You can add logic here to disable inputs if you want
        }

        renderTables();
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

// ==========================================
// 3. RENDER LOGIC
// ==========================================
function renderTables() {
    const tbodyRegular = document.getElementById('regular-table-body');
    if (!tbodyRegular) {
        console.error("Table body not found!");
        return;
    }

    tbodyRegular.innerHTML = '';

    if (availableSections.length === 0) {
        tbodyRegular.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-red-600 font-bold">No subjects available for this term.</td></tr>`;
        return;
    }

    const rowsHtml = availableSections.map((sec) => {
        const isOpen = sec.status === 'OPEN';

        return `
        <tr class="border-b border-plm-gold/30 hover:bg-gray-50 transition-colors ${!isOpen ? 'opacity-60 bg-gray-100' : ''}">
            <td class="py-2 px-3 border-r border-plm-gold/50 text-center">
                <input type="checkbox" 
                    class="section-checkbox w-4 h-4 text-plm-navy rounded border-gray-300 focus:ring-plm-navy cursor-pointer"
                    value="${sec.sectionNo}" 
                    data-units="${sec.units}"
                    ${!isOpen ? 'disabled' : ''} />
            </td>
            <td class="py-2 px-3 border-r border-plm-gold/50 font-bold">${sec.subjectCode}</td>
            <td class="py-2 px-3 border-r border-plm-gold/50 uppercase font-medium">
                ${sec.subjectTitle}
                <div class="text-xs text-gray-500">${sec.sectionName}</div>
            </td>
            <td class="py-2 px-3 border-r border-plm-gold/50 text-center font-bold">${sec.units}</td>
            <td class="py-2 px-2 text-center text-xs">
                ${sec.schedule} <br/>
                <span class="${isOpen ? 'text-green-600' : 'text-red-600'} font-bold text-[10px]">
                    ${sec.status}
                </span>
            </td>
        </tr>
        `;
    }).join('');

    tbodyRegular.innerHTML = rowsHtml;
    attachCheckboxListeners();
    console.log(`Rendered ${availableSections.length} rows.`);
}

// ==========================================
// 4. EVENT LISTENERS
// ==========================================
function attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.section-checkbox');
    const totalDisplay = document.getElementById('total-units-display');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const target = cb as HTMLInputElement;
            const id = parseInt(target.value);

            if (target.checked) selectedSectionIds.add(id);
            else selectedSectionIds.delete(id);

            // Calculate Total
            let total = 0;
            const checkedBoxes = document.querySelectorAll('.section-checkbox:checked');
            checkedBoxes.forEach(box => {
                total += parseInt(box.getAttribute('data-units') || '0');
            });

            if (totalDisplay) totalDisplay.innerText = total.toString();
        });
    });
}

// Step 1 -> Step 2 Navigation
document.getElementById('btn-to-step-2')?.addEventListener('click', () => {
    const yearSelect = document.getElementById('school-year') as HTMLSelectElement;
    const semSelect = document.getElementById('semester') as HTMLSelectElement;

    const year = yearSelect.value;
    const sem = semSelect.value;

    // This triggers a page reload which runs initEnrollment() again
    window.location.href = `/enrollment?step=2&year=${encodeURIComponent(year)}&sem=${encodeURIComponent(sem)}`;
});

// Step 2 -> Step 3 Navigation (Confirm Selection)
document.getElementById('btn-to-step-3')?.addEventListener('click', () => {
    if (selectedSectionIds.size === 0) {
        alert("Please select at least one subject.");
        return;
    }
    document.getElementById('step-2')?.classList.add('hidden');
    document.getElementById('step-3')?.classList.remove('hidden');
    renderConfirmation();
});

// Step 3 Rendering
function renderConfirmation() {
    const tbody = document.getElementById('confirmation-table-body');
    const finalUnits = document.getElementById('final-units');
    const regDate = document.getElementById('reg-date');

    if (!tbody) return;
    tbody.innerHTML = '';

    let totalUnits = 0;
    let idx = 1;

    availableSections.filter(s => selectedSectionIds.has(s.sectionNo)).forEach(item => {
        totalUnits += item.units;
        tbody.innerHTML += `
            <tr class="border-b border-plm-gold/30">
                <td class="py-2 px-3 border-r border-plm-gold/50 text-center font-bold">${idx++}</td>
                <td class="py-2 px-3 border-r border-plm-gold/50 font-bold">${item.subjectCode}</td>
                <td class="py-2 px-3 border-r border-plm-gold/50 uppercase font-medium">${item.subjectTitle}</td>
                <td class="py-2 px-3 border-r border-plm-gold/50 text-center font-bold">${item.units}</td>
                <td class="py-2 px-3 text-red-800 font-bold text-xs uppercase">${item.schedule}</td>
            </tr>
        `;
    });

    if(finalUnits) finalUnits.innerText = totalUnits.toString();
    if(regDate) regDate.innerText = new Date().toLocaleDateString();
}

// Final Submit
document.getElementById('btn-enroll')?.addEventListener('click', async () => {
    try {
        const response = await apiRequest("/enrollment/submit", "POST", {
            sectionIds: Array.from(selectedSectionIds)
        });
        alert(response.message);
        window.location.href = '/student_schedule';
    } catch (error: any) {
        alert("Enrollment Failed: " + error.message);
    }
});

// Cancel Buttons
document.getElementById('btn-cancel-step2')?.addEventListener('click', () => {
    window.location.href = '/enrollment';
});
document.getElementById('btn-cancel-step3')?.addEventListener('click', () => {
    document.getElementById('step-3')?.classList.add('hidden');
    document.getElementById('step-2')?.classList.remove('hidden');
});

// --- START APP ---
initEnrollment();