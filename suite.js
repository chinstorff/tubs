'use strict';

const Octaves = Object.freeze({
  HIGH:   { name: "High",   short: "h" },
  MIDDLE: { name: "Middle", short: "" },
  LOW:    { name: "Low",    short: "l" }
});

class Note {
  constructor(pitch, octave) {
    this.pitch = pitch;
    this.octave = octave;
  }

  setPitch(pitch) {
    this.pitch = pitch;
  }

  setOctave(octave) {
    this.octave = octave;
  }

  addGong() {
    this.gong = true;
  }

  addKempul() {
    this.kempul = this.pitch;
  }

  addKanong() {
    this.kanong = this.pitch;
  }

  toNoteString() {
    let ret = this.octave.short + this.pitch;
    if (this.gong) {
      ret += "g";
    } else if (this.kempul) {
      ret += "p";
    } else if (this.kanong) {
      ret += "n";
    }
    return ret;
  }

  toKepatihan() {
    let note = "";

    if (this.gong) {
      note += "g";
    } else if (this.kanong) {
      note += "n";
    }

    if (this.octave == Octaves.HIGH) {
      note += " !@#$%^&"[this.pitch];
    } else if (this.octave == Octaves.MIDDLE) {
      note += " 1234567"[this.pitch];
    } else if (this.octave == Octaves.LOW){
      note += " qwertyu"[this.pitch];
    } else {
      note += ".";
    }

    return note;
  }
}

class Section {
  constructor(name) {
    this.name = name;
    this.notes = [];
  }

  addNote(note) {
    this.notes.push(note);
  }

  /* e.g. 2126l 2523n 5321p 3216lg */
  addNoteString(noteString) {
    let note = new Note();
    let options = "gpnhl"
    let valid = "1234567" + options;

    for (var i = 0; i < noteString.length; i++) {
      if (!valid.includes(noteString[i])) {
        continue;
      }
      note = new Note(noteString[i], Octaves.MIDDLE);
      while (i+1 < noteString.length && options.includes(noteString[i+1])) {
        switch (noteString[i+1]) {
          case 'g':
            note.addGong();
            break;
          case 'p':
            note.addKempul(noteString[i+1]);
            break;
          case 'n':
            note.addKanong(noteString[i+1]);
            break;
          case 'h':
            note.setOctave(Octaves.HIGH);
            break;
          case 'l':
            note.setOctave(Octaves.LOW);
            break;
        }
        i++;
      }
      this.notes.push(note);
    }
  }

  addKepatihan(kepatihan) {

  }

  toNoteString() {
    let ret = "";
    let i = this.notes.length % 4;
    for (const note of this.notes) {
      ret += note.toNoteString();
      if (i % 4 == 3) {
        ret += " ";
      }
      i = (i+1)%4;
    }
    return ret;
  }

  toKepatihan() {
    let ret = "";
    let i = this.notes.length % 4;
    for (const note of this.notes) {
      ret += note.toKepatihan();
      if (i % 4 == 3) {
        ret += " ";
      }
      i = (i+1)%4;
    }
    return ret;
  }
}

let s = new Section();
s.addNoteString("2126l 2523n 5321p 3216lg");
console.log(s.toNoteString());
console.log(s.toKepatihan());
/*
class Piece {
  // ..and an (optional) custom class constructor. If one is
  // not supplied, a default constructor is used instead:
  // constructor() {
  constructor(style, name, laras, pathet) {
    this.style = style;
    this.name = name;
    this.laras = laras;
    this.pathet = pathet;
  }

  // Simple class instance methods using short-hand method
  // declaration
  sayName() {
    ChromeSamples.log('Hi, I am a ', this.name + '.');
  }

  sayHistory() {
    ChromeSamples.log('"Polygon" is derived from the Greek polus (many) ' +
      'and gonia (angle).');
  }

  // We will look at static and subclassed methods shortly
}*/
