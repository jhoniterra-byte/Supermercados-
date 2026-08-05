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
  nous choisir, étapes du processus, zone d'intervention avec carte, appel
  à l'action)
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
- Ajouter de vraies photos (actuellement icônes/emoji en guise de visuels)
- Remplacer le formulaire "mailto" par un vrai service d'envoi si un volume
  important de demandes est attendu (ex. Formspree, Netlify Forms)
- Retirer le bandeau « site de démonstration » en haut de chaque page
- Envisager un nom de domaine dédié (ex. `maisonnette.ch`)
