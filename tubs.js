tubsTables = [];
urlParams = new URLSearchParams(window.location.search);
var urlSequence = null;
var urlTempo = null;
if (urlParams != null) {
    console.log(urlParams);
    urlSequence = urlParams.has('sequence') ? urlParams.get('sequence').toUpperCase() : undefined;
    urlTempo = urlParams.has('tempo') ? urlParams.get('tempo') : undefined;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


PLAY_SYMBOL  = "&#9658;";
PAUSE_SYMBOL = "&#9208;";

var TubsTable = function (tableNode, sequence, tempo) {
    var tt = {
	active: false,
	name: tableNode.getAttribute("data-tubs-name") || "Untitled",
	voices: [],
	tempo: tempo || tableNode.getAttribute("data-tubs-tempo") || urlTempo || 60, // bpm
	sequenceLength: 0,
	tableNode: tableNode,
	playButtonNode: document.createElement("BUTTON"),
	highlightIndex: function (i) {
	    for (var j = 0; j < this.voices.length; j++) {
		this.voices[j].highlightIndex(i);
	    }
	},
	unHighlightIndex: function (i) {
	    for (var j = 0; j < this.voices.length; j++) {
		this.voices[j].TDs[i].classList.remove("highlighted");
	    }	    
	},
	play: async function () {
	    this.active = true;
	    this.tableNode.parentNode.classList.add("active");
	    this.playButtonNode.innerHTML = PAUSE_SYMBOL;
	    
	    var sleepDuration = 1000 / (this.tempo / 60);
	    var delay = 0;
	    var velocity = 127; // how hard the note hits

	    for (var i = 0; i < this.voices.length; i++) {
		if (this.voices[i].sequence.length > this.sequenceLength) {
		    this.sequenceLength = this.voices[i].sequence.length;
		}
	    }
	    
	    await sleep(500);
	    console.log(this.voices);
	    var i = 0;
	    while (this.active) {
		for (var j = 0; j < this.voices.length; j++) {
		    var voice = this.voices[j];
		    
		    var note = voice.getNoteId(voice.sequence[i]);
		    console.log(voice.name + " plays a " + note);
		    MIDI.noteOn(0, note, velocity, delay);
		    MIDI.noteOff(0, note, delay + 0.75);
		
		    voice.highlightIndex(i);
		}
		await sleep(sleepDuration);
		this.unHighlightIndex(i);
		i = (i+1) % this.sequenceLength;
	    }	    
	},
	stop: function () {
	    this.active = false;
	    this.tableNode.parentNode.classList.remove("active");
	    this.playButtonNode.innerHTML = PLAY_SYMBOL;
	},
	reset: function () {
	    for (var i = 0; i < this.voices.length; i++) {
		this.voices[i].reset();
	    }

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
    var trNodes = tableNode.children[0].children;
    
    for (var j = 0; j < trNodes.length; j++) {
	var trNode = trNodes[j];
	var tubsVoice = {
	    name: trNode.getAttribute("data-tubs-name"),
	    sequence: trNode.getAttribute("data-tubs-sequence"),
	    TDs: [],
	    highlightedIndex: 0,
	    getNoteId: function (c) {
		var tar = {
		    "D": 57,
		    "T": 58,
		    "-": 0,
		}
		var darbuka = {
		    "D": 60,
		    "T": 61,
		    "-": 0,
		}
		if (this.name == "tar") return tar[c];
		return darbuka[c];
	    },
	    highlightIndex: function (i) {
		this.TDs[i].classList.add("highlighted");
		this.highlightedIndex = i;
	    },
	    reset: function () {
		this.TDs[this.highlightedIndex].classList.remove("highlighted");
	    },
	}

	var voiceNameNode = document.createElement("SPAN");
	voiceNameNode.innerHTML = tubsVoice.name;
	trNode.appendChild(voiceNameNode);
	for (var i = 0; i < tubsVoice.sequence.length; i++) {
	    var tdNode = document.createElement("TD");
	    tdNode.innerHTML = tubsVoice.sequence[i];
	    tubsVoice.TDs.push(tdNode);
	    trNode.appendChild(tdNode);
	}
	tt.voices.push(tubsVoice);
    }

    var headerDiv = document.createElement("DIV");
    var titleNode = document.createElement("H2");
    var tempoNode = document.createElement("H3");
    titleNode.innerText = tt.name;
    tempoNode.innerText = tt.tempo + "bpm";
    headerDiv.appendChild(titleNode);
    headerDiv.appendChild(tt.playButtonNode);
    headerDiv.appendChild(tempoNode);
    
    var tableDiv = document.createElement("DIV");
    tableDiv.classList.add("tubs-div");
    tableDiv.appendChild(headerDiv);
    tt.tableNode.parentNode.insertBefore(tableDiv, tt.tableNode);
    tableDiv.appendChild(tt.tableNode);

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
	}
    });
}
startMidi();
