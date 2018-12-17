tubsTables = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

noteMap = {
    "D": 57,
    "T": 58,
    "-": 0,
}

PLAY_SYMBOL  = "&#9658;";
PAUSE_SYMBOL = "&#9208;";

var TubsTable = function (tableNode, sequence, tempo) {
    var tt = {
	active: false,
	sequence: (sequence || tableNode.getAttribute("data-tubs-sequence") || "").split(""),
	tempo: tempo || tableNode.getAttribute("data-tubs-tempo") || 60, // bpm
	tableNode: tableNode,
	playButtonNode: document.createElement("BUTTON"),
	TDs: [],
	highlightedIndex: 0,
	highlightIndex: function (i) {
	    this.TDs[this.highlightedIndex].classList.remove("highlighted");
	    this.TDs[i].classList.add("highlighted");
	    this.highlightedIndex = i;
	},
	displayPlayButton: function () {

	},
	displayPauseButton: function () {

	},
	play: async function () {
	    this.active = true;
	    this.playButtonNode.innerHTML = PAUSE_SYMBOL;
	    
	    var sleepDuration = 1000 / (this.tempo / 60);
	    var delay = 0;
	    var velocity = 127; // how hard the note hits

	    await sleep(500);
	    
	    var i = this.sequence.length - 1;
	    while (this.active) {
		i = (i+1) % this.sequence.length;
		var note = noteMap[this.sequence[i]];
		MIDI.noteOn(0, note, velocity, delay);
		MIDI.noteOff(0, note, delay + 0.75);
		
		this.highlightIndex(i);
		await sleep(sleepDuration);
	    }	    
	},
	stop: function () {
	    this.active = false;
	    this.playButtonNode.innerHTML = PLAY_SYMBOL;
	},
	reset: function () {
	    this.TDs[this.highlightedIndex].classList.remove("highlighted");
	    this.stop();
	}
    }
    tt.playButtonNode.innerHTML = PLAY_SYMBOL;
    tt.playButtonNode.onclick = function () {
	if (tt.active) {
	    tt.stop();
	} else {
	    for (var i = 0; i < tubsTables.length; i++) {
		tubsTables[i].reset();
	    }
	    tt.play();
	}
    }
    
    var trNode = document.createElement("TR");
    
    trNode.appendChild(tt.playButtonNode);
    tableNode.appendChild(trNode);

    for (var i = 0; i < tt.sequence.length; i++) {
	var tdNode = document.createElement("TD");
	tdNode.innerHTML = tt.sequence[i];
	tt.TDs.push(tdNode);
	trNode.appendChild(tdNode);
    }

    return tt;
}

tableNodes = document.getElementsByClassName("tubs");

for (var i = 0; i < tableNodes.length; i++) {
    tubsTables.push(TubsTable(tableNodes[i]));
}

function startMidi() {
    MIDI.loadPlugin({
	soundfontUrl: "./assets/soundfont/",
	//	instrument: "synth_drum",
	targetFormat: 'mp3',
	onprogress: function(state, progress) {
	    console.log(state, progress);
	},
	onsuccess: function() {
	    MIDI.setVolume(0, 127);
	    tubsTables[1].play();
	}
    });
}
startMidi();
