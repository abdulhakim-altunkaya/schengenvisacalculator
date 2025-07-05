let trips = [];

const entryInput = document.getElementById('entryDate');
const exitInput = document.getElementById('exitDate');
const addTripBtn = document.getElementById('addTripBtn');
const tripList = document.getElementById('tripList');
const resultArea = document.getElementById('resultArea');

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

function renderTrips() {
  tripList.innerHTML = '';
  trips.forEach((trip, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="resultText1">${trip.entryDate} ➝ ${trip.exitDate}</span>: ${trip.duration} days 
      <span class="delete-btn" data-index="${index}" title="Delete">❌</span>`;
    tripList.appendChild(li);
  });

  // Add delete listeners
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const index = btn.getAttribute('data-index');
      trips.splice(index, 1);
      renderTrips();
      updateResult();
    });
  });
}


function calculateDaysInLast180() {
  const today = new Date();
  return trips.reduce((total, trip) => {
    const tripEnd = new Date(trip.exitDate);
    const duration = calculateDays(trip.entryDate, trip.exitDate);
    if ((today - tripEnd) <= 180 * 24 * 60 * 60 * 1000) {
      return total + duration;
    }
    return total;
  }, 0);
}

function updateResult() {
  const remainingDays = 90 - calculateDaysInLast180();
  resultArea.innerHTML = '';

  if (remainingDays < 90) {
    const heading = document.createElement('h3');
    heading.textContent = 'Remaining Days';
    resultArea.appendChild(heading);
  }

  const message = document.createElement('p');
  if (remainingDays > 0) {
    message.textContent = `You have ${remainingDays} days remaining in your Schengen visa period.`;
    resultArea.appendChild(message);

    if (trips.length > 0) {
      const latestTrip = trips.reduce((latest, current) =>
        new Date(current.exitDate) > new Date(latest.exitDate) ? current : latest
      );

      const nextEntryDate = new Date(latestTrip.exitDate);
      nextEntryDate.setDate(nextEntryDate.getDate() + 1);

      const nextExitDate = new Date(nextEntryDate);
      nextExitDate.setDate(nextExitDate.getDate() + remainingDays - 1);

      const format = (date) => date.toISOString().split('T')[0];

      const nextInfo = document.createElement('p');
      nextInfo.innerHTML = `You can next enter on: <strong>${format(nextEntryDate)}</strong><br>
                            And must leave by: <strong>${format(nextExitDate)}</strong>`;
      resultArea.appendChild(nextInfo);
    }

  } else {
    message.textContent = 'Warning: You have exceeded your Schengen visa stay.';
    resultArea.appendChild(message);
  }
}


addTripBtn.addEventListener('click', () => {
  const entryDate = entryInput.value;
  const exitDate = exitInput.value;
  if (entryDate && exitDate && new Date(exitDate) >= new Date(entryDate)) {
    const newTrip = {
      entryDate,
      exitDate,
      duration: calculateDays(entryDate, exitDate)
    };
    trips.push(newTrip);
    entryInput.value = '';
    exitInput.value = '';
    renderTrips();
    updateResult();
  } else {
    alert('Invalid dates. Please check your input.');
  }
});

// Optional: Log page visit like in original React code
fetch('/serversavevisitor/tools_schengen', { method: 'POST' }).catch(err => {
  console.error('Visit logging failed:', err.message);
});
