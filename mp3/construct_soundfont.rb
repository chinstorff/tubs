
require 'find'

SOURCE_DIR = 'pelog'

#puts Dir.glob("./#{SOURCE_DIR}/**/*")

audio_files = Find.find("./#{SOURCE_DIR}").find_all { |e| not File.directory?(e) }.to_a

pitch_names = Enumerator.new do |enum|
  i = "15".to_i(16)
  keys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

  until i == "108".to_i(16)
    octave = (i - 12) / 12 >> 0;
    name = "#{keys[i % 12]}#{octave}";
    enum.yield name # <- Notice that this is the yield method of the enumerator, not the yield keyword
    i +=1
  end
end


HEADER = "
if (typeof(MIDI) === 'undefined') var MIDI = {};                                                         
if (typeof(MIDI.Soundfont) === 'undefined') MIDI.Soundfont = {};                                         
MIDI.Soundfont.acoustic_grand_piano = {"

FOOTER = "
}
"

puts HEADER
audio_files.each do |f|
  audio = `base64 --wrap=0 "#{f}"`.chomp
  puts "\"#{pitch_names.next}\": \"data:audio/mp3;base64,#{audio}\","
end
puts FOOTER
