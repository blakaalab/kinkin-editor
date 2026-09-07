<p align="center">
  <img src="../assets/banner.svg" alt="Kinkin Editor - un éditeur de texte enrichi pour React, construit sur Tiptap et ProseMirror" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blakaa/kinkin-editor"><img src="https://img.shields.io/npm/v/@blakaa/kinkin-editor?color=green" alt="version npm"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Licence MIT"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/react-18%20%7C%2019-149eca.svg" alt="React 18 et 19"></a>
  <a href="https://tiptap.dev"><img src="https://img.shields.io/badge/tiptap-3.31-000000.svg" alt="Tiptap 3.31"></a>
</p>

<p align="center">
  <strong>Langues :</strong>
  <a href="../README.md">English</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  Français ·
  <a href="README.de.md">Deutsch</a>
</p>

# Kinkin Editor

**Un éditeur de texte enrichi pour React, prêt à intégrer.** Un WYSIWYG à la Notion
construit sur [Tiptap](https://tiptap.dev) et ProseMirror : markdown en entrée,
markdown en sortie (ou HTML/JSON), avec commandes slash, tableaux, images, emojis,
blocs réordonnables par glisser-déposer, table des matières, et un panneau AI Assist
qui diffuse en streaming depuis le LLM de votre choix.

```bash
npm install @blakaa/kinkin-editor
```

Il est conçu pour s'insérer dans une application React que vous avez déjà : pas de
reset CSS global, pas de configuration Tailwind requise, aucun provider à monter et
aucune hypothèse sur votre backend — l'envoi d'images et l'IA sont de simples
callbacks que vous fournissez, ou que vous omettez.

**[Démo et bac à sable →](https://blakaalab.github.io/kinkin-editor/)** ·
[Guide d'installation](https://blakaalab.github.io/kinkin-editor/#/docs) ·
[Versions](https://github.com/blakaalab/kinkin-editor/releases)

---

## Fonctionnalités

**Menu slash** (tapez `/`) : Paragraphe, Titre 1–4, Liste à puces, Liste numérotée,
Liste de tâches, Citation, Code, Emoji, Tableau, Image, Ligne horizontale.

**Également inclus**

- Markdown en entrée et en sortie — collez du markdown, il devient du contenu enrichi
- Sélecteur d'emojis avec `:`
- Poignée de glissement sur chaque bloc pour réordonner ; `Mod-Shift-↑/↓` pour
  déplacer, `Mod-Shift-D` pour dupliquer
- Tableaux avec contrôles de lignes/colonnes et réordonnancement par glisser-déposer
- Édition de liens, blocs de code, listes de tâches, surlignage, substitutions typographiques
- Envoi d'images via un callback que vous fournissez
- AI Assist en streaming — améliorer, continuer, résumer, corriger la grammaire,
  simplifier, raccourcir, développer, traduire, changer de ton, ou un prompt libre
- Table des matières via `onTocItemsChange`
- Barres d'outils fixe, flottante sur la sélection et mobile
- Types TypeScript inclus ; compatible React 18 et 19

---

## Installation

```bash
npm install @blakaa/kinkin-editor    # ou : pnpm add @blakaa/kinkin-editor
```

Sur npm 7+ et pnpm, c'est toute la commande : les deux lisent `peerDependencies` et
installent React ainsi que les 21 paquets `@tiptap/*` pour vous — vous n'avez pas à
les énumérer.

### Yarn

Yarn n'installe **pas** automatiquement les peer dependencies — ni Classic ni Berry.
Il faut les indiquer explicitement (l'expansion d'accolades tient en deux lignes) :

```bash
yarn add @blakaa/kinkin-editor
yarn add react react-dom \
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,extension-emoji,extension-highlight,extension-history,extension-horizontal-rule,extension-image,extension-list,extension-mention,extension-strike,extension-table,extension-table-of-contents,extension-text-style,extension-typography,extension-unique-id,extension-drag-handle-react}
```

### Pourquoi des peer dependencies

React et ProseMirror doivent être en **instance unique**. Deux copies de React
donnent « Invalid hook call » ; deux copies de ProseMirror donnent
`RangeError: Invalid content` et des collisions de plugin key, parce que
`prosemirror-model` s'appuie sur des vérifications `instanceof` et sur un registre de
schéma partagé. Les déclarer en peers est précisément ce qui pousse le gestionnaire
de paquets à dédupliquer vers une seule copie.

Chaque peer `@tiptap/*` est épinglé à `~3.31.3` — la version avec laquelle cette
bibliothèque est compilée et testée. Mélanger des versions mineures de Tiptap échoue
à la compilation, la plage reste donc délibérément étroite et se déplace d'un bloc à
chaque montée de version Tiptap vérifiée.

---

## Démarrage rapide

```tsx
import { useState } from "react";
import { FixedToolbar, RichTextEditor } from "@blakaa/kinkin-editor";
import "@blakaa/kinkin-editor/style.css";

export function Editor() {
  const [markdown, setMarkdown] = useState("# Hello\n\nStart typing.");

  return (
    <div style={{ height: "100vh" }}>
      <RichTextEditor
        initialContent={markdown}
        contentType="markdown"
        outputContentType="markdown"
        onChange={(value) => setMarkdown(value as string)}
        toolbar={<FixedToolbar />}
      />
    </div>
  );
}
```

Deux pièges classiques :

1. **Importez la feuille de styles.** `import "@blakaa/kinkin-editor/style.css"` une
   seule fois, n'importe où dans votre application. Sans elle, l'éditeur s'affiche
   sans style.
2. **Donnez-lui une hauteur.** L'éditeur remplit son conteneur (`height: 100%`). Dans
   un conteneur sans hauteur, il s'effondre à rien. Utilisez un parent avec une
   hauteur explicite, ou `min-height: 0` s'il s'agit d'un enfant flex.

La barre d'outils est facultative — omettez `toolbar` pour un éditeur épuré, toujours
pilotable par les commandes slash et la barre de sélection.

---

## L'utiliser avec votre propre Tailwind CSS

**En bref : rien à configurer. Il ne peut pas entrer en conflit avec vos styles.**

Livrer Tailwind depuis une bibliothèque pose normalement trois problèmes. Les trois
sont réglés à la compilation :

| Problème | Comment c'est évité |
| --- | --- |
| Collisions d'utilitaires — le `.text-sm` de la bibliothèque restylant silencieusement *votre* application | Chaque règle est imbriquée sous `.kinkin-editor`, elle ne s'applique donc qu'à l'intérieur de l'éditeur |
| Fuite de tokens — les `--color-*` de la bibliothèque écrasant votre thème sur `:root` | `:root` est réécrit en `.kinkin-editor` ; rien n'atterrit sur la racine du document |
| Preflight en double — deux resets de base qui s'affrontent | La feuille de styles est compilée **sans preflight** |

Le `.text-gray-500` de la bibliothèque et le vôtre peuvent avoir des valeurs
totalement différentes sans se gêner. Vous n'avez même pas besoin de Tailwind : ce
qui est publié est du CSS compilé ordinaire.

L'interface rendue via portail (menus, infobulles, aperçus de glissement, barre
mobile) échapperait normalement à cette portée en se rendant dans `document.body`.
Elle est envoyée dans un conteneur qui porte lui aussi la classe, exposé via
`getEditorPortalRoot()`.

---

## Personnalisation du thème

Redéfinissez les tokens de design sur la classe de portée — ils se propagent à tout
ce qui se trouve à l'intérieur :

```css
.kinkin-editor {
  --color-primary-700: #7c3aed;  /* accent : boutons actifs, anneaux de focus */
  --color-foreground: #1f2937;   /* texte courant */
  --color-background: #ffffff;
  --color-border: #e5e7eb;
  --color-muted-foreground: #6b7280;
  --font-sans: "Inter", system-ui, sans-serif;
}
```

Le style du *contenu* de l'éditeur (blocs de code, tableaux, listes de tâches,
citations) utilise un espace de noms distinct, `--tt-core-*`, redéfinissable de la
même manière :

```css
.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
}
```

---

## Référence de l'API

### `<RichTextEditor />`

| Prop | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `initialContent` | `Content` | — | Contenu de départ : une chaîne markdown/HTML, ou un document JSON Tiptap. Le modifier après le montage remplace le contenu et efface l'historique d'annulation. |
| `contentType` | `"markdown" \| "html" \| "json"` | `"markdown"` | Comment interpréter `initialContent`. |
| `outputContentType` | `"markdown" \| "html" \| "json" \| "text"` | `"markdown"` | Ce que `onChange` émet. |
| `onChange` | `(value, meta?) => void` | — | Déclenché à l'édition. `value` est une chaîne, ou `JSONContent` quand la sortie est `"json"`. Supprimé pendant le streaming de l'IA. |
| `editable` | `boolean` | `true` | `false` rend en lecture seule — les barres d'outils disparaissent, le contenu reste sélectionnable. |
| `toolbar` | `ReactNode` | — | Rendu au-dessus du contenu, à l'intérieur du contexte de l'éditeur. Passez `<FixedToolbar />`. |
| `imageUploadHandler` | `EditorImageUploadHandler` | — | Active l'envoi d'images. Omettez pour désactiver. |
| `streamCompletion` | `StreamCompletionFn` | — | Active AI Assist. Omettez pour désactiver. |
| `aiMode` | `"assist" \| "chat"` | — | Quel bouton IA affiche la barre de sélection. |
| `onAiChatRequest` | `(message, selectedText) => void` | — | Appelé par le bouton de chat quand `aiMode="chat"`. |
| `onTocItemsChange` | `(items) => void` | — | Déclenché quand les titres changent. À injecter dans `<ToC />`. |
| `editorRef` | `RefObject<Editor \| null>` | — | Porte de sortie vers l'instance Tiptap sous-jacente. |
| `pageTitle` | `string` | — | Inclus comme contexte dans les prompts d'AI Assist. |
| `placeholder` | `string` | — | Texte indicatif pour un document vide. |

Le `meta.source` de `onChange` vaut `"manual"` pour la saisie utilisateur et
`"conversation"` pour les modifications programmatiques — pratique pour ignorer la
sauvegarde automatique sur les changements non issus de l'utilisateur.

### Barres d'outils

| Export | Comportement |
| --- | --- |
| `<FixedToolbar showAiAssist? className? />` | Barre permanente. À passer via la prop `toolbar`. Annuler/rétablir, type de bloc (paragraphe, H1–H4), listes (puces/numérotée/tâches), gras/italique/souligné/barré/code, citation, bloc de code, ligne horizontale, lien, tableau, image, déclencheur slash, AI Assist. |
| `<SelectionToolbar />` | Flotte au-dessus du texte sélectionné sur ordinateur. Rendue automatiquement. |
| `<MobileToolbar />` | S'ancre en bas sous 480 px. Rendue automatiquement. |

Seule `FixedToolbar` doit être montée ; les deux autres sont déjà câblées.

### `<ToC />`

```tsx
const [items, setItems] = useState([]);
const editorRef = useRef(null);

<RichTextEditor editorRef={editorRef} onTocItemsChange={setItems} {...rest} />
<ToC items={items} editor={editorRef.current} trackScroll />
```

| Prop | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `items` | `TableOfContentDataItem[]` | `[]` | Provient de `onTocItemsChange`. |
| `editor` | `Editor \| null` | — | Provient de `editorRef`. Nécessaire pour faire défiler jusqu'aux titres. |
| `trackScroll` | `boolean` | `true` | Met en évidence le titre actuellement visible. Il écoute le défilement de *window*, désactivez-le donc si l'éditeur vit dans votre propre conteneur défilant. |

### `imageUploadHandler` — envoi d'images

Appelé pour les images déposées, collées ou choisies via la barre d'outils. Renvoyez
l'URL à intégrer ; lever une erreur marque l'envoi comme échoué dans l'interface.

```ts
import type { EditorImageUploadHandler } from "@blakaa/kinkin-editor";

const imageUploadHandler: EditorImageUploadHandler = {
  upload: async (file: File, onProgress: (percent: number) => void) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");

    onProgress(100);
    return (await res.json()).url;
  },
};
```

### `streamCompletion` — AI Assist en streaming

C'est ce qui fait tourner AI Assist. La bibliothèque construit le prompt à partir de
l'action choisie par l'utilisateur (`improve`, `continue`, `summarize`,
`fix-grammar`, `simplify`, `shorten`, `extend`, `translate`, `tone`, `custom`) et du
contexte environnant. Le transport vous appartient : appelez `onChunk` par token,
`onComplete` à la fin, `onError` en cas d'échec, et respectez `signal` pour que le
bouton d'arrêt fonctionne.

```ts
import type { StreamCompletionFn } from "@blakaa/kinkin-editor";

const streamCompletion: StreamCompletionFn = async ({
  message,
  signal,
  onChunk,
  onComplete,
  onError,
}) => {
  try {
    const res = await fetch("/api/llm", {
      method: "POST",
      body: JSON.stringify({ prompt: message }),
      signal,
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }

    onComplete();
  } catch (e) {
    if (!signal?.aborted) onError(e instanceof Error ? e.message : "Failed");
  }
};
```

Omettez-le et les boutons IA deviennent inertes, avec un avertissement en console.

### Autres exports

| Export | Utilité |
| --- | --- |
| `useAiAssistStream(editor, options)` | Le hook derrière AI Assist, si vous composez votre propre éditeur. |
| `getEditorPortalRoot()` | Le conteneur à portée dans lequel l'interface des portails est rendue. |
| `EDITOR_SCOPE_CLASS` | `"kinkin-editor"` — la classe de portée, pour marquer vos propres portails. |
| `<ToCItem />`, `<ToCEmptyState />` | Les pièces qui composent `<ToC />`, si vous voulez votre propre mise en page de sommaire. |
| Types | `RichTextEditorProps`, `EditorImageUploadHandler`, `StreamCompletionFn`, `StreamCompletionParams` |

---

## Recettes

**Sauvegarde automatique, en ignorant les modifications programmatiques**

```tsx
<RichTextEditor
  onChange={(value, meta) => {
    if (meta?.source === "manual") debouncedSave(value as string);
  }}
  {...rest}
/>
```

**Aperçu en lecture seule**

```tsx
<RichTextEditor initialContent={doc} editable={false} contentType="markdown" />
```

**Accéder à l'instance Tiptap**

```tsx
const editorRef = useRef(null);
<RichTextEditor editorRef={editorRef} {...rest} />;
// ensuite : editorRef.current?.commands.focus()
```

**HTML plutôt que markdown**

```tsx
<RichTextEditor contentType="html" outputContentType="html" {...rest} />
```

---

## Dépannage

### L'éditeur s'affiche sans style

Vous n'avez pas fait `import "@blakaa/kinkin-editor/style.css"`.

### L'éditeur a une hauteur nulle

Il remplit son conteneur. Donnez au parent une hauteur explicite, ou `min-height: 0`
s'il s'agit d'un enfant flex.

### `@tiptap/core` en double, ou `getPreviousBlockSibling is not exported`

Plus d'une version de Tiptap dans votre arbre de dépendances. Les plages transitives
`^3.31.3` de Tiptap lui-même peuvent se résoudre vers une version mineure plus
récente et tirer une seconde copie de `@tiptap/core`. Épinglez toute la portée dans
le `package.json` de votre application :

```json
{
  "overrides": {
    "@tiptap/core": "3.31.3",
    "@tiptap/pm": "3.31.3"
  }
}
```

(Yarn appelle cela `resolutions`.) Déplacez toute la portée d'un bloc lors des mises
à jour — mélanger des versions mineures de Tiptap échoue à la compilation, pas à
l'exécution.

### Les menus ou les infobulles apparaissent sans style

Quelque chose les rend en dehors du conteneur à portée. Envoyez-les par portail vers
`getEditorPortalRoot()`.

### Les styles de mon application ont changé après l'ajout de l'éditeur

Cela ne devrait pas arriver — c'est précisément ce que la mise à portée empêche. Si
cela se produit, c'est un bug qui mérite d'être signalé.

---

## Licence

[MIT](../LICENSE). Utilisez-le, forkez-le, diffusez-le commercialement — conservez
simplement la mention de copyright.

---

## Développement local

Voir la section [Local development](../README.md#local-development) du README anglais
pour l'arborescence, les conventions et les notes de compilation.
