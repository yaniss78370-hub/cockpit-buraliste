# Atelier : la page `cockpit.html`

Sources de l’espace buraliste en version test (tabac d’exemple « Le Balto », données d’exemple).

- `gen_data.py` fabrique les données d’exemple (`data.json`), cohérentes avec le site et les films.
- `src/` : le style, les vues, l’application et les exports (Excel, CSV, PDF).
  - `e_pages.js` : les pages telles qu’on les voit (Accueil, Caisse, FDJ, Trésorerie, Résultat, Factures, Stock, Mise en place). Chaque page s’ouvre sur une réponse, puis ce qui l’explique, puis le détail.
  - Caisse : « à avoir en caisse » depuis la collecte du vendredi 20 h 30 (espèces encaissées moins gains de jeux payés), comptage, collectes et écarts, prévision jusqu’à la prochaine collecte.
  - FDJ : prélèvement de mercredi (relevé), atterrissage de la semaine en cours à partir des rubriques Strator (jeux instantanés, Loto, remboursements, commission 6,83 % et 4,11 %), estimation face aux relevés semaine par semaine.
- `build.py` assemble la page : `dist/apercu.html` (aperçu, polices et voix intégrées), `dist/site/cockpit.html`, et `cockpit.html` à la racine du site.
- `essai.py` ouvre la page dans un navigateur sans écran (Playwright), parcourt toutes les vues, vérifie les exports et prend des captures.

## La visite guidée (`src/i_visite.js`)

Une seule piste de voix, `voix/visite.mp3` à la racine du site, chargée pendant l’écran de connexion : au clic sur « Se connecter », la voix part tout de suite. L’horloge de la visite, c’est le temps de cette piste : les pages s’ouvrent dans les respirations, le projecteur se pose juste avant le premier mot de chaque étape, les gestes (saisie du comptage, choix du scénario, question à l’assistant) partent sur le mot qui les annonce, et les sous-titres s’allument mot à mot. Si le navigateur refuse le son, la visite continue en sous-titres au même rythme, et « Activer la voix » la reprend là où elle en est.

- `voix/` (dans l’atelier) : les neuf extraits de la prise « Visite, prise 1 » (ElevenLabs, voix Nathan Roy) et `mots-visite.json`, les temps de chaque mot de la prise (transcription Scribe).
- `voix_visite.py` met les extraits bout à bout sans réencodage (la prise d’origine, avec ses respirations), écrit `voix/visite.mp3` et `voix/visite-piste.json` (chaque mot avec ses temps dans la piste). `build.py` intègre ces temps à la page.
- Dans `i_visite.js`, chaque étape donne ses lignes de sous-titres (le texte exact dit par la voix), son avance (de combien la page précède la voix) et ses gestes, accrochés à un mot.
- `essai_visite.py` sert le site en local avec un réseau bridé (`rapide`, `4g`, `3g`), relève chaque image et vérifie : délai entre le clic et la voix, mots allumés au moment où ils sont dits, projecteur posé avant le premier mot, pause, son coupé, son refusé, « Activer la voix », « Revoir la visite ».

```
python3 gen_data.py && python3 voix_visite.py && python3 build.py && python3 essai.py && python3 essai_visite.py bureau 4g
```
