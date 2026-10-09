# Erzeugt die Sprachaufnahmen für alle Sätze aus tools/texts.json (Piper-Stimmen, frei lizenziert: Thorsten + Kerstin = CC0)
# Aufruf: <venv mit piper-tts>/bin/python tools/make_voices.py <ordner-mit-stimmen>
import json, os, sys, wave, subprocess, hashlib, tempfile
from piper import PiperVoice
from piper.config import SynthesisConfig
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); VD = sys.argv[1]
OUT = os.path.join(ROOT, 'assets', 'voice'); os.makedirs(OUT, exist_ok=True)
# Besetzung: Modell, Sprecher (bei mehreren), Tempo (kleiner = schneller), Ausdruck, Tonhöhe in Halbtönen, Klangfarbe mitverschieben
CAST = {
  'erzaehler': ('thorsten-high', None, 0.95, 0.6, 0.8, 0, False),              # Erzähler: klarste Stimme
  # die Kinder: Tonhöhe + Klangfarbe nach oben = Kinderstimme
  'hase':      ('kerstin-low', None, 0.9, 0.4, 0.8, 6, True),                  # Mia: hell, lebhaft
  'igel':      ('kerstin-low', None, 0.95, 0.4, 0.8, 4, True),                 # Ida: freundlich
  'eule':      ('kerstin-low', None, 1.0, 0.4, 0.8, 3, True),                  # Emma: ruhig
  'fuchs':     ('thorsten_emotional-medium', 0, 0.9, 0.4, 0.8, 7, True),       # Paul: fröhlicher Junge
  'waschbaer': ('thorsten_emotional-medium', 4, 0.95, 0.4, 0.8, 6, True),      # Willi: tieferer Junge
  'gate':      ('thorsten-high', None, 1.0, 0.6, 0.8, -3, True),               # das Tor: tief, brummig
  'k_marco':   ('thorsten-high', None, 0.95, 0.6, 0.8, -1, False),            # Chefkoch Marco: ruhig, tief
  'k_luca':    ('thorsten_emotional-medium', 0, 0.92, 0.6, 0.8, 1, False),   # Luca: fröhlich
  'k_tom':     ('thorsten_emotional-medium', 4, 1.0, 0.6, 0.8, -2, True),    # Tom: gemütlich
  'k_nina':    ('kerstin-low', None, 0.98, 0.333, 0.8, 1, False),            # Nina
  'k_lea':     ('kerstin-low', None, 0.92, 0.333, 0.8, 2.5, False),          # Lea: flink
  # Gastraum
  'g_rosi':    ('kerstin-low', None, 1.06, 0.333, 0.8, -1, False),           # Oma Rosi: ruhig, etwas tiefer
  'g_becker':  ('thorsten-high', None, 0.95, 0.6, 0.8, -2, False),          # Herr Becker
  'g_lina':    ('kerstin-low', None, 0.9, 0.4, 0.8, 5, True),               # Lina: Geburtstagskind
  'g_schulz':  ('kerstin-low', None, 0.95, 0.333, 0.8, 1.5, False),         # Frau Schulz
  'g_ben':     ('thorsten_emotional-medium', 4, 0.92, 0.5, 0.8, 2, False),  # Ben: Jugendlicher
  # Außenbereich
  'a_weber':   ('thorsten_emotional-medium', 4, 0.98, 0.6, 0.8, -1, False), # Herr Weber: entspannt
  'a_hoffmann': ('kerstin-low', None, 0.93, 0.333, 0.8, 2, False),          # Frau Hoffmann
  'a_klaus':   ('thorsten-high', None, 1.08, 0.6, 0.8, -3.5, True),         # Opa Klaus: langsam, tief
  'a_mila':    ('kerstin-low', None, 0.88, 0.4, 0.8, 6.5, True),            # Mila: kleines Mädchen
  'a_noah':    ('thorsten_emotional-medium', 0, 0.92, 0.5, 0.8, 3, False),  # Noah: fröhlich
  # Chalet
  'c_gerda':   ('kerstin-low', None, 1.08, 0.333, 0.8, -0.5, False),        # Oma Gerda
  'c_felix':   ('thorsten_emotional-medium', 0, 0.88, 0.4, 0.8, 7.5, True), # Felix: Junge
  'c_berger':  ('kerstin-low', None, 0.95, 0.333, 0.8, 0.5, False),         # Frau Berger
  'c_toni':    ('thorsten_emotional-medium', 6, 0.9, 0.6, 0.8, 0, False),   # Toni: Skifahrer
  'c_anna':    ('kerstin-low', None, 0.9, 0.4, 0.8, 3.5, True),             # Anna
  # Parkplatz
  'p_schmidt': ('thorsten-high', None, 1.0, 0.6, 0.8, -2.5, False),         # Herr Schmidt: Einweiser
  'p_julia':   ('kerstin-low', None, 0.92, 0.333, 0.8, 1, False),           # Julia
  'p_karl':    ('thorsten-high', None, 1.1, 0.6, 0.8, -4, True),            # Opa Karl
  'p_petra':   ('kerstin-low', None, 0.97, 0.333, 0.8, -0.5, False),        # Petra: Busfahrerin
  'p_tim':     ('thorsten_emotional-medium', 6, 0.88, 0.4, 0.8, 7, True),   # Tim: Junge mit Fahrrad
  'leo':       ('thorsten_emotional-medium', 6, 0.85, 0.4, 0.8, 5, True),      # Leo: sportlich, schnell, überrascht
}
SAY = [('Joker', 'Dschoker'), ('Original-Blätter', 'Original Blätter'), ('Im Original', 'im Original')]
texts = json.load(open(os.path.join(ROOT, 'tools', 'texts.json')))
done_f = os.path.join(ROOT, 'tools', 'voices_done.json'); done = json.load(open(done_f)) if os.path.exists(done_f) else {}
models = {}
for i, t in enumerate(texts):
    cast = CAST[t['who']]; sig = hashlib.sha1(json.dumps([cast, t['clean'], SAY]).encode()).hexdigest()
    mp3 = os.path.join(OUT, t['key'] + '.mp3')
    if done.get(t['key']) == sig and os.path.exists(mp3): continue
    model, spk, ls, ns, nw, semi, formant = cast
    V = models.get(model) or models.setdefault(model, PiperVoice.load(os.path.join(VD, 'de_DE-' + model + '.onnx')))
    text = t['clean']
    for a, b in SAY: text = text.replace(a, b)
    with tempfile.TemporaryDirectory() as td:
        w1 = os.path.join(td, 'a.wav'); w2 = os.path.join(td, 'b.wav')
        with wave.open(w1, 'wb') as w: V.synthesize_wav(text, w, syn_config=SynthesisConfig(speaker_id=spk, length_scale=ls, noise_scale=ns, noise_w_scale=nw))
        src = w1
        if semi:
            cmd = ['rubberband', '-q', '-p', str(semi)] + ([] if formant else ['-F']) + ['--fine', w1, w2]
            subprocess.run(cmd, check=True, capture_output=True); src = w2
        # Stille vorne/hinten weg, Lautstärke angleichen, kleines MP3
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,loudnorm=I=-16:TP=-1.5:LRA=11', '-ac', '1', '-ar', '24000', '-b:a', '56k', mp3], check=True)
    done[t['key']] = sig
    print(f"{i + 1}/{len(texts)} {t['who']}: {t['clean'][:50]}", flush=True)
json.dump(done, open(done_f, 'w'), indent=0)
keys = sorted(t['key'] for t in texts)
# alte, nicht mehr gebrauchte Aufnahmen entfernen
for f in os.listdir(OUT):
    if f.endswith('.mp3') and f[:-4] not in keys: os.remove(os.path.join(OUT, f))
with open(os.path.join(ROOT, 'js', 'voiceclips.js'), 'w') as f:
    f.write("'use strict';\n// Wird von tools/make_voices.py erzeugt: welche Sätze als Aufnahme vorliegen\nconst VOICE_CLIPS = new Set(" + json.dumps(keys) + ");\n")
print('fertig', len(keys))
