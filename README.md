# Maison Nette — site de nettoyage résidentiel &amp; bureaux

Site vitrine pour **Maison Nette**, service de nettoyage résidentiel, bureaux,
fin de bail et nettoyage en profondeur à Lausanne et dans la région (Vaud,
Suisse).

⚠️ Ceci est un site de **démonstration**. Vérifiez et remplacez si besoin le
téléphone, l'e-mail et les horaires affichés avant toute mise en ligne
officielle, et retirez le bandeau « site de démonstration » en haut de
chaque page.

## Contenu

- `index.html` — page d'accueil (hero, atouts, aperçu des services, pourquoi
  nous choisir, galerie « Nos réalisations », étapes du processus, zone
  d'intervention avec carte, appel à l'action)
- `services.html` — détail des 4 prestations (résidentiel, bureaux, fin de
  bail, nettoyage en profondeur) et foire aux questions
- `contact.html` — coordonnées, horaires et formulaire de devis (ouvre le
  client de messagerie avec la demande pré-remplie, aucune donnée n'est
  envoyée à un serveur)
- `assets/css/style.css` — styles partagés
- `assets/js/main.js` — logique JS (menu mobile, révélations au défilement,
  accordéon FAQ, formulaire de contact)

## Coordonnées actuelles (à vérifier avant mise en ligne)

- Téléphone / WhatsApp : `+41 76 767 93 16`
- E-mail : `jhoniterra@gmail.com`
- Zone d'intervention : Lausanne, Renens, Prilly, Pully, Écublens,
  Chavannes-près-Renens, Crissier, Épalinges, Morges

## Ajouter les photos de la galerie

La section « Nos réalisations » (`index.html`, ancre `#realisations`) contient
six emplacements. Chacun affiche pour l'instant une **illustration
provisoire** — un dessin vectoriel, écrit à la main dans le fichier — et sa
légende décrit **la prise de vue qui doit la remplacer**. La liste sert donc
aussi de pense-bête pour photographier.

Ces dessins ne sont ni des photographies d'archive ni des images générées :
ils sont volontairement graphiques, pour qu'on ne puisse jamais les prendre
pour un chantier réalisé par l'entreprise.

Pour remplacer une illustration par une vraie photo :

1. Déposer l'image dans `assets/img/` (par ex. `assets/img/cuisine.jpg`).
2. Dans `index.html`, remplacer le `<svg>…</svg>` du `div.shot-frame`
   correspondant par une balise `<img>` :

   ```html
   <!-- avant -->
   <div class="shot-frame"><svg viewBox="0 0 400 300" …>…</svg></div>

   <!-- après -->
   <div class="shot-frame">
     <img src="assets/img/cuisine.jpg" alt="Cuisine après nettoyage" />
   </div>
   ```

Le cadrage est géré par le CSS (`object-fit: cover`, format 4/3), donc
n'importe quelle photo s'intègre sans retouche. Viser environ 1200 px de
large et compresser en JPEG pour garder le site rapide.

Conseils de prise de vue : lumière du jour, même angle pour un
« avant / après », et pas de personne ni d'objet personnel reconnaissable
sans l'accord du client.

## WhatsApp

Le bouton flottant en bas à droite (présent sur les trois pages) et les
liens de la page contact pointent vers `https://wa.me/41767679316` avec un
message pré-rempli. Pour changer le numéro, remplacer `41767679316`
(format international, sans `+` ni zéro initial) partout dans les fichiers
HTML.

## Animations & accessibilité

Les animations sont pilotées par `IntersectionObserver` et de simples
transitions CSS — aucune bibliothèque externe.

- Tout ce qui est masqué au départ est préfixé par `[data-reveal]`, révélé
  par script. **Sans JavaScript, rien n'est masqué** : la page reste
  entièrement lisible.
- `prefers-reduced-motion: reduce` désactive les mouvements et affiche
  immédiatement les contenus.

## Utilisation

Site 100 % statique, sans dépendance de build. Pour le tester en local :

```bash
python3 -m http.server 8000
```

puis ouvrir `http://localhost:8000/index.html`.

Peut être déployé tel quel sur GitHub Pages, Netlify, Vercel ou tout
hébergement statique.

## Personnalisation avant mise en ligne réelle

- Confirmer téléphone, e-mail et horaires réels
- Remplacer les illustrations de « Nos réalisations » par de vraies photos
  (voir ci-dessus) — c'est l'élément qui convainc le plus un futur client
- Ajouter de vraies photos aux autres sections (actuellement icônes/emoji)
- Remplacer le formulaire "mailto" par un vrai service d'envoi si un volume
  important de demandes est attendu (ex. Formspree, Netlify Forms)
- Retirer le bandeau « site de démonstration » en haut de chaque page
- Envisager un nom de domaine dédié (ex. `maisonnette.ch`)
