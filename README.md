# Top Marché — site de démonstration

Site vitrine multilingue (FR / PT / EN) réalisé pour présenter une proposition
de nouvelle présence en ligne à **Top Marché**, supermarché de proximité situé
Route de Genève 5, 1030 Bussigny (Vaud, Suisse).

⚠️ Ceci est un site de **démonstration / prospection commerciale**, non
affilié officiellement au commerce. Les horaires, le téléphone et les prix
affichés sont des exemples à remplacer par les informations réelles avant
toute mise en ligne.

## Contenu

- `index.html` — page d'accueil (présentation, points forts, offres en
  vedette, horaires/adresse, carte, appel à l'action)
- `ofertas.html` — catalogue complet avec filtres par catégorie
- `contato.html` — coordonnées, carte, horaires et formulaire de contact
  (démo, n'envoie aucune donnée)
- `assets/css/style.css` — styles partagés
- `assets/js/i18n.js` — dictionnaire de traductions (FR/PT/EN) et données
  produits
- `assets/js/main.js` — logique JS (sélecteur de langue, menu mobile,
  formulaire)

## Utilisation

Site 100% statique, sans dépendance de build. Pour le tester en local :

```bash
python3 -m http.server 8000
```

puis ouvrir `http://localhost:8000/index.html`.

Peut être déployé tel quel sur GitHub Pages, Netlify, Vercel ou tout
hébergement statique.

## Personnalisation avant mise en ligne réelle

- Remplacer téléphone, e-mail et horaires par les vraies informations
- Remplacer les produits/prix d'exemple par le catalogue réel
- Ajouter de vraies photos (actuellement icônes/emoji en guise de visuels)
- Retirer le bandeau « site de démonstration » en haut de chaque page
