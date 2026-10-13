# Atelier : la page `cockpit.html`

Sources de l’espace buraliste en version test (tabac d’exemple « Le Balto », données d’exemple).

- `gen_data.py` fabrique les données d’exemple (`data.json`), cohérentes avec le site et les films.
- `src/` : le style, les vues, l’application et les exports (Excel, CSV, PDF).
  - `e_pages.js` : les pages telles qu’on les voit (Accueil, Caisse, FDJ, Trésorerie, Résultat, Factures, Stock, Mise en place). Chaque page s’ouvre sur une réponse, puis ce qui l’explique, puis le détail.
  - Caisse : « à avoir en caisse » depuis la collecte du vendredi 20 h 30 (espèces encaissées moins gains de jeux payés), comptage, collectes et écarts, prévision jusqu’à la prochaine collecte.
  - FDJ : prélèvement de mercredi (relevé), atterrissage de la semaine en cours à partir des rubriques Strator (jeux instantanés, Loto, remboursements, commission 6,83 % et 4,11 %), estimation face aux relevés semaine par semaine.
- `build.py` assemble la page : `dist/apercu.html` (aperçu, polices intégrées), `dist/site/cockpit.html`, et `cockpit.html` à la racine du site.
- `essai.py` ouvre la page dans un navigateur sans écran (Playwright), parcourt toutes les vues, vérifie les exports et prend des captures.

```
python3 gen_data.py && python3 build.py && python3 essai.py
```
