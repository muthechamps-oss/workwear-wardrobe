# Workwear Wardrobe Assistant Pro

A small static web app that helps you manage a workwear wardrobe and get outfit recommendations.

Demo: https://muthechamps-oss.github.io/workwear-wardrobe/

## Files
- `index.html` — main UI
- `styles.css` — styles
- `app.js` — client-side logic
- `smoke_test.py` — Playwright smoke test
- `smoke_result.png` — test screenshot

## Run locally
1. Serve the folder (Python):
   ```bash
   py -m http.server 8000
   # or
   python -m http.server 8000
   ```
2. Open http://127.0.0.1:8000/index.html in your browser.

## Smoke test (Playwright)
1. Install Playwright:
   ```bash
   pip install playwright
   playwright install
   ```
2. Run the test:
   ```bash
   python smoke_test.py
   ```

## Contributing
Pull requests and issues are welcome. Please keep files small and avoid committing large binaries.

## License
MIT (add `LICENSE` file if you want an explicit license file).