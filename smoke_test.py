from playwright.sync_api import sync_playwright
import json
import time

results = {
    'console': [],
    'page_errors': [],
    'actions': []
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.on('console', lambda msg: results['console'].append({'type': msg.type, 'text': msg.text}))
    page.on('pageerror', lambda exc: results['page_errors'].append(str(exc)))

    url = 'http://127.0.0.1:8000/index.html'
    print('Navigating to', url)
    page.goto(url, wait_until='networkidle')
    time.sleep(0.5)

    # 1) Add item from form
    try:
        page.select_option('#category', 'shirt')
        page.select_option('#color', 'white')
        page.fill('#style', 'Button-Down')
        page.select_option('#formality', 'professional')
        page.click('#addItemBtn')
        page.wait_for_selector('.inventory-item', timeout=2000)
        results['actions'].append('addItemFromForm:ok')
    except Exception as e:
        results['actions'].append(f'addItemFromForm:error:{e}')

    # 2) Camera upload
    try:
        page.select_option('#camera-item', 'white-button-down')
        page.click('#cameraUploadBtn')
        # wait for second inventory item
        page.wait_for_selector('.inventory-item:nth-child(2)', timeout=2000)
        results['actions'].append('cameraUpload:ok')
    except Exception as e:
        results['actions'].append(f'cameraUpload:error:{e}')

    # 3) Recommendations
    try:
        page.click('[data-tab="recommendations"]')
        page.select_option('#occasion', 'meeting')
        page.select_option('#weather', 'all-season')
        page.click('#recommendBtn')
        page.wait_for_selector('.outfit', timeout=3000)
        results['actions'].append('recommendations:ok')
    except Exception as e:
        results['actions'].append(f'recommendations:error:{e}')

    # 4) Feedback
    try:
        btn = page.query_selector('.feedback-like')
        if btn:
            btn.click()
            results['actions'].append('feedback_like:ok')
        else:
            results['actions'].append('feedback_like:none')
    except Exception as e:
        results['actions'].append(f'feedback_like:error:{e}')

    # 5) Take quiz
    try:
        page.click('[data-tab="style-quiz"]')
        # pick first option each question
        for q in page.query_selector_all('.quiz-question'):
            opt = q.query_selector('.quiz-option')
            if opt:
                opt.click()
        page.click('#submitQuizBtn')
        page.wait_for_selector('#styleProfile p', timeout=2000)
        results['actions'].append('quiz:ok')
    except Exception as e:
        results['actions'].append(f'quiz:error:{e}')

    # 6) Check localStorage
    try:
        data = page.evaluate('localStorage.getItem("workwearAppData")')
        results['localStorage'] = json.loads(data) if data else None
        results['actions'].append('localStorage:ok')
    except Exception as e:
        results['actions'].append(f'localStorage:error:{e}')

    # 7) Reset app
    try:
        def on_dialog(dialog):
            dialog.accept()
        page.once('dialog', on_dialog)
        page.click('#resetBtn')
        time.sleep(0.5)
        data2 = page.evaluate('localStorage.getItem("workwearAppData")')
        results['localStorage_after_reset'] = data2
        results['actions'].append('reset:ok')
    except Exception as e:
        results['actions'].append(f'reset:error:{e}')

    # take screenshot
    page.screenshot(path='smoke_result.png', full_page=True)

    browser.close()

print(json.dumps(results, indent=2))
