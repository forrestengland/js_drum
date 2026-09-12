import { useEffect, useRef, useState } from "react";

const TRACKS = ["Kick", "Snare", "Hi-Hat", "Open Hat"];
const STEPS = 16;

const initialPattern = [
  // Kick
  [true, false, false, false, true, false, false, false,
   true, false, false, false, true, false, false, false],

  // Snare
  [false, false, false, false, true, false, false, false,
   false, false, false, false, true, false, false, false],

  // Hi-hat
  [true, false, true, false, true, false, true, false,
   true, false, true, false, true, false, true, false],

  // Open hat
  new Array(STEPS).fill(false)
];


function DrumMachine() {

  const [pattern, setPattern] = useState(initialPattern);
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const audioContextRef = useRef(null);
  const timerRef = useRef(null);
    const stepRef = useRef(0);

    const patternRef = useRef(pattern);
    const bpmRef = useRef(bpm);

    useEffect(() => {
	patternRef.current = pattern;
    }, [pattern]);

    useEffect(() => {
	bpmRef.current = bpm;
    }, [bpm]);

  // --------------------------------------------------
  // Audio context
  // --------------------------------------------------

  function getAudioContext() {

    if (!audioContextRef.current) {
      audioContextRef.current =
        new AudioContext();
    }

    return audioContextRef.current;
  }


  // --------------------------------------------------
  // Kick
  // --------------------------------------------------

  function playKick(time) {

    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      150,
      time
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      45,
      time + 0.15
    );

    gain.gain.setValueAtTime(1, time);

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + 0.25
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(time);
    oscillator.stop(time + 0.25);
  }


  // --------------------------------------------------
  // Snare
  // --------------------------------------------------

  function playSnare(time) {

    const ctx = getAudioContext();

    const bufferSize =
      ctx.sampleRate * 0.2;

    const buffer =
      ctx.createBuffer(
        1,
        bufferSize,
        ctx.sampleRate
      );

    const data =
      buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise =
      ctx.createBufferSource();

    noise.buffer = buffer;

    const filter =
      ctx.createBiquadFilter();

    filter.type = "highpass";
    filter.frequency.value = 1000;

    const gain = ctx.createGain();

    gain.gain.setValueAtTime(
      0.7,
      time
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + 0.2
    );

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + 0.2);
  }


  // --------------------------------------------------
  // Hi-hat
  // --------------------------------------------------

  function playHiHat(time) {

    const ctx = getAudioContext();

    const bufferSize =
      ctx.sampleRate * 0.08;

    const buffer =
      ctx.createBuffer(
        1,
        bufferSize,
        ctx.sampleRate
      );

    const data =
      buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise =
      ctx.createBufferSource();

    noise.buffer = buffer;

    const filter =
      ctx.createBiquadFilter();

    filter.type = "highpass";
    filter.frequency.value = 5000;

    const gain = ctx.createGain();

    gain.gain.setValueAtTime(
      0.4,
      time
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + 0.08
    );

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + 0.08);
  }


  // --------------------------------------------------
  // Open hi-hat
  // --------------------------------------------------

  function playOpenHat(time) {

    const ctx = getAudioContext();

    const bufferSize =
      ctx.sampleRate * 0.35;

    const buffer =
      ctx.createBuffer(
        1,
        bufferSize,
        ctx.sampleRate
      );

    const data =
      buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise =
      ctx.createBufferSource();

    noise.buffer = buffer;

    const filter =
      ctx.createBiquadFilter();

    filter.type = "highpass";
    filter.frequency.value = 5000;

    const gain = ctx.createGain();

    gain.gain.setValueAtTime(
      0.35,
      time
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + 0.35
    );

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(time);
    noise.stop(time + 0.35);
  }


  // --------------------------------------------------
  // Play a track
  // --------------------------------------------------

  function playTrack(track, time) {

    switch (track) {

      case 0:
        playKick(time);
        break;

      case 1:
        playSnare(time);
        break;

      case 2:
        playHiHat(time);
        break;

      case 3:
        playOpenHat(time);
        break;

      default:
        break;
    }
  }


  // --------------------------------------------------
  // Sequencer
  // --------------------------------------------------

  function playStep() {

    if (!playing) {
      return;
    }

    const ctx = getAudioContext();

    const step = stepRef.current;

    const time = ctx.currentTime;

    patternRef.current.forEach((track, trackIndex) => {

      if (track[step]) {
        playTrack(trackIndex, time);
      }

    });

    setCurrentStep(step);

    stepRef.current =
      (step + 1) % STEPS;

    const interval =
      (60_000 / bpmRef.current) / 4;

    timerRef.current =
      setTimeout(playStep, interval);
  }


  // --------------------------------------------------
  // Start / stop
  // --------------------------------------------------

  async function start() {

    const ctx = getAudioContext();

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    setPlaying(true);
  }


  function stop() {

    setPlaying(false);

    clearTimeout(timerRef.current);

    stepRef.current = 0;
    setCurrentStep(0);
  }


  // Start the sequencer when playing changes
  useEffect(() => {

    if (playing) {
      playStep();
    }

    return () => {
      clearTimeout(timerRef.current);
    };

  }, [playing]);


  // --------------------------------------------------
  // Toggle step
  // --------------------------------------------------

  function toggleStep(trackIndex, stepIndex) {

    setPattern(previous => {

      const next =
        previous.map(track => [...track]);

      next[trackIndex][stepIndex] =
        !next[trackIndex][stepIndex];

      return next;
    });
  }


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="drum-machine">

      <h1>Drum Machine</h1>

      <div className="controls">

        <button onClick={start}>
          Play
        </button>

        <button onClick={stop}>
          Stop
        </button>

        <label>
          BPM

          <input
            type="range"
            min="60"
            max="180"
            value={bpm}
            onChange={e =>
              setBpm(Number(e.target.value))
            }
          />

          <span>{bpm}</span>
        </label>

      </div>


      <div className="sequencer">

        {TRACKS.map((track, trackIndex) => (

          <div
            className="track"
            key={track}
          >

            <div className="track-name">
              {track}
            </div>

            <div className="steps">

              {pattern[trackIndex].map(
                (active, stepIndex) => (

                  <button
                    key={stepIndex}
                    className={[
                      "step",

                      active
                        ? "active"
                        : "",

                      currentStep === stepIndex &&
                      playing
                        ? "current"
                        : "",

                      stepIndex % 4 === 0
                        ? "beat"
                        : ""
                    ].join(" ")}

                    onClick={() =>
                      toggleStep(
                        trackIndex,
                        stepIndex
                      )
                    }
                  />

                )
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default DrumMachine;
