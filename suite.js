'use strict';

const Octaves = Object.freeze({
  HIGH:   { name: "High",   short: "h" },
  MIDDLE: { name: "Middle", short: "" },
  LOW:    { name: "Low",    short: "l" }
});

const Pathets = Object.freeze({
  PELOG_LIMA:      { name: "",   short: "", laras: "pelog", pathet: "lima" },
  PELOG_NEM:       { name: "",   short: "", laras: "pelog", pathet: "nem"  },
  PELOG_BARANG:    { name: "",   short: "", laras: "pelog", pathet: "barang"  },
  SLENDRO_SANGA:   { name: "",   short: "", laras: "slendro", pathet: "sanga"  },
  SLENDRO_NEM:     { name: "",   short: "", laras: "slendro", pathet: "nem"  },
  SLENDRO_MANYURA: { name: "",   short: "", laras: "slendro", pathet: "manyura"  },
});

const Styles = Object.freeze({
  KETAWANG:   { name: "ketawang" },
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

  setDouble(note) {
    this.double = note;
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
    } else if (this.kempul) {
      note += "p";
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
  constructor(name, noteString) {
    this.name = name;
    this.notes = [];
    if (noteString) {
      this.addNoteString(noteString);
    }
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

class Suite {
  constructor(style, name, pathet) {
    this.style = style;
    this.name = name;
    this.pathet = pathet;
    this.sections = [];
  }

  render() {
    let suite = document.getElementById("suite");
    suite.innerHTML += "<p>" + this.getTitleHTML() + "</p>"
    suite.innerHTML += "<p class='kepatihan'>" + this.sections[0].toKepatihan() + "</p>";
  }

  getTitleHTML() {
    let capitalize = (s) => {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

    let titleHTML = ""
    titleHTML += capitalize(this.style.name) + " "
    titleHTML += "<strong>" + capitalize(this.name) + "</strong>, ";
    titleHTML += "laras " + this.pathet.laras + " pathet " + this.pathet.pathet + " ";
    return titleHTML;
  }

  getSectionHTML(section) {
    section.toKepatihan();
  }

  addSection(section) {
    this.sections.push(section);
  }
}

let suite = new Suite(Styles.KETAWANG, "Madumurti", Pathets.SLENDRO_MANYURA);
suite.addSection(new Section("Ompak", "2126l 2523n 5321p 3216lg"));
suite.render();
