# SafeTrace — Spécification de conception
**Date :** 2026-05-16
**Statut :** Validée par le propriétaire du projet

---

## 1. Contexte et problème

Au Cameroun, les disparitions et enlèvements sont en forte augmentation. Les annonces de proches disparus circulent de manière non coordonnée sur les réseaux sociaux (WhatsApp, Facebook), sans centralisation, sans système d'alerte géolocalisée et sans interface dédiée pour les forces de l'ordre.

**SafeTrace** est une plateforme numérique qui centralise les signalements de disparitions, alerte les citoyens proches, et donne aux forces de l'ordre un tableau de bord pour gérer et clôturer les dossiers.

---

## 2. Utilisateurs cibles

| Profil | Priorité | Description |
|---|---|---|
| Familles / proches | Haute | Signalent une disparition, suivent leur dossier |
| Forces de l'ordre (police, gendarmerie) | Haute | Valident, gèrent et clôturent les dossiers |
| Citoyens témoins | Moyenne | Soumettent des témoignages sur ce qu'ils ont vu |

---

## 3. Architecture retenue : Apps séparées + API partagée

### Pourquoi ce choix
- L'interface police (tableaux, filtres, stats) est très différente de l'app citoyenne
- Le dashboard web peut être cédé à l'État indépendamment de l'app mobile
- La sécurité est séparée par couche (rôles distincts, accès IP restreint pour la police)
- Les deux surfaces scalent indépendamment

### Composants

| Composant | Technologie | Audience |
|---|---|---|
| App Mobile | React Native (Android prioritaire, iOS) | Familles, citoyens |
| Dashboard Web | React + Vite | Police, gendarmerie |
| API Backend | Node.js + Express | — |
| Base de données | PostgreSQL + PostGIS | — |
| SMS Gateway | Africa's Talking | MTN/Orange Cameroun |
| Notifications Push | Firebase FCM | — |
| Cartes | OpenStreetMap (Leaflet) | — |
| Stockage media | Cloudinary (photos) | — |

---

## 4. Fonctionnalités — Version 1

### 4.1 Signalement de disparition
- Formulaire : photo, nom complet, âge, sexe, description physique, dernier lieu vu, heure
- Upload photo compressé localement avant envoi
- Géolocalisation automatique du lieu de signalement
- File hors-ligne : signalement mis en attente si pas de réseau, envoyé à la reconnexion

### 4.2 Alertes géolocalisées
- Au dépôt d'un signalement, le backend calcule un rayon de 50 km via PostGIS
- Notification push (Firebase FCM) envoyée aux utilisateurs dans la zone
- SMS envoyé via Africa's Talking aux numéros enregistrés dans la zone (fallback sans data)
- Format SMS : `SAFETRACE ALERTE : [Nom], [âge] ans, disparu(e) à [Lieu]. Infos : safetrace.cm/cas/[ID]`

### 4.3 Témoignages citoyens
- N'importe quel utilisateur connecté peut soumettre un témoignage sur un dossier actif
- Témoignage : texte libre + photo optionnelle + géolocalisation
- Les témoignages sont visibles par la famille et les forces de l'ordre

### 4.4 Interface police / gendarmerie (Dashboard Web)
- Tableau de bord : stats (cas actifs, en attente, résolus, taux de résolution)
- File de validation : valider, marquer urgent, demander révision
- Onglets : À valider / En cours / Archivés
- Accès restreint : authentification renforcée + whitelist IP (poste de police)
- Export des dossiers en PDF

### 4.5 Carte interactive
- Carte OpenStreetMap avec épingles colorées par statut :
  - Rouge : disparu actif
  - Orange : enquête en cours
  - Vert : retrouvé
- Callout card au clic sur une épingle
- Filtre par zone géographique
- Fonctionne partiellement hors-ligne (tuiles mises en cache)

### 4.6 Confirmation de retrouvaille
- La famille ou la police peut marquer un dossier comme "Retrouvé"
- Notification envoyée à tous les témoins ayant contribué
- Dossier archivé automatiquement, épingle passe au vert sur la carte

---

## 5. Authentification et sécurité

| Élément | Détail |
|---|---|
| Inscription | Numéro de téléphone obligatoire (MTN ou Orange Cameroun) |
| Vérification | OTP SMS via Africa's Talking |
| Tokens | JWT — access token 15 min, refresh token 7 jours |
| Rôles | `CITIZEN`, `FAMILY`, `OFFICER`, `ADMIN` |
| Validation | Chaque signalement est validé par un modérateur ou officier avant publication |
| Rate limiting | Max 3 signalements par heure par compte |
| Police | Accès dashboard web restreint par IP whitelistée |
| Photos | Stockées sur Cloudinary, lien signé temporaire (expire 24h) |

---

## 6. Gestion offline (hors-ligne)

| Situation | Comportement |
|---|---|
| Pas de réseau | Signalements mis en file locale (WatermelonDB / SQLite) |
| Réseau revient | Synchronisation automatique en arrière-plan |
| Consultation | 50 derniers dossiers mis en cache local |
| Photos | Compressées localement avant envoi |
| Carte | Tuiles de la région mise en cache au premier chargement |
| SMS fallback | Alertes envoyées par SMS pour les zones sans data mobile |

---

## 7. Routes API

```
POST   /api/auth/register          Inscription (numéro tél)
POST   /api/auth/verify-otp        Vérification OTP
POST   /api/auth/refresh           Rafraîchir le token

GET    /api/cases                  Liste des dossiers actifs (paginé, géofiltré)
POST   /api/cases                  Créer un signalement
GET    /api/cases/:id              Détail d'un dossier
PATCH  /api/cases/:id/status       Changer le statut (police uniquement)
POST   /api/cases/:id/resolve      Marquer comme retrouvé

POST   /api/testimonies            Soumettre un témoignage
GET    /api/cases/:id/testimonies  Témoignages d'un dossier

POST   /api/media/upload           Upload d'une photo (retourne une URL signée)

GET    /api/admin/stats            Statistiques globales (police)
GET    /api/admin/pending          Dossiers en attente de validation
```

---

## 8. Modèle de données (simplifié)

```sql
-- Utilisateurs
users (id, phone, name, role, region, created_at, verified_at)

-- Dossiers de disparition
cases (
  id, reporter_id, person_name, person_age, person_gender,
  photo_url, description, last_seen_location, last_seen_at,
  latitude, longitude, status,   -- PENDING | ACTIVE | INQUIRY | RESOLVED
  validated_by, created_at, resolved_at
)

-- Témoignages
testimonies (id, case_id, author_id, content, photo_url, latitude, longitude, created_at)

-- Alertes envoyées
alerts (id, case_id, channel, recipients_count, sent_at)
```

---

## 9. Design système

| Élément | Valeur |
|---|---|
| Police titres | Syne (800) |
| Police corps | DM Sans (400/500) |
| Couleur fond | `#080c14` |
| Surface | `#0f1623` |
| Orange principal | `#f97316` |
| Alerte / urgence | `#ef4444` |
| Résolu | `#22c55e` |
| Dashboard police | `#a78bfa` (violet) |
| Icônes | Lucide Icons (SVG inline) |

---

## 10. Langues

- **Phase 1 :** Français + Anglais
- **Phase 2 :** Fulfuldé, Ewondo, Duala (i18n préparé dès la phase 1)

---

## 11. Opérateur

- **Phase 1 :** Startup privée (opérateur du projet)
- **Phase 2 (si validation gouvernementale) :** Transfert possible du dashboard web au Ministère de l'Intérieur / Police Nationale
- L'architecture est conçue pour ce transfert : dashboard et app mobile sont indépendants

---

## 12. Ce qui est hors scope (Phase 1)

- Application iOS (Android uniquement en phase 1, iOS en phase 2)
- Langues locales (phase 2)
- Intégration directe avec les systèmes informatiques de la police
- Module de messagerie entre famille et forces de l'ordre
- Application web grand public (PWA)
