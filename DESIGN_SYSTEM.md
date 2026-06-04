# Hanbit Academy Sales Catalog Design System

## Product Direction

The product should feel like a premium SaaS course-finder dashboard for tablet-based professor consultations. It is not a bookstore, publisher homepage, or shopping catalog. The visual system should prioritize fast search, course fit, comparison, selection, and sharing.

## 1. Color Tokens

- `--color-canvas`: app background, cool off-white.
- `--color-surface`: primary panels and cards.
- `--color-surface-soft`: subtle secondary fills.
- `--color-surface-glass`: translucent floating surfaces.
- `--color-text`: primary text.
- `--color-text-muted`: descriptions and secondary metadata.
- `--color-text-soft`: tertiary labels.
- `--color-border`: default borders.
- `--color-border-strong`: focused or structural borders.
- `--color-accent`: cobalt blue or deep navy, only for primary actions, focus rings, and selected states.
- `--color-accent-soft`: pale blue selected state background.
- `--color-accent-ink`: text on pale blue states.

Hanbit orange should not be a dominant UI color. Use deep navy and cobalt blue for trust, clarity, and global SaaS polish.

## 2. Background Style

- Use a light gray/off-white SaaS canvas.
- Add subtle radial light and grid texture only behind the main work surface.
- Avoid decorative blobs, heavy gradients, and bookstore-like promotional hero imagery.
- Keep contrast quiet and professional for long tablet sessions.

## 3. Card Style

- Cards use white or translucent white surfaces, 8px radius, and light borders.
- Shadows should be soft and shallow, used to separate layers rather than decorate.
- Repeated cards should be compact and scannable.
- Cards should emphasize course fit, target grade, teaching materials, and digital availability before commerce metadata.

## 4. Button Style

- Primary buttons use cobalt blue or deep navy sparingly.
- Secondary buttons use white surfaces, gray borders, and dark text.
- Buttons must be tablet-friendly with at least 42px height.
- Icon + label is preferred for core actions.

## 5. Badge Style

- Badges are quiet metadata chips with neutral borders.
- Active badges use pale blue fill and cobalt text.
- Badges should represent sales-useful signals: course tag, grade, teaching material, digital format, priority.
- Internal operations badges such as review/failure states should not appear in the sales UI.

## 6. Search Style

- Search is the primary hero control.
- Search fields should be large, high contrast, and centered in the first task flow.
- Focus state should use a subtle cobalt ring.
- Placeholder should support title, author, course name, and ISBN.

## 7. Sidebar/Filter Style

- Filters should feel like dashboard controls, not storefront category navigation.
- Use segmented chips, compact category cards, and scrollable tag rows.
- Keep filter areas thin enough that search results appear quickly on tablet landscape.

## 8. Dialog/Sheet Style

- Dialogs and sheets should feel like SaaS detail panels.
- Use clear title hierarchy, sticky action areas, and compact metadata grids.
- Avoid internal processing language in professor-facing or sales-facing panels.

## 9. Book Card Style

- Book cards prioritize consultative signals:
  - course category
  - target grade
  - difficulty
  - teaching materials
  - digital textbook availability
  - selected/share action
- Cover images support recognition but should not dominate the card like a bookstore.
- Cards should be dense enough for quick comparison on tablet landscape.

## 10. Tablet Responsive Rules

- Primary target: tablet landscape around 1024px to 1366px width.
- Hero should not consume the whole first viewport.
- Touch targets should stay at least 42px high.
- Grids should collapse gradually: dashboard columns first, book cards second.
- Mobile should stack naturally without horizontal overflow.
