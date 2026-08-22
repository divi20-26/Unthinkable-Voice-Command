# Voice Command Shopping Assistant
## Detailed Implementation Plan

## 1. Project Summary

Build a mobile-first voice shopping assistant that lets users manage a categorized shopping list, search a small product catalogue by voice, and receive practical recommendations based on shopping history, seasonality, sales, and substitutes.

The implementation should be deliberately focused on a strong working demo rather than a production-scale retail platform. The application will use a local product catalogue and browser capabilities so it can be completed, tested, and deployed within the assessment's eight-hour limit without requiring paid APIs or a backend.

> Assessment note: the supplied brief lists a deadline of 1 September 2025. That date has passed relative to the current date, so confirm the expected submission date with the hiring contact before submitting.

## 2. Recommended Technology Stack

### Application

- [React](https://react.dev/) for the user interface
- [Vite](https://vite.dev/) for fast development and production builds
- [TypeScript](https://www.typescriptlang.org/) for typed domain models and safer command parsing
- [CSS Modules](https://github.com/css-modules/css-modules) or a single scoped stylesheet for responsive styling
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) for accessible interface icons

### Browser capabilities

- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for speech recognition and text-to-speech
- [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) for voice commands
- [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) for spoken confirmations where supported
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for list, preferences, and shopping history persistence

### Testing and quality

- [Vitest](https://vitest.dev/) for unit tests
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component behavior tests
- [Testing Library user-event](https://testing-library.com/docs/user-event/intro/) for realistic interactions
- [ESLint](https://eslint.org/) for static analysis
- [TypeScript compiler](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for type checking

### Hosting

Use one of these static hosting providers:

- [Vercel](https://vercel.com/docs)
- [Netlify](https://docs.netlify.com/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

Vercel or Netlify is the fastest path for an assessment because both can deploy directly from a GitHub repository.

## 3. Scope and Product Decisions

### Included in the first version

- Add, remove, edit, and complete shopping-list items
- Voice commands for adding, removing, changing quantity, and searching
- Typed input fallback for browsers without speech recognition
- English plus a configurable second recognition language, initially Spanish (`es-ES`)
- Automatic product categorization
- Quantity and unit extraction
- Local product search by name, brand, category, and maximum price
- Purchase-history recommendations
- Seasonal and sale recommendations using local metadata
- Product substitutes
- Persistent browser storage
- Loading, listening, permission, empty-result, and error states
- Responsive mobile and desktop layouts

### Explicitly deferred

- User accounts and authentication
- Shared lists across devices
- Real-time inventory or retailer APIs
- Payment, checkout, and delivery
- Server-side speech processing
- Personal data analytics
- Full natural-language AI inference
- Background listening or wake-word support

These decisions keep the demo reliable and explainable while still demonstrating the required workflows.

## 4. User Experience

### Main screen

The application should open directly to the shopping experience rather than a marketing page.

Suggested layout:

1. Header containing the application name, language selector, and list count.
2. Large microphone button with a clear idle, listening, processing, success, and error state.
3. Live transcript area showing what the browser recognized.
4. Confirmation/status message such as `Added 2 bottles of water`.
5. Quick text input fallback with an add/search action.
6. Shopping list grouped by category.
7. Suggestions section with `Add` buttons.
8. Search results section shown only when a search command is active.

### Interaction states

- `Idle`: microphone is ready.
- `Listening`: show an animated microphone state and partial transcript.
- `Processing`: disable duplicate submissions while the command is parsed.
- `Success`: show the action and affected item.
- `Needs confirmation`: show the parsed action when confidence is low or the command is ambiguous.
- `Permission denied`: explain that microphone permission is needed and keep typed input available.
- `Unsupported`: explain that voice is unavailable in the current browser and show the text fallback.
- `No results`: show a useful recovery message and a clear-list action.

### Accessibility requirements

- Use semantic buttons, labels, headings, lists, and form controls.
- Never communicate state through color alone.
- Add `aria-live="polite"` to transcript and status regions.
- Provide visible focus styles.
- Ensure the microphone button has a descriptive accessible name.
- Keep touch targets at least 44 by 44 CSS pixels.
- Test keyboard navigation and reduced-motion behavior.
- Follow the [Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/).

## 5. Domain Model

```ts
type Category =
  | "produce"
  | "dairy"
  | "bakery"
  | "meat"
  | "pantry"
  | "frozen"
  | "beverages"
  | "snacks"
  | "household"
  | "other";

type Unit =
  | "item"
  | "bottle"
  | "can"
  | "box"
  | "bag"
  | "pack"
  | "kg"
  | "lb"
  | "liter"
  | "gallon";

interface ShoppingItem {
  id: string;
  name: string;
  normalizedName: string;
  quantity: number;
  unit: Unit;
  category: Category;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  unitLabel: string;
  aliases: string[];
  seasonalMonths: number[];
  onSale: boolean;
  substituteIds: string[];
}

interface PurchaseRecord {
  productName: string;
  category: Category;
  quantity: number;
  purchasedAt: string;
}

interface UserPreferences {
  recognitionLanguage: "en-US" | "es-ES";
  preferredCategories: Category[];
}
```

Use ISO date strings so records remain serializable in `localStorage`.

## 6. Suggested Project Structure

```text
src/
  components/
    AppHeader.tsx
    CommandBar.tsx
    ShoppingList.tsx
    ShoppingListItem.tsx
    CategorySection.tsx
    SuggestionsPanel.tsx
    SearchResults.tsx
    StatusMessage.tsx
  data/
    products.ts
    categoryKeywords.ts
  hooks/
    useSpeechRecognition.ts
    useLocalStorage.ts
  lib/
    commandParser.ts
    categorization.ts
    recommendations.ts
    productSearch.ts
    speech.ts
  types/
    domain.ts
  App.tsx
  main.tsx
  styles.css
  test/
    commandParser.test.ts
    recommendations.test.ts
    productSearch.test.ts
```

Keep business rules in `lib/` instead of placing parsing or recommendation logic inside React components. This makes the important behavior easy to test without a browser.

## 7. Voice Recognition Design

### Speech flow

1. User selects a language.
2. User presses the microphone button.
3. The app checks whether `SpeechRecognition` or `webkitSpeechRecognition` exists.
4. The app requests microphone access through the browser speech API.
5. Interim recognition results are rendered into the transcript area.
6. The final transcript is passed to the command parser.
7. The parser returns a typed command object.
8. The relevant list or search action is executed.
9. The app displays a confirmation and optionally speaks it aloud.
10. The recognition session ends and the microphone returns to idle.

### Browser compatibility

The Web Speech API is not uniformly supported across browsers and some implementations send audio to a vendor service. Document this clearly in the README. The application must continue to work with typed commands when recognition is unavailable or permission is denied.

Use feature detection rather than assuming the API exists:

```ts
const SpeechRecognitionApi =
  window.SpeechRecognition ?? window.webkitSpeechRecognition;
```

Because `webkitSpeechRecognition` is not always included in TypeScript's DOM types, define a small local interface or use a typed compatibility wrapper rather than spreading type assertions throughout the UI.

### Recognition configuration

- `continuous = false`
- `interimResults = true`
- `maxAlternatives = 1`
- `lang` from the language selector

Do not use background listening. A user-initiated microphone session is simpler to explain and safer for privacy.

## 8. Natural-Language Command Parser

The parser should be deterministic and transparent for the assessment. It does not need a remote LLM to demonstrate NLP-style flexibility.

### Command result

```ts
type ParsedCommand =
  | {
      type: "add";
      itemName: string;
      quantity: number;
      unit: Unit;
    }
  | {
      type: "remove";
      itemName: string;
    }
  | {
      type: "update";
      itemName: string;
      quantity?: number;
      unit?: Unit;
    }
  | {
      type: "search";
      query: string;
      brand?: string;
      maxPrice?: number;
    }
  | {
      type: "unknown";
      transcript: string;
    };
```

### Normalization steps

1. Convert to lowercase.
2. Trim whitespace and punctuation.
3. Normalize number words such as `one`, `two`, `five`, and Spanish equivalents used in the supported examples.
4. Replace common synonyms such as `purchase` with `buy` and `groceries` with `shopping list`.
5. Detect the command intent.
6. Extract quantity and unit.
7. Remove command filler words.
8. Normalize singular and plural product names.
9. Categorize the resulting product.
10. Return a typed result with a confidence level if useful.

### Supported English examples

| User says | Result |
| --- | --- |
| `Add milk` | Add one item of milk |
| `I need apples` | Add one item of apples |
| `I want to buy bananas` | Add one item of bananas |
| `Add 2 bottles of water` | Add two bottles of water |
| `Buy 5 oranges` | Add five items of oranges |
| `Remove milk from my list` | Remove milk |
| `Change apples to 6` | Update apples to six |
| `Find organic apples` | Search for organic apples |
| `Find toothpaste under $5` | Search toothpaste with max price 5 |
| `Find Brand X cereal below 8 dollars` | Search cereal for Brand X with max price 8 |

### Intent detection strategy

Use ordered regular expressions and keyword groups:

```text
remove/delete/take off -> remove
change/update/set -> update
find/search/look for -> search
add/buy/need/want to buy/pick up -> add
```

Try more specific patterns before generic ones. For example, detect `under $5` before stripping filler words from a search command.

For unsupported or ambiguous text, return `unknown` and show the recognized transcript with a typed-input fallback. Avoid silently adding an incorrectly parsed product.

### Multilingual support

For the first version:

- Add `en-US` and `es-ES` to the language selector.
- Set the recognition locale using the selected option.
- Add Spanish intent phrases such as `agrega`, `comprar`, `necesito`, `elimina`, and `busca`.
- Add a small Spanish number-word map.
- Keep the product catalogue names and UI labels in English unless full translation is explicitly required.

This demonstrates multilingual voice input without expanding the scope into a complete internationalization system. A future version could use [FormatJS](https://formatjs.io/) or [i18next](https://www.i18next.com/) for translated UI content.

## 9. Shopping List Management

### Add behavior

- If the normalized item is already present and incomplete, increase its quantity instead of creating a duplicate.
- If a unit changes, preserve the explicit new unit.
- Assign the category from product metadata first, then keyword matching, then `other`.
- Record the addition in purchase history to power later recommendations.

### Remove behavior

- Match exact normalized names first.
- Fall back to aliases such as `soda` and `soft drink`.
- If multiple matches exist, request a typed or visual clarification rather than deleting several items.

### Update behavior

- Support quantity changes and optional unit changes.
- Keep completed status unchanged when only quantity is edited.
- Show an inline edit control as a non-voice fallback.

### Persistence

Use a small storage adapter:

```ts
const STORAGE_KEYS = {
  list: "voice-shopper:list",
  history: "voice-shopper:history",
  preferences: "voice-shopper:preferences",
} as const;
```

Parse stored JSON defensively. If stored data is invalid, reset only the affected key and show a non-blocking warning in development.

## 10. Product Catalogue and Search

Create a local catalogue of approximately 25 to 40 products covering the required categories. Include realistic but clearly demo-oriented values for:

- Product name
- Brand
- Price
- Category
- Unit label
- Aliases
- Seasonal months
- Sale status
- Substitute products

Example records:

- Organic apples, Green Valley, produce, `$4.49`, seasonal months 8-11
- Whole milk, Meadow Fresh, dairy, `$3.99`, substitute almond milk
- Almond milk, Meadow Fresh, dairy, `$4.49`, substitute whole milk
- Whole wheat bread, Daily Bake, bakery, `$2.99`
- Toothpaste, BrightSmile, household, `$3.49`
- Bottled water, ClearSpring, beverages, `$4.99`

### Search algorithm

1. Normalize the spoken query.
2. Match product name and aliases.
3. Match category if requested.
4. Match brand if detected.
5. Apply `maxPrice` when present.
6. Sort exact matches first, then lower price, then sale items.
7. Show substitutes for matching products.

A local catalogue is appropriate for the assessment because it makes the demo deterministic and avoids depending on retailer APIs that may require credentials or change behavior.

## 11. Smart Suggestions

### History-based recommendations

Count completed or previously added products by normalized name. Recommend products that:

- Were purchased at least twice.
- Are not already on the active list.
- Have not been dismissed recently.

Use a simple score:

```text
score = frequency * 3 + recencyBonus + saleBonus + seasonalBonus
```

This is sufficient to demonstrate personalization without claiming to predict actual inventory levels.

### Seasonal recommendations

Compare the current month with `seasonalMonths` in the local catalogue. Show a label such as `In season now`.

For a stable demo, inject the current month through a small helper so it can be tested with a fixed date.

### Sale recommendations

Mark selected catalogue records with `onSale: true` and display `On sale` in the suggestion card. Do not imply that these are live prices.

### Substitutes

Maintain explicit substitute relationships using product IDs. When a search or list item has an alternative, show one or two suggestions with:

- Product name
- Reason, such as `Dairy-free alternative`
- Price
- `Add to list` action

## 12. Error Handling and Loading States

Handle these cases explicitly:

- Browser does not support speech recognition.
- Microphone permission is denied.
- Recognition ends without a final transcript.
- Recognition service returns an error.
- Command intent cannot be determined.
- Product name is missing.
- Search has no matches.
- LocalStorage is unavailable or contains malformed data.
- A duplicate action is submitted while processing.

Every error should be concise and actionable. For example: `I could not understand that. Try “Add 2 bottles of water” or use the text field.`

## 13. Testing Plan

### Unit tests

Test the pure functions first because they carry most of the product behavior:

- Command normalization
- Add command parsing
- Quantity and unit extraction
- Number-word conversion
- Remove and update parsing
- Search query, brand, and price extraction
- Product categorization
- Duplicate item merging
- Product search filtering and sorting
- Seasonal and history recommendation scoring
- Substitute lookup

### Component tests

Test user-visible flows:

- Adding an item from typed input
- Removing an item
- Completing an item
- Adding a suggestion
- Rendering listening and error states
- Rendering no-search-results state
- Language selection updates recognition configuration

Mock `SpeechRecognition` in component tests. Do not make tests depend on an actual microphone or browser speech service.

### Manual acceptance checklist

- [ ] User can add `milk` with typed input.
- [ ] User can add `2 bottles of water` by voice.
- [ ] User can remove `milk` by voice.
- [ ] User can update an item's quantity.
- [ ] Items are grouped into categories.
- [ ] Duplicate additions merge quantities.
- [ ] Search supports brand and maximum price.
- [ ] Suggestions appear from history or catalogue metadata.
- [ ] Substitutes can be added.
- [ ] English and Spanish recognition locales are selectable.
- [ ] Unsupported voice browsers still have a usable text flow.
- [ ] Data survives a page refresh.
- [ ] Mobile layout works without horizontal scrolling.
- [ ] Production build completes successfully.

## 14. Implementation Sequence

### Phase 1: Project setup, 30 minutes

1. Create a Vite React TypeScript application.
2. Install test and icon dependencies.
3. Configure ESLint and Vitest.
4. Establish the source structure and domain types.
5. Add the initial catalogue and category metadata.

### Phase 2: List management, 90 minutes

1. Implement localStorage read/write helpers.
2. Implement list reducer or state functions.
3. Build list rendering grouped by category.
4. Add typed add, edit, remove, and complete interactions.
5. Add duplicate quantity merging.

### Phase 3: Voice input and parser, 120 minutes

1. Add speech-recognition feature detection.
2. Build the `useSpeechRecognition` hook.
3. Render transcript and microphone states.
4. Implement the parser for add, remove, update, and search commands.
5. Connect parsed commands to list actions.
6. Add English and Spanish phrase maps.
7. Add text input fallback.

### Phase 4: Search and suggestions, 75 minutes

1. Add the product-search function.
2. Add brand and price parsing.
3. Add search result rendering.
4. Add history-based suggestions.
5. Add seasonal and sale labels.
6. Add substitute relationships and actions.

### Phase 5: UX polish and accessibility, 60 minutes

1. Add responsive layout for narrow screens.
2. Add loading, permission, error, and empty states.
3. Add `aria-live` feedback and keyboard focus behavior.
4. Add restrained page-load and listening animations.
5. Test on a Chromium browser and a mobile viewport.

### Phase 6: Testing, documentation, and deployment, 65 minutes

1. Write parser and recommendation unit tests.
2. Run type checking, linting, and tests.
3. Build the production bundle.
4. Write README and the 200-word approach summary.
5. Push to GitHub.
6. Deploy through Vercel, Netlify, or Firebase.
7. Test the hosted URL and record browser limitations.

Total: approximately 8 hours.

## 15. Definition of Done

The project is ready for submission when:

- The hosted URL loads directly into the working shopping assistant.
- A reviewer can complete the primary flow without reading source code.
- Voice commands visibly produce recognized transcripts and confirmations.
- Typed input works when voice recognition is unavailable.
- List data persists after refresh.
- Search, price filtering, categories, suggestions, and substitutes are demonstrable.
- Unsupported browser and microphone permission cases are handled gracefully.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.
- The README explains setup, supported commands, architecture, limitations, and deployment.
- The repository contains no secrets, API keys, generated build output, or unnecessary dependencies.

## 16. README Content to Prepare

The repository README should contain:

1. Project name and one-sentence description.
2. Hosted application link.
3. Screenshot or short GIF if available.
4. Feature list.
5. Supported voice-command examples.
6. Browser and microphone-permission requirements.
7. Local setup commands.
8. Project structure.
9. Data and privacy explanation.
10. Testing commands.
11. Deployment instructions.
12. Known limitations and possible future improvements.

Suggested setup commands:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## 17. 200-Word Approach Summary

Voice Command Shopping Assistant is a mobile-first React and TypeScript application for managing shopping lists through natural voice commands. It uses the browser Web Speech API for speech recognition, displays interim transcripts for immediate feedback, and falls back to typed input when voice recognition is unavailable or permission is denied.

Commands are normalized and parsed into typed actions such as add, remove, update, and search. The parser supports flexible phrases, quantity and unit extraction, price limits, brands, and English and Spanish recognition locales. Shopping items are automatically categorized and persisted in localStorage so the app remains useful without a backend.

A local product catalogue powers deterministic search results, sale labels, seasonal recommendations, and substitute products. Purchase history is used to recommend frequently added products that are not already on the active list. This approach keeps the assessment demo fast, reliable, inexpensive to host, and easy to review while leaving a clear path for future integrations with retailer inventory APIs, authentication, and server-side speech or NLP services.

## 18. Resource Links

### Core technologies

- [React documentation](https://react.dev/)
- [Vite documentation](https://vite.dev/guide/)
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN browser compatibility data](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Understanding_web_compatibility_tables)

### Testing and code quality

- [Vitest guide](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library user-event](https://testing-library.com/docs/user-event/intro/)
- [ESLint documentation](https://eslint.org/docs/latest/)
- [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

### Accessibility and UX

- [WCAG standards](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [WAI-ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Web accessibility evaluation tools](https://www.w3.org/WAI/test-evaluate/)
- [MDN responsive design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)

### Deployment

- [Vercel documentation](https://vercel.com/docs)
- [Netlify documentation](https://docs.netlify.com/)
- [Firebase Hosting documentation](https://firebase.google.com/docs/hosting)
- [GitHub documentation](https://docs.github.com/en)

### Optional future enhancements

- [i18next internationalization](https://www.i18next.com/)
- [FormatJS internationalization](https://formatjs.io/)
- [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
- [Open Food Facts API](https://world.openfoodfacts.org/data)
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text/docs)
- [Azure Speech service](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
- [OpenAI API documentation](https://platform.openai.com/docs/)

> The optional services should only be added if their pricing, credentials, privacy implications, and assessment requirements are understood. The first version should remain fully functional without them.
