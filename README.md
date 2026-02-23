# Comparateur coût total de possession : Véhicule Électrique vs Thermique

Site 100% statique (HTML/CSS/JS), sans build et sans dépendance.

## Lancer en local
1. Ouvrir `index.html` directement dans le navigateur.
2. Le simulateur fonctionne immédiatement offline.

## Personnaliser les paramètres
Modifier `assets/config.js` :
- Années (`SITE_YEAR`, `NEXT_YEAR`)
- Prix électricité/carburant
- Bonus/malus
- Presets par type de véhicule (consommation, entretien, revente)

## AdSense
Le code d’injection est dans `assets/cookies.js` via `injectAdsense()`.
- Tant que l’utilisateur n’accepte pas la catégorie **Publicité**, aucun script AdSense n’est chargé.
- Ajouter votre `clientId` dans `assets/config.js` > `adsense.clientId`.

## Déploiement GitHub Pages
1. Pousser ce dépôt sur GitHub.
2. Dans **Settings > Pages**, choisir la branche (`main` ou autre) et le dossier racine.
3. Mettre à jour `BASE_URL` dans `assets/config.js` et les URLs `https://example.com` dans les metas/sitemap.

## DNS OVH
- Conserver GitHub Pages comme hébergeur.
- Ajouter sur OVH les enregistrements A/AAAA/CNAME recommandés par GitHub.

## Contenu légal
Les textes légaux template sont présents sur :
- `pages/mentions-legales.html`
- `pages/politique-confidentialite.html`
