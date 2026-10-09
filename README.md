# Screenly Menu Board App

![Menu Board App Screenshot](/screenshots/1920x1080.webp)

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-menu-board --in-place
bun run deploy
screenly edge-app instance create
```

### Releasing

Pushes to `main` deploy to stage automatically. To release to production, tag a commit on `main` and push the tag (the workflow refuses tags not on `main`):

```bash
git checkout main && git pull
git tag v26.10.0
git push origin v26.10.0
```

Then publish a GitHub Release whose notes list the pull requests merged since the previous release. Add `--draft` to review the notes before publishing:

```bash
gh release create v26.10.0 --verify-tag --generate-notes --title v26.10.0
```

Use the `vYY.M.PATCH` scheme (e.g. `v26.10.0` for the first release in October 2026, `v26.10.1` for the next one that month).

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting               | Description                                                                                           | Type               | Default                     |
| --------------------- | ----------------------------------------------------------------------------------------------------- | ------------------ | --------------------------- |
| `menu_title`          | The title displayed at the top of the menu                                                            | required           | `Today's Menu`              |
| `menu_style`          | Typography and styling: `traditional`, `modern` or `minimal`                                          | optional           | `traditional`               |
| `currency`            | Currency symbol to display with prices                                                                | optional           | `$`                         |
| `item_XX_description` | Description of menu item XX (where XX is `01`-`12`, zero-padded; e.g., `item_01_description`)         | optional           | -                           |
| `item_XX_labels`      | Comma-separated labels for menu item XX (e.g., vegetarian, spicy, gluten-free; where XX is `01`-`12`) | optional           | -                           |
| `item_XX_name`        | Name of menu item XX (where XX is `01`-`12`, zero-padded). Items without a name will be skipped       | optional           | -                           |
| `item_XX_price`       | Price of menu item XX (where XX is `01`-`12`, zero-padded; e.g., `item_01_price`)                     | optional           | -                           |
| `accent_color`        | Color for highlights and borders                                                                      | optional, advanced | `rgba(255, 255, 255, 0.95)` |
| `logo_url`            | URL to your restaurant's logo                                                                         | optional, advanced | -                           |
| `background_image`    | URL to a background image                                                                             | optional, advanced | -                           |
| `display_errors`      | Display detailed error messages on screen                                                             | optional, advanced | `false`                     |

### Default Menu Items

The app comes with four sample pizza items pre-configured for demonstration purposes:

1. **Classic Margherita** ($13.99) - San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil • _vegetarian_
2. **Pepperoni Supreme** ($15.99) - Double pepperoni, mozzarella, parmesan, homemade tomato sauce, oregano • _spicy_
3. **Four Cheese** ($16.99) - Mozzarella, gorgonzola, parmesan, fontina, fresh basil, garlic olive oil • _vegetarian_
4. **Mediterranean Veggie** ($14.99) - Roasted bell peppers, kalamata olives, red onions, cherry tomatoes, feta, spinach • _vegetarian, gluten-free_

You can customize or replace these items with your own menu content.

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Testing

```bash
bun test
```

## Screenshots

Generate screenshots at all supported resolutions:

```bash
bun run screenshots
```

Screenshots are saved to the `screenshots/` directory.
