# AI Page Guide

This browser extension helps a user ask a question about the current web page and get a step-by-step explanation using OpenAI Vision.

## Features
- Capture the current visible page screenshot
- Read the visible page text from the browser
- Send both the screenshot and the page text to OpenAI
- Explain buttons, sections, and actions in Arabic or English
- Useful for QuickBooks, trading platforms, accounting systems, and any web app

## How to install
1. Open Chrome or Edge.
2. Go to `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the folder `ai-agent`.

## How to use
1. Open the page you want to understand.
2. Click the extension icon.
3. Paste your OpenAI API key.
4. Ask a question like:
   - كيف أضيف عميل جديد؟
   - ما الخطوات لإنشاء فاتورة؟
   - ما هذا الزر؟
   - ماذا يحدث في هذه الصفحة؟
5. Click `تحليل الصفحة`.

## Important note
- The API key is stored locally in the browser using `chrome.storage.local`.
- Do not paste your key in public repos or shared files.

## Required API model
This example uses `gpt-4o-mini` with vision support.
