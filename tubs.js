tubsTables = [];
urlParams = new URLSearchParams(window.location.search);
var urlSequence = null;
var urlTempo = null;
if (urlParams != null) {
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
    singleVoice: tableNode.hasAttribute("data-tubs-single-voice") || false,
    name: tableNode.getAttribute("data-tubs-name"),
    voices: [],
    tempo: tempo || tableNode.getAttribute("data-tubs-tempo") || urlTempo || 60, // bpm
    shouldRepeat: !tableNode.hasAttribute("data-tubs-no-repeat"),
    defaultVoiceName: tableNode.getAttribute("data-tubs-default-voice-name"),
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
    playNote: function (voice, i, sleepDuration, delay, velocity) {
      var note = voice.getNoteId(voice.sequence[i]);
      MIDI.noteOn(0, note, velocity, delay);
      MIDI.noteOff(0, note, delay + 0.75);

      voice.highlightIndex(i);
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
      var i = this.tableNode.hasAttribute("data-tubs-start-at-end") ? this.voices[0].sequence.length-1 : 0;

      if (this.singleVoice) {
        var currentVoiceIndex = this.tableNode.hasAttribute("data-tubs-start-at-end") ? this.voices.length-1 : 0;
        while (this.active) {
          this.playNote(this.voices[currentVoiceIndex], i, sleepDuration, delay, velocity);
          await sleep(sleepDuration);
          this.unHighlightIndex(i);

          i += 1;
          if (i >= this.voices[currentVoiceIndex].sequence.length) {
            i = 0;
            currentVoiceIndex = (currentVoiceIndex + 1) % this.voices.length;
            if (this.shouldRepeat) {
              this.stop();
            }
          }
        }
      } else {
        while (this.active) {
          for (var j = 0; j < this.voices.length; j++) {
            this.playNote(this.voices[j], i, sleepDuration, delay, velocity);
          }
          await sleep(sleepDuration);
          this.unHighlightIndex(i);
          i++;
          if (i == this.sequenceLength) {
            i = 0;
            if (!this.shouldRepeat) this.stop();
          }

        }
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
      displayName: trNode.getAttribute("data-tubs-name"),
      name: trNode.getAttribute("data-tubs-name") || tt.defaultVoiceName,
      sequence: trNode.getAttribute("data-tubs-sequence"),
      TDs: [],
      highlightedIndex: 0,
      getNoteId: function (c) {
        var instruments = {
          "tar": {
            "D": 57,
            "T": 58,
            "-": 0,
            ".": 57,
          },
          "darbuka": {
            "D": 60,
            "T": 61,
            "-": 0,
          },
          "bonang": {
            "q": 49,
            "w": 50,
            "e": 51,
            "r": 52,
            "t": 53,
            "y": 54,
            "u": 55,
            "1": 56,
            "2": 57,
            "3": 58,
            "4": 59,
            "5": 60,
            "6": 61,
            "7": 62,
          },
          "slenthem": {
            "1": 21,
            "2": 22,
            "3": 23,
            "4": 24,
            "5": 25,
            "6": 26,
            "7": 27,
          },
          "demung": {
            "1": 28,
            "2": 29,
            "3": 30,
            "4": 31,
            "5": 32,
            "6": 33,
            "7": 34,
          },
          "saron": {
            "1": 35,
            "2": 36,
            "3": 37,
            "4": 38,
            "5": 39,
            "6": 40,
            "7": 41,
          },
          "peking": {
            "1": 42,
            "2": 43,
            "3": 44,
            "4": 45,
            "5": 46,
            "6": 47,
            "7": 48,
          },
          "kendhang": {
            "C": 77,
            "P": 78,
            ".": 79,
            "-": 80,
            "I": 81,
          },
        }
        if (this.name in instruments) return instruments[this.name][c];
        return 0;
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
    voiceNameNode.innerHTML = tubsVoice.displayName;
    trNode.appendChild(voiceNameNode);

    console.log(tubsVoice);
    for (var i = 0; i < tubsVoice.sequence.length; i++) {
      var tdNode = document.createElement("TD");
      var symbol = tubsVoice.sequence[i];
      if (symbol == "-") symbol = "";
      //	    if (symbol == ".") symbol = "●";
      tdNode.innerHTML = symbol;
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
  if (tt.name) {
    headerDiv.appendChild(titleNode);
    headerDiv.appendChild(tt.playButtonNode);
  }
  //  headerDiv.appendChild(tempoNode);

  var tableDiv = document.createElement("DIV");
  tableDiv.classList.add("tubs-div");
  tableDiv.onclick = tt.playButtonNode.onclick;
  if (tt.name) {
    tableDiv.appendChild(headerDiv);
  }


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
      //	    console.log(state, progress);
    },
    onsuccess: function() {
      MIDI.setVolume(0, 127);
    }
  });
}
startMidi();
