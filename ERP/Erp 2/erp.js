const tableBody = document.querySelector('#attendanceTable tbody');
const clearBtn = document.getElementById('clearData');

// --- Sample Student Data ---
const sampleStudents = [
  { id: '25CL0001', name: 'Shreyansh Gupta', class: '12', section: 'A', status: 'Present' },
  { id: '25CL0002', name: 'Priya Singh', class: '12', section: 'A', status: 'Absent' },
  { id: '25CL0003', name: 'Rahul Sharma', class: '12', section: 'B', status: 'Leave' },
  { id: '25CL0004', name: 'Ananya Verma', class: '12', section: 'B', status: 'Present' },
  { id: '25CL0005', name: 'Rohan Mehta', class: '12', section: 'A', status: 'Present' }
];

// Add today's date dynamically
sampleStudents.forEach(s => s.date = new Date().toLocaleDateString());

// Save to localStorage if empty
if (!localStorage.getItem('attendanceRecords')) {
  localStorage.setItem('attendanceRecords', JSON.stringify(sampleStudents));
}

// --- Load Attendance Table ---
function loadAttendance() {
  const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
  tableBody.innerHTML = '';

  if (records.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;">No attendance records yet.</td></tr>';
    return;
  }

  records.forEach(rec => {
    const statusClass = rec.status.toLowerCase() === 'present' ? 'status-present' :
                        rec.status.toLowerCase() === 'absent' ? 'status-absent' :
                        rec.status.toLowerCase() === 'leave' ? 'status-leave' : '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${rec.id}</td>
      <td>${rec.name}</td>
      <td>${rec.class}</td>
      <td>${rec.section}</td>
      <td class="${statusClass}">${rec.status}</td>
      <td>${rec.date}</td>
    `;
    tableBody.appendChild(row);
  });
}

// --- Clear All Records ---
clearBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to clear all records?")) {
    localStorage.removeItem('attendanceRecords');
    loadAttendance();
  }
});

// --- Initialize Table ---
loadAttendance();
