import { useState, useRef, useEffect } from 'react';

function SequencerTrack({ trackNum }) {

    const steps = 16;
    const [ seq, setSeq ] = useState([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    const [ playing, setPlaying ] = useState(false);
    
    function stepClicked(i) {
	console.log(`step ${i} clicked on track ${trackNum}`);
	const s = [...seq];
	s[i] = !s[i];
	setSeq(s);
    }

    return (
	<div>
	    { seq.map((step, i) => (<span className="drum-step" key={i} onClick={() => stepClicked(i)}>[{seq[i] ? <span>O</span> : <span>  </span>}]</span>)) }
	</div>
    );
}

export default function ProjectList() {

    function playClicked() {
	console.log('play clicked');
    }

    return (
	<div>
	    <h2>Projects</h2>
	    <ol>
		<li>Drum Machine<span className="drum-control" onClick={playClicked}>&gt;</span><span className="drum-control">||</span></li>
		<div>
		    <SequencerTrack trackNum="0" />
		    <SequencerTrack trackNum="1" />
		    <SequencerTrack trackNum="2" />
		    <SequencerTrack trackNum="3" />		    
		</div>
	    </ol>
	</div>
    );
}
