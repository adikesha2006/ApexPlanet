document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     TOAST SYSTEM
     ========================================================= */
  const toastWrapper = document.getElementById('toast-wrapper');

  function showToast(message, type = 'info', duration = 3200) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('data-type', type);
    toast.textContent = message;
    toastWrapper.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--leaving');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
  }

  /* =========================================================
     SESSION LOG
     ========================================================= */
  const logList = document.getElementById('log-list');
  const logEmpty = document.getElementById('log-empty');

  function logActivity(message) {
    if (logEmpty && logEmpty.parentNode) logEmpty.remove();

    const item = document.createElement('li');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    item.innerHTML = `<span class="mono">${time}</span>${message}`;
    logList.prepend(item);

    // keep the log from growing indefinitely
    while (logList.children.length > 8) {
      logList.removeChild(logList.lastChild);
    }
  }

  /* =========================================================
     QUIZ COMPONENT
     ========================================================= */
  const QUESTIONS = [
    {
      question: 'What is the average time complexity of searching in a balanced binary search tree?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 1
    },
    {
      question: 'In JavaScript, what does the `===` operator check that `==` does not?',
      options: [
        'Whether both operands are functions',
        'Whether the values are truthy',
        'Whether the type also matches, with no coercion',
        'Whether the variables share the same memory address'
      ],
      correctIndex: 2
    },
    {
      question: 'Which data structure underlies the call stack used for function execution?',
      options: ['Queue', 'Stack', 'Linked list', 'Hash map'],
      correctIndex: 1
    },
    {
      question: 'What does the `fetch()` API return?',
      options: [
        'A synchronous response object',
        'A callback function',
        'A Promise that resolves to a Response object',
        'An XMLHttpRequest instance'
      ],
      correctIndex: 2
    },
    {
      question: 'Which sorting algorithm has a worst-case time complexity of O(n log n)?',
      options: ['Bubble sort', 'Insertion sort', 'Merge sort', 'Selection sort'],
      correctIndex: 2
    }
  ];

  const quizState = {
    currentIndex: 0,
    score: 0,
    locked: false
  };

  const questionEl = document.getElementById('quiz-question');
  const optionsEl = document.getElementById('quiz-options');
  const feedbackEl = document.getElementById('quiz-feedback');
  const progressLabel = document.getElementById('quiz-progress-label');
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const scoreEl = document.getElementById('quiz-score');
  const nextBtn = document.getElementById('next-question');
  const resetBtn = document.getElementById('reset-quiz');

  function renderQuestion() {
    const q = QUESTIONS[quizState.currentIndex];
    quizState.locked = false;
    feedbackEl.textContent = '';
    feedbackEl.removeAttribute('data-state');
    nextBtn.disabled = true;

    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';

    q.options.forEach((optionText, index) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.setAttribute('data-index', index);

      const tag = document.createElement('span');
      tag.className = 'option-tag mono';
      tag.textContent = String.fromCharCode(65 + index);

      const label = document.createElement('span');
      label.textContent = optionText;

      btn.appendChild(tag);
      btn.appendChild(label);
      btn.addEventListener('click', () => handleOptionSelect(index, btn));

      li.appendChild(btn);
      optionsEl.appendChild(li);
    });

    progressLabel.textContent = `Question ${quizState.currentIndex + 1} of ${QUESTIONS.length}`;
    progressBar.setAttribute('aria-valuenow', quizState.currentIndex);
    progressFill.style.width = `${(quizState.currentIndex / QUESTIONS.length) * 100}%`;
    scoreEl.textContent = `Score: ${quizState.score} / ${QUESTIONS.length}`;
  }

  function handleOptionSelect(selectedIndex, selectedBtn) {
    if (quizState.locked) return;
    quizState.locked = true;

    const q = QUESTIONS[quizState.currentIndex];
    const allOptionButtons = Array.from(optionsEl.querySelectorAll('.quiz-option'));

    allOptionButtons.forEach((btn) => {
      const idx = Number(btn.getAttribute('data-index'));
      btn.disabled = true;

      if (idx === q.correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex) {
        btn.classList.add('incorrect');
      } else {
        btn.classList.add('dim');
      }
    });

    if (selectedIndex === q.correctIndex) {
      quizState.score += 1;
      feedbackEl.textContent = 'Correct — nicely done.';
      feedbackEl.setAttribute('data-state', 'correct');
      showToast('Correct answer', 'success');
    } else {
      const correctLetter = String.fromCharCode(65 + q.correctIndex);
      feedbackEl.textContent = `Not quite. The correct answer was ${correctLetter}.`;
      feedbackEl.setAttribute('data-state', 'incorrect');
      showToast('Incorrect answer', 'error');
    }

    scoreEl.textContent = `Score: ${quizState.score} / ${QUESTIONS.length}`;
    logActivity(`Answered question ${quizState.currentIndex + 1}`);

    const isLastQuestion = quizState.currentIndex === QUESTIONS.length - 1;
    nextBtn.disabled = false;
    nextBtn.textContent = isLastQuestion ? 'View results' : 'Next question';
  }

  function goToNextQuestion() {
    const isLastQuestion = quizState.currentIndex === QUESTIONS.length - 1;

    if (isLastQuestion) {
      showFinalResults();
      return;
    }

    quizState.currentIndex += 1;
    nextBtn.textContent = 'Next question';
    renderQuestion();
  }

  function showFinalResults() {
    questionEl.textContent = `Assessment complete — you scored ${quizState.score} out of ${QUESTIONS.length}.`;
    optionsEl.innerHTML = '';
    feedbackEl.textContent = quizState.score === QUESTIONS.length
      ? 'Perfect score.'
      : 'Reset the quiz to try again.';
    feedbackEl.removeAttribute('data-state');
    progressFill.style.width = '100%';
    progressBar.setAttribute('aria-valuenow', QUESTIONS.length);
    nextBtn.disabled = true;
    logActivity('Completed assessment');
    showToast(`Assessment finished: ${quizState.score}/${QUESTIONS.length}`, 'info');
  }

  function resetQuiz() {
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizState.locked = false;
    nextBtn.textContent = 'Next question';
    renderQuestion();
    logActivity('Quiz reset');
    showToast('Quiz reset', 'info');
  }

  nextBtn.addEventListener('click', goToNextQuestion);
  resetBtn.addEventListener('click', resetQuiz);

  renderQuestion();

  /* =========================================================
     WEATHER CONSOLE — Open-Meteo integration
     ========================================================= */
  const weatherForm = document.getElementById('weather-form');
  const cityInput = document.getElementById('city-input');
  const consoleOutput = document.getElementById('console-output');
  const submitBtn = document.getElementById('weather-submit');
  const submitLabel = document.getElementById('weather-submit-label');

  const WEATHER_CODES = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };

  function describeWeatherCode(code) {
    return WEATHER_CODES[code] || 'Conditions unavailable';
  }

  async function geocodeCity(cityName) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Geocoding service is unreachable right now.');
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`No location found for "${cityName}". Check the spelling and try again.`);
    }

    return data.results[0];
  }

  async function fetchCurrentWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Forecast service is unreachable right now.');
    }

    const data = await response.json();

    if (!data.current) {
      throw new Error('Forecast data was empty for this location.');
    }

    return data.current;
  }

  function renderWeatherResult(place, current) {
    const locationLabel = [place.name, place.admin1, place.country].filter(Boolean).join(', ');

    consoleOutput.innerHTML = `
      <div class="console-result">
        <p class="console-result__place">${locationLabel}</p>
        <p class="console-result__coords mono">${place.latitude.toFixed(2)}°, ${place.longitude.toFixed(2)}° &middot; ${describeWeatherCode(current.weather_code)}</p>
        <div class="console-result__grid">
          <div class="console-metric">
            <p class="console-metric__label">Temperature</p>
            <p class="console-metric__value">${current.temperature_2m}°C</p>
          </div>
          <div class="console-metric">
            <p class="console-metric__label">Humidity</p>
            <p class="console-metric__value">${current.relative_humidity_2m}%</p>
          </div>
          <div class="console-metric">
            <p class="console-metric__label">Wind speed</p>
            <p class="console-metric__value">${current.wind_speed_10m} km/h</p>
          </div>
          <div class="console-metric">
            <p class="console-metric__label">Conditions</p>
            <p class="console-metric__value">${describeWeatherCode(current.weather_code)}</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderWeatherError(message) {
    consoleOutput.innerHTML = `<p class="console-error">${message}</p>`;
  }

  function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    submitLabel.textContent = isLoading ? 'Fetching…' : 'Fetch data';
  }

  weatherForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();

    if (!city) return;

    setLoadingState(true);

    try {
      const place = await geocodeCity(city);
      const current = await fetchCurrentWeather(place.latitude, place.longitude);
      renderWeatherResult(place, current);
      logActivity(`Fetched weather for ${place.name}`);
      showToast(`Weather loaded for ${place.name}`, 'success');
    } catch (error) {
      renderWeatherError(error.message || 'Something went wrong while fetching weather data.');
      logActivity(`Weather lookup failed for "${city}"`);
      showToast('Weather lookup failed', 'error');
    } finally {
      setLoadingState(false);
    }
  });

});