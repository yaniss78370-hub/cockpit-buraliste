#!/usr/bin/env python3
"""La voix de la visite guidée en une seule piste.

Entrées (dossier voix/ de l'atelier) :
- visite-1.mp3 … visite-9.mp3 : les neuf extraits, coupés dans les silences d'une même prise (« Visite, prise 1 ») ;
- mots-visite.json : les mots de cette prise et leurs temps (transcription Scribe), en secondes depuis le début de la prise.

Sorties :
- voix/visite.mp3 à la racine du site : les extraits mis bout à bout sans réencodage (trames MP3 copiées telles quelles),
  ce qui redonne la prise d'origine, avec ses respirations ;
- voix/visite-piste.json dans l'atelier : la durée de la piste et chaque mot avec ses temps dans la piste.
  build.py l'intègre au cockpit : la visite cale sous-titres, pages, projecteur et gestes sur ces temps.

Chaque extrait garde dans la piste ses trames entières : il y commence à 1152 × (trames des extraits d'avant) échantillons,
quelques centièmes plus tard que dans la prise. Les temps des mots sont décalés en conséquence, et vérifiés en décodant la piste."""
import json, os, subprocess, tempfile
import numpy as np

ICI = os.path.dirname(os.path.abspath(__file__))
VOIX = os.path.join(ICI, 'voix')
SITE = os.environ.get('SITE_COCKPIT') or os.path.abspath(os.path.join(ICI, '..', '..'))
SORTIE = os.path.join(SITE, 'voix', 'visite.mp3')
EXTRAITS = [os.path.join(VOIX, 'visite-%d.mp3' % n) for n in range(1, 10)]
SR = 44100


def decoder(chemin):
    brut = subprocess.run(['ffmpeg', '-v', 'error', '-i', chemin, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                          check=True, capture_output=True).stdout
    return np.frombuffer(brut, dtype=np.float32)


def trames(chemin):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-count_packets', '-show_entries',
                          'stream=nb_read_packets,sample_rate,channels,bit_rate', '-of', 'json', chemin],
                         check=True, capture_output=True, text=True).stdout
    s = json.loads(out)['streams'][0]
    assert int(s['sample_rate']) == SR and int(s['channels']) == 1, (chemin, s)
    return int(s['nb_read_packets']), s['bit_rate']


# 1. la piste : les trames des neuf extraits à la suite (même débit, même fréquence, un seul canal)
infos = [trames(c) for c in EXTRAITS]
assert len({d for _, d in infos}) == 1, 'les extraits doivent avoir le même débit'
os.makedirs(os.path.dirname(SORTIE), exist_ok=True)
with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as f:
    for c in EXTRAITS:
        f.write("file '%s'\n" % c.replace("'", "'\\''"))
    liste = f.name
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', liste, '-c', 'copy', '-map_metadata', '-1', '-id3v2_version', '0', SORTIE], check=True)
os.unlink(liste)

# 2. où commence chaque extrait, dans la prise et dans la piste
sons = [decoder(c) for c in EXTRAITS]
piste = decoder(SORTIE)
debut_prise, debut_piste, a, b = [], [], 0, 0
for son, (n_trames, _) in zip(sons, infos):
    debut_prise.append(a / SR)
    debut_piste.append(b / SR)
    morceau = piste[b:b + len(son)]
    assert len(morceau) == len(son) and np.max(np.abs(morceau - son)) < 1e-6, 'extrait mal placé dans la piste'
    a += len(son)
    b += n_trames * 1152
duree = len(piste) / SR

# 3. les mots, dans le temps de la piste (les balises comme [pause] ne se disent pas)
mots = json.load(open(os.path.join(VOIX, 'mots-visite.json'), encoding='utf-8'))['mots']
sortie = []
for m in mots:
    if m['m'].startswith('['):
        continue
    k = max(i for i, d in enumerate(debut_prise) if d <= m['d'] + 1e-6)
    dt = debut_piste[k] - debut_prise[k]
    fin = min(m['f'] + dt, debut_piste[k + 1] if k + 1 < len(debut_piste) else duree)
    sortie.append([m['m'], round(m['d'] + dt, 3), round(fin, 3)])
json.dump({'piste': 'voix/visite.mp3', 'duree': round(duree, 3), 'mots': sortie},
          open(os.path.join(VOIX, 'visite-piste.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('voix/visite.mp3 : %.2f s, %d Ko, %d mots' % (duree, os.path.getsize(SORTIE) // 1024, len(sortie)))
print('débuts des extraits dans la piste :', ' '.join('%.3f' % d for d in debut_piste))
