import { useState, useRef, useEffect } from 'react';

function SequencerTrack({ trackNum, seq, setSeq, currentStep }) {

    function stepClicked(i) {
	console.log(`step ${i} clicked on track ${trackNum}`);
	const s = [...seq];
	s[i] = !s[i];
	setSeq(s);
    }

    function addStepClicked() {
	console.log(`add step clicked`);
	const s = [...seq];
	s.push(0);
	setSeq(s);
    }

    function delStepClicked() {
	console.log(`delete step clicked`);
	const s = [...seq];
	s.pop();
	setSeq(s);
    }

    return (
	<div>
	    <span className="drum-step" onClick={addStepClicked}>[+]</span>
	    <span className="drum-step" onClick={delStepClicked}>[-]</span>
	    { seq.map((step, i) => (<span className={i === currentStep ? "drum-step current-step" : "drum-step"} key={i} onClick={() => stepClicked(i)}>[{seq[i] ? <span>O</span> : <span>  </span>}]</span>)) }
	</div>
    );
}

export default function MyDrumMachine() {

    const [ playing, setPlaying ] = useState(false);
    const [ seq, setSeq ] = useState([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    const [ seq2, setSeq2 ] = useState([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);    
    const [ currentStep, setCurrentStep ] = useState(0);
    const [ currentStep2, setCurrentStep2 ] = useState(0);    
    const [ decay1, setDecay1 ]  = useState(0.25);
    const [ noiseDecay, setNoiseDecay ]  = useState(0.25);
    const [ pitch1, setPitch1 ]  = useState(0.25);    

    const audioContextRef = useRef(null);
    const timerRef = useRef(null);

    const seqRef = useRef(null);
    const seq2Ref = useRef(null);    
    const currentStepRef = useRef(0);
    const currentStep2Ref = useRef(0);    
    const decay1Ref = useRef(null);
    const noiseDecayRef = useRef(null);    
    const pitch1Ref = useRef(null);    

    // Start the sequencer when playing changes
    useEffect(() => {
	if (playing) {
	    playStep();
	}

	return () => {
	    clearTimeout(timerRef.current);
	};

    }, [playing]);

    useEffect(() => {
	seqRef.current = seq;
    }, [seq]);

    useEffect(() => {
	seq2Ref.current = seq2;
    }, [seq2]);

    useEffect(() => {
	currentStepRef.current = currentStep;
    }, [currentStep]);

    useEffect(() => {
	currentStep2Ref.current = currentStep2;
    }, [currentStep2]);

    useEffect(() => {
	decay1Ref.current = decay1;
    }, [decay1]);

    useEffect(() => {
	noiseDecayRef.current = noiseDecay;
    }, [noiseDecay]);

    useEffect(() => {
	pitch1Ref.current = pitch1;
    }, [pitch1]);


    function getAudioContext() {

	if (!audioContextRef.current) {
	    audioContextRef.current = new AudioContext();
	}
	return audioContextRef.current;
    }

    function playKick(time) {

	const ctx = getAudioContext();

	const oscillator = ctx.createOscillator();
	const gain = ctx.createGain();

	oscillator.type = "sine";

	oscillator.frequency.setValueAtTime(pitch1Ref.current * 500, time);
//	console.log(`decay1: ${decay1}`);
	oscillator.frequency.exponentialRampToValueAtTime(pitch1Ref.current * 150, time + decay1Ref.current);
	gain.gain.setValueAtTime(0.5, time);
	gain.gain.exponentialRampToValueAtTime(0.001, time + decay1Ref.current);
	oscillator.connect(gain);
	gain.connect(ctx.destination);
	oscillator.start(time);
	oscillator.stop(time + decay1Ref.current);
    }

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
	    time + noiseDecayRef.current
	);

	noise.connect(filter);
	filter.connect(gain);
	gain.connect(ctx.destination);

	noise.start(time);
	noise.stop(time + noiseDecayRef.current);
    }
    

    function playStep() {

	if (!playing) {
	    return;
	}

	const ctx = getAudioContext();
	const time = ctx.currentTime;

	if (seqRef.current[currentStepRef.current]) {
	    playKick(time);
	}

	if (seq2Ref.current[currentStep2Ref.current]) {
	    playSnare(time);
	}

	let newstep = (currentStepRef.current + 1) % seqRef.current.length;
	setCurrentStep(newstep);

	let newstep2 = (currentStep2Ref.current + 1) % seq2Ref.current.length;
	setCurrentStep2(newstep2);	

	const interval =
	      (60_000 / 120.0) / 4;

	timerRef.current = setTimeout(playStep, interval);
    }

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

	currentStepRef.current = 0;
	setCurrentStep(0);

    	currentStep2Ref.current = 0;
	setCurrentStep2(0);
}
    

    function playClicked() {
	console.log('play clicked');
	start();
    }

    function stopClicked() {
	console.log('pause clicked');
	stop();
    }

    function setDecay(val) {
	console.log(`got decay 1: ${val}`);
	setDecay1(val / 100);
    }

    function setNoiseDecay1(val) {
	console.log(`got decay 1: ${val}`);
	setNoiseDecay(val / 100);
    }

    function setPitch(val) {
	setPitch1(val / 100);
    }

    return (
	<div>
	    Drum Machine<span className="drum-control" onClick={playClicked}>[&gt;]</span><span className="drum-control" onClick={stopClicked}>[||]</span>
	    <div>
		<input type="range" onChange={(e) => setDecay(e.currentTarget.value)}/>
		<input type="range" onChange={(e) => setPitch(e.currentTarget.value)}/>			
		<SequencerTrack trackNum="0" seq={seq} setSeq={setSeq} currentStep={currentStep}/>
		<input type="range" onChange={(e) => setNoiseDecay1(e.currentTarget.value)}/>						
		<SequencerTrack trackNum="0" seq={seq2} setSeq={setSeq2} currentStep={currentStep2}/>
	    </div>
	</div>
    );
}

