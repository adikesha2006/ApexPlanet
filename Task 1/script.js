function learnHTML() {
  alert("HTML is the structure behind a page — it holds the content together.");
}

function learnCSS() {
  alert("CSS shapes the look and feel of a page, making it feel cleaner and more polished.");
}

function learnJS() {
  alert("JavaScript brings a page to life with small interactions and dynamic updates.");
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  document.getElementById("clock").textContent = time;
}

setInterval(updateClock, 1000);
updateClock();

const messages = [
  "Keep going — progress still counts, even when it feels slow.",
  "Small efforts add up faster than they seem.",
  "You do not need to be perfect to begin.",
  "Every project starts with a first step, and this is yours.",
  "Learning is a process, and you are already in it.",
];

function showMessage() {
  const random = Math.floor(Math.random() * messages.length);
  alert(messages[random]);
}
