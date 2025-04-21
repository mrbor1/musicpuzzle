const startListeningBtn = document.getElementById("listenBtn");
const noteDisplay = document.getElementById("noteDisplay");

let audioContext;
let analyserNode;
let sourceNode;
let pitchDetector;
let buffer = new Float32Array(2048);
let detectedNotes = [];

const noteFrequencies = {
  B: 246.94,
  A: 220.00,
  G: 196.00,
};

const expectedSequence = ['B', 'A', 'G'];

function frequencyToNote(freq) {
  const notes = Object.entries(noteFrequencies);
  for (let [note, noteFreq] of notes) {
    if (Math.abs(freq - noteFreq) < 10) {
      return note;
    }
  }
  return null;
}

function checkAnswer() {
  const recent = detectedNotes.slice(-3).join('');
  const target = expectedSequence.join('');
  if (recent === target) {
    noteDisplay.textContent = "🎉 Correct! Congratulations!";
    document.getElementById("nextStageBtn").style.display = "block";
  }
}

async function startListening() {
  startListeningBtn.disabled = true;
  startListeningBtn.textContent = "Listening...";

  audioContext = new AudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  sourceNode = audioContext.createMediaStreamSource(stream);
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 2048;
  sourceNode.connect(analyserNode);

  pitchDetector = Pitchy.createPitchDetector(audioContext.sampleRate);

  function listen() {
    analyserNode.getFloatTimeDomainData(buffer);
    const [pitch, clarity] = pitchDetector.findPitch(buffer);

    console.log("Pitch:", pitch, "Clarity:", clarity);

    if (clarity > 0.9 && pitch) {
      const note = frequencyToNote(pitch);
      if (note && detectedNotes[detectedNotes.length - 1] !== note) {
        detectedNotes.push(note);
        console.log("Detected note:", note);
        noteDisplay.textContent = `Detected note: ${note}`;
        checkAnswer();
      }
    }

    requestAnimationFrame(listen);
  }

  listen();
}

startListeningBtn.addEventListener("click", startListening);
