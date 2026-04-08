# Système de Validation d'Inscription

## Vue d'ensemble

Le système de validation pour la page d'inscription inclut :
- ✅ Validation en temps réel des champs
- ✅ Indicateur visuel de la force du mot de passe
- ✅ Messages d'erreur clairs et utiles
- ✅ Feedback utilisateur immédiat
- ✅ Validation au niveau du champ (field-level)
- ✅ Validation globale du formulaire (schema-level)

---

## Champs validés

### 1. **Nom complet**
- Longueur minimale: 2 caractères
- Longueur maximale: 100 caractères
- Caractères autorisés: Lettres, espaces, traits d'union, apostrophes
- Erreur si : Vide, trop court, caractères spéciaux non autorisés

### 2. **Email**
- Format requis: nom@domaine.extension
- Transformation: Minuscules automatiques
- Erreur si : Vide, format invalide

### 3. **Mot de passe**
- Longueur minimale: 8 caractères
- Longueur maximale: 128 caractères
- Exigences:
  - ✓ Au moins 1 majuscule (A-Z)
  - ✓ Au moins 1 minuscule (a-z)
  - ✓ Au moins 1 chiffre (0-9)
  - ✓ Au moins 1 caractère spécial (@$!%*?&)

**Indicateur de force:**
- 🔴 **Faible** (0-40%): Non conforme aux exigences
- 🟡 **Moyen** (40-60%): Manque quelques exigences
- 🟢 **Fort** (60-80%): Répond à la plupart des exigences
- 💚 **Très fort** (80-100%): Conforme à toutes les exigences

### 4. **Confirmation du mot de passe**
- Doit correspondre exactement au mot de passe
- Erreur si : Vide ou différent du mot de passe

---

## Composants utilisés

### `PasswordStrengthIndicator`
Composant réutilisable affichant:
- Barre de progression colorée
- Score textuel (Faible, Moyen, Fort, Très fort)
- Messages de feedback en temps réel
- Icônes de validation

**Props:**
```typescript
interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  showFeedback?: boolean; // défaut: true
}
```

---

## Fonctions de validation

### `checkPasswordStrength(password: string)`
Analyse la force d'un mot de passe.

**Retour:**
```typescript
{
  score: 'weak' | 'medium' | 'strong' | 'very-strong',
  percentage: number, // 0-100
  feedback: string[]  // Conseils pour améliorer
}
```

### `fieldValidators`
Validateurs au niveau du champ pour utilisation indépendante:
- `fieldValidators.name(value)`
- `fieldValidators.email(value)`
- `fieldValidators.password(value)`
- `fieldValidators.confirmPassword(password, confirmPassword)`
- `fieldValidators.phoneNumber(value)`
- `fieldValidators.postalCode(value)`

Chaque fonction retourne:
- `null` si valide
- `string` (message d'erreur) si invalide

### `validateWithSchema(schema, data)`
Validation globale avec Zod schema.

---

## Intégration dans le formulaire

La validation se fait en 3 couches:

1. **onChange** - Validation instantanée lors de la saisie
2. **onBlur** - Validation quand le champ perd le focus
3. **onSubmit** - Validation globale avant envoi

```tsx
<Input
  label="Mot de passe"
  type="password"
  name="password"
  value={values.password}
  onChange={handleChange}      // Validation instantanée
  onBlur={handleBlur}           // Validation au blur
  error={errors.password}       // Affiche l'erreur
  touched={touched.password}    // Montre si le champ a été touché
/>

{values.password && (
  <PasswordStrengthIndicator 
    strength={passwordStrength} 
    showFeedback={true}
  />
)}
```

---

## Indicateurs visuels

### États du champ
- ✅ **Valide**: Checkmark vert + message de confirmation
- ❌ **Invalide**: Bordure rouge + message d'erreur
- ⚠️  **En cours**: Message jaune avec conseils

### Barre de force du mot de passe
- 🔴 Rouge pour faible
- 🟡 Jaune pour moyen
- 🟢 Vert pour fort
- 💚 Émeraude pour très fort

---

## Exemple d'utilisation

```tsx
const handleRegister = async (formValues: RegisterFormValues) => {
  const { confirmPassword, ...userData } = formValues;
  
  try {
    await register({ ...userData, isBoutique: false });
    navigate('/');
  } catch (error) {
    // Erreur gérée par useAuth
  }
};
```

---

## Messages d'erreur personnalisés

Les messages sont définis dans `utils/messages.ts`:
```typescript
{
  EMAIL_INVALID: 'Email invalide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
  PASSWORD_REQUIRED: 'Le mot de passe est requis',
  ...
}
```

---

## Performances

- **useMemo** pour `checkPasswordStrength` - Calcul optimisé
- **Validation incrémentale** - Pas de validation complète à chaque keystroke
- **Debounce optionnel** - Peut être ajouté pour réduire les calculs

---

## Notes de sécurité

⚠️ **Important:**
- Les mots de passe ne doivent JAMAIS être stockés en clair
- Les validations frontend sont COMPLÉMENTAIRES (pas suffisantes seules)
- Toujours valider côté backend aussi
- Ne pas exposer les règles complètes de sécurité au frontend

