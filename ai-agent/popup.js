const STORAGE_KEY = 'ai_page_guide_key';

async function getPageContext() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      const text = document.body ? document.body.innerText : '';
      return {
        title: document.title || 'No title',
        url: location.href,
        text: (text || '').slice(0, 4000)
      };
    }
  });

  return {
    tab,
    page: result.result
  };
}

async function captureVisibleScreenshot() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
  return { tab, dataUrl };
}

async function saveKey(key) {
  await chrome.storage.local.set({ [STORAGE_KEY]: key });
}

async function getSavedKey() {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  return result[STORAGE_KEY] || '';
}

function updateStatus(text) {
  const status = document.getElementById('status');
  status.textContent = text;
}

function updateResult(text) {
  const result = document.getElementById('result');
  result.textContent = text;
}

async function askOpenAI(prompt, imageDataUrl, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl } }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'لم يتم الحصول على إجابة.';
}

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const question = document.getElementById('question').value.trim();

  if (!apiKey) {
    updateStatus('يرجى إدخال مفتاح OpenAI API');
    updateResult('أدخل مفتاح OpenAI في الحقل أعلى الصفحة ثم حاول مرة أخرى.');
    return;
  }

  try {
    await saveKey(apiKey);
    updateStatus('جاري تحليل الصفحة...');

    const { page } = await getPageContext();
    const { dataUrl } = await captureVisibleScreenshot();

    const finalPrompt = `
    أنت مساعد تدريب محترف يشرح للمتدرب كيفية استخدام صفحة الويب أو التطبيق.
    مهمتك:
    - اقرأ الصورة وسجل الصفحة
    - شرح ما هي الصفحة
    - إذا كان المستخدم يطلب تعليمات، اذكر الخطوات الدقيقة المطلوبة
    - ركّز على إجراءات المستخدم وليس على الأكواد
    - استخدم اللغة العربية بشكل واضح وسهل
    - عند وجود أزرار أو حقول، اذكر اسمها بالضبط

    معلومات الصفحة:
    - العنوان: ${page.title}
    - الرابط: ${page.url}
    - النص الظاهر: ${page.text}

    السؤال الذي يطلبه المستخدم:
    ${question || 'ما الذي يجب أن أفعله في هذه الصفحة؟'}
    `;

    const answer = await askOpenAI(finalPrompt, dataUrl, apiKey);
    updateResult(answer);
    updateStatus('تم التحليل بنجاح');
  } catch (error) {
    console.error(error);
    updateStatus('حدث خطأ');
    updateResult(`تعذر تحليل الصفحة: ${error.message}`);
  }
});

document.getElementById('clearBtn').addEventListener('click', async () => {
  await chrome.storage.local.remove([STORAGE_KEY]);
  document.getElementById('apiKey').value = '';
  updateStatus('تم مسح المفتاح');
  updateResult('تم حذف المفتاح من التخزين المحلي.');
});

async function loadSavedKey() {
  const key = await getSavedKey();
  const input = document.getElementById('apiKey');
  input.value = key;
}

loadSavedKey();
