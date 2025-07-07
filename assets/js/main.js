let trips = [];

const entryInput = document.getElementById('entryDate');
const exitInput = document.getElementById('exitDate');
const addTripBtn = document.getElementById('addTripBtn');
const tripList = document.getElementById('tripList');
const resultArea = document.getElementById('resultArea');

// Handle Enter key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') e.preventDefault();
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') addTripBtn.click();
});

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

function datesOverlap(start1, end1, start2, end2) {
  return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
}

function renderTrips() {
  tripList.innerHTML = '';
  trips.forEach((trip, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="resultText1">${trip.entryDate} ➝ ${trip.exitDate}</span>: ${trip.duration} days 
      <span class="delete-btn" data-index="${index}" title="Delete">❌</span>`;
    tripList.appendChild(li);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = btn.getAttribute('data-index');
      trips.splice(index, 1);
      renderTrips();
      updateResult();
    });
  });
}

function calculateDaysInWindow(referenceDate) {
  const ref = new Date(referenceDate);
  const windowStart = new Date(ref);
  windowStart.setDate(ref.getDate() - 179); // 180-day window
  return trips.reduce((total, trip) => {
    const entry = new Date(trip.entryDate);
    const exit = new Date(trip.exitDate);
    if (exit >= windowStart && entry <= ref) {
      const start = entry < windowStart ? windowStart : entry;
      const end = exit > ref ? ref : exit;
      total += calculateDays(start, end);
    }
    return total;
  }, 0);
}

function hasOverstay() {
  const allDays = [];

  trips.forEach(trip => {
    let current = new Date(trip.entryDate);
    const end = new Date(trip.exitDate);
    while (current <= end) {
      allDays.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });

  allDays.sort((a, b) => a - b);

  for (let i = 0; i < allDays.length; i++) {
    const windowStart = new Date(allDays[i]);
    windowStart.setDate(windowStart.getDate() - 179);
    const count = allDays.filter(day => day >= windowStart && day <= allDays[i]).length;
    if (count > 90) return true;
  }

  return false;
}

function updateResult() {
  resultArea.innerHTML = '';
  
  const latestExit = trips.reduce((latest, current) =>
    new Date(current.exitDate) > new Date(latest.exitDate) ? current : latest
  );
  const latestDate = new Date(latestExit.exitDate);
  const remainingDays = 90 - calculateDaysInWindow(latestDate);


  if (hasOverstay()) {
    const warning = document.createElement('p');
    warning.textContent = 'Warning: You have exceeded your Schengen visa stay.';
    resultArea.appendChild(warning);
    return;
  }

  if (remainingDays < 90) {
    const heading = document.createElement('h3');
    heading.textContent = 'Remaining Days';
    resultArea.appendChild(heading);
  }

  const message = document.createElement('p');
  message.textContent = `You have ${remainingDays} days remaining in your Schengen visa period.`;
  resultArea.appendChild(message);

  if (trips.length > 0 && remainingDays > 0) {
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
}

async function logVisitor() {
  try {
    const response = await axios.post('https://www.ipradar.org/api/save-visitor/schengen', {});
    console.log('Visitor log response:', response.data);
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn('Visitor already logged recently; skipping.');
    } else {
      console.error('Visitor log error:', error.message);
    }
  }
}

addTripBtn.addEventListener('click', () => {
  const entryDate = entryInput.value;
  const exitDate = exitInput.value;
  const entry = new Date(entryDate);
  const exit = new Date(exitDate);

  if (!entryDate || !exitDate || exit < entry) {
    alert('Invalid dates. Please check your input.');
    return;
  }

  const overlap = trips.some(t =>
    datesOverlap(t.entryDate, t.exitDate, entryDate, exitDate)
  );

  if (overlap) {
    alert('Trip overlaps with an existing one. Please fix the dates.');
    return;
  }

  const newTrip = {
    entryDate,
    exitDate,
    duration: calculateDays(entryDate, exitDate)
  };

  trips.push(newTrip);

  // Sort by entry date
  trips.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));

  entryInput.value = '';
  exitInput.value = '';
  renderTrips();
  updateResult();
  logVisitor();
});
