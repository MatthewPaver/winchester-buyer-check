from pathlib import Path

from playwright.sync_api import sync_playwright


OUTPUT = Path("/tmp/winchester-house-hunter.png")
SHOWCASE = Path(__file__).resolve().parents[1] / "assets" / "showcase.png"


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors: list[str] = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.goto("http://127.0.0.1:8765")
    page.wait_for_load_state("networkidle")

    assert page.title() == "Winchester House Hunter · Interactive demo"
    page.get_by_role("heading", name="Homes worth a closer look.").wait_for()
    assert page.locator(".home-card").count() == 9

    showcase = browser.new_page(viewport={"width": 1200, "height": 675})
    showcase.goto("http://127.0.0.1:8765")
    showcase.wait_for_load_state("networkidle")
    showcase.screenshot(path=str(SHOWCASE), animations="disabled")
    showcase.close()

    page.get_by_role("link", name="Market").click()
    page.get_by_role("heading", name="See what homes actually sold for.").wait_for()
    page.get_by_label("Postcode area").select_option("SO23")
    assert page.locator("[data-market-row]:not([hidden])").count() == 6

    page.get_by_role("link", name="Plan").click()
    page.get_by_label("Asking price").fill("460000")
    page.get_by_text("LISA blocked", exact=True).wait_for()

    page.get_by_role("link", name="Homes 9").click()
    page.get_by_role("button", name="Review Upper Brook Street").click()
    page.get_by_role("heading", name="Upper Brook Street").wait_for()
    page.get_by_text("Agent council", exact=True).wait_for()

    page.get_by_role("link", name="Evidence").click()
    page.get_by_text("40%", exact=True).wait_for()
    page.get_by_text("Survey and title", exact=True).wait_for()

    assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    assert not errors, errors
    page.screenshot(path=str(OUTPUT), full_page=True)

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto("http://127.0.0.1:8765")
    mobile.wait_for_load_state("networkidle")
    assert mobile.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    mobile.get_by_role("link", name="Plan").click()
    mobile.get_by_role("heading", name="Find the usable ceiling.").wait_for()
    browser.close()

print(f"Smoke test passed; screenshots: {OUTPUT}, {SHOWCASE}")
