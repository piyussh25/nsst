const form = document.getElementById('login-form');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/get-attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();

            let totalWorkingHours = 0;
            if (data.events && data.events.length > 0) {
                data.events.forEach(event => {
                    if (event.location.toLowerCase().includes('online')) {
                        totalWorkingHours += 2;
                    } else {
                        totalWorkingHours += 4;
                    }
                });
            }

            const maxHours = 80;
            const percentage = (totalWorkingHours / maxHours) * 100;

            let statusText = '';
            let statusColor = '';
            let batteryFillColor = '';

            if (totalWorkingHours >= maxHours) {
                statusText = 'Completed';
                statusColor = 'text-green-600';
                batteryFillColor = '#22c55e'; // Green
            } else if (totalWorkingHours >= 20) {
                statusText = 'Good';
                statusColor = 'text-green-600';
                batteryFillColor = '#22c55e'; // Green
            } else if (totalWorkingHours >= 10) {
                statusText = 'Average';
                statusColor = 'text-yellow-600';
                batteryFillColor = '#eab308'; // Yellow
            } else {
                statusText = 'Danger: Your attendance is very low';
                statusColor = 'text-red-600';
                batteryFillColor = '#ef4444'; // Red
            }

            // Calculate battery fill width (e.g., 20 units wide, 16 units high for the fill)
            const fillWidth = Math.min(20, (percentage / 100) * 20);

            const batteryIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" class="battery-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
                    <path d="M23 13v-2"></path>
                    <rect x="2" y="7" width="${fillWidth}" height="10" rx="1" ry="1" fill="${batteryFillColor}" stroke="none"></rect>
                </svg>
            `;

            let htmlContent = `
                <div class="bg-white p-6 rounded-lg shadow-xl mb-8 border border-blue-200 relative">
                    <h2 class="text-2xl font-bold text-blue-700 mb-4">Student Profile</h2>
                    <div class="space-y-2 text-lg text-gray-700">
                        <p><strong>Name:</strong> <span class="font-semibold text-gray-900">${data.student.name}</span></p>
                        <p><strong>Student ID:</strong> <span class="font-semibold text-gray-900">${data.student.studentId}</span></p>
                        <p><strong>Branch:</strong> <span class="font-semibold text-gray-900">${data.student.branch}</span></p>
                        <p class="text-xl font-bold ${statusColor} pt-4 flex items-center justify-between">
                            <span>Total Working Hours: ${totalWorkingHours}/${maxHours} hours</span>
                            <span class="flex items-center">
                                ${batteryIcon}
                                <span class="ml-2 text-base">${statusText}</span>
                            </span>
                        </p>
                    </div>
                </div>
            `;

            // Events Section
            htmlContent += `
                <div class="bg-white p-6 rounded-lg shadow-xl mb-8 border border-green-200">
                    <h2 class="text-2xl font-bold text-green-700 mb-4">Events Attended</h2>
            `;
            if (data.events && data.events.length > 0) {
                htmlContent += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;
                data.events.forEach((event, index) => {
                    htmlContent += `
                        <div class="event-card">
                            <p class="text-lg font-semibold text-gray-900 mb-1">S.No. ${index + 1}: ${event.name}</p>
                            <p class="text-sm text-gray-600"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                        </div>
                    `;
                });
                htmlContent += `</div>`;
            } else {
                htmlContent += `<p class="text-gray-600 italic">No events attended yet.</p>`;
            }
            htmlContent += `</div>`;

            // Department Work Section
            htmlContent += `
                <div class="bg-white p-6 rounded-lg shadow-xl border border-purple-200">
                    <h2 class="text-2xl font-bold text-purple-700 mb-4">Department Work</h2>
            `;
            if (data.departmentWork && data.departmentWork.length > 0) {
                htmlContent += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;
                data.departmentWork.forEach(work => {
                    htmlContent += `
                        <div class="event-card">
                            <p class="text-lg font-semibold text-gray-900 mb-1">${work.workDescription}</p>
                            <p class="text-sm text-gray-600"><strong>Date:</strong> ${new Date(work.date).toLocaleDateString()}</p>
                            <p class="text-sm text-gray-600"><strong>Department:</strong> ${work.department}</p>
                            <p class="text-sm text-blue-600 font-medium"><strong>Hours:</strong> ${work.workingHours} hrs</p>
                        </div>
                    `;
                });
                htmlContent += `</div>`;
            } else {
                htmlContent += `<p class="text-gray-600 italic">No department work recorded yet.</p>`;
            }
            htmlContent += `</div>`;

            resultDiv.innerHTML = htmlContent;
        } else {
            resultDiv.innerHTML = 'Error: ' + await response.text();
        }
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = 'An error occurred.';
    }
});