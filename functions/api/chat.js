export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };

  try {
    const body = await context.request.json();
    const message = String(body?.message || '').trim();
    const contextData = body?.context || {};

    if (!message) {
      return new Response(JSON.stringify({ error: 'پیام خالی است.' }), { status: 400, headers });
    }

    const apiKey = context.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY روی سرور تنظیم نشده است.' }), { status: 500, headers });
    }

    const safeContext = JSON.stringify({
      tasks: Array.isArray(contextData.tasks) ? contextData.tasks.slice(0, 100) : [],
      notes: Array.isArray(contextData.notes) ? contextData.notes.slice(0, 50) : [],
      goals: Array.isArray(contextData.goals) ? contextData.goals.slice(0, 50) : [],
      transactions: Array.isArray(contextData.transactions) ? contextData.transactions.slice(0, 100) : []
    });

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5.5',
        instructions: 'تو VANTA AI هستی؛ دستیار شخصی فارسی‌زبان کاربر. کوتاه، صمیمی و کاربردی جواب بده. اگر درباره داده‌های VANTA سؤال شد، فقط بر اساس داده‌ای که در Context داده شده پاسخ بده و چیزی را حدس نزن. اطلاعات خصوصی Context را فقط برای پاسخ به همین درخواست استفاده کن.',
        input: `Context داده‌های VANTA:\n${safeContext}\n\nپیام کاربر:\n${message}`,
        max_output_tokens: 700
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('OpenAI API error', result);
      return new Response(JSON.stringify({ error: 'ارتباط با هوش مصنوعی برقرار نشد.' }), { status: 502, headers });
    }

    return new Response(JSON.stringify({ reply: result.output_text || 'پاسخی دریافت نشد.' }), { status: 200, headers });
  } catch (error) {
    console.error('VANTA AI endpoint error', error);
    return new Response(JSON.stringify({ error: 'خطای سرور VANTA AI' }), { status: 500, headers });
  }
}
