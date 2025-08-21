
// --- Utility DOM helpers ---
const $ = (sel) => document.querySelector(sel);
const chatEl = $('#chat');
const inputEl = $('#input');
const sendBtn = $('#send');
const clearBtn = $('#clear');
const apiKeyEl = $('#apiKey');
const toggleLiveBtn = $('#toggleLive');

let LIVE_MODE = false; // toggled by user

function addMsg(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${role}`;
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? 'U' : 'P';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = text;
    if (role === 'user') { wrap.appendChild(bubble); wrap.appendChild(avatar); }
    else { wrap.appendChild(avatar); wrap.appendChild(bubble); }
    chatEl.appendChild(wrap);
    chatEl.scrollTop = chatEl.scrollHeight;
}

function addTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    wrap.id = 'typing';
    const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.textContent = 'P';
    const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.innerText = 'typing…';
    wrap.appendChild(avatar); wrap.appendChild(bubble);
    chatEl.appendChild(wrap); chatEl.scrollTop = chatEl.scrollHeight; return wrap;
}
function removeTyping() { const t = document.getElementById('typing'); if (t) t.remove(); }

// --- Mock phantom brain ---
async function mockPhantom(userText) {
    // Very lightweight: plan → wait → respond
    const plan = [
        `Analyze ➜ Interests, strengths, current skills from: "${userText}"`,
        'Map ➜ Match to career paths, skills, and learning milestones',
        'Recommend ➜ 30/60/90‑day plan + courses + internship leads'
    ];
    for (const step of plan) {
        await new Promise(r => setTimeout(r, 700));
        addMsg('bot', step);
    }
    await new Promise(r => setTimeout(r, 800));
    const reply = `Here\'s your Career Plan: 
• 30 days: Fundamentals + 2 mini‑projects.
• 60 days: Portfolio project + GitHub README + mock interviews.
• 90 days: Apply to 10 internships/week with tailored resumes.

Courses: MDN + Frontend Mentor + one JS course.
Tip: Track weekly using the built‑in checklist.`;
    addMsg('bot', reply);
}

// --- Live mode with OpenAI (optional) ---
async function livePhantom(userText) {
    const key = apiKeyEl.value.trim();
    if (!key) { addMsg('bot', 'Live Mode is on but no API key provided. Add one in Settings.'); return; }
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a concise AI Career & Skill Development Advisor. Analyze interests, map to roles, suggest courses/resources, create 30/60/90‑day plans, and include internship tactics. Reply in short, actionable bullets.' },
                    { role: 'user', content: userText }
                ],
                temperature: 0.5
            })
        });
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim() || 'No response received.';
        addMsg('bot', text);
    } catch (e) {
        addMsg('bot', 'Error calling API. In a real project, use a backend proxy to avoid CORS & hide keys.');
    }
}

async function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;
    addMsg('user', text);
    inputEl.value = '';
    const t = addTyping();
    await new Promise(r => setTimeout(r, 300));
    removeTyping();
    if (LIVE_MODE) await livePhantom(text); else await mockPhantom(text);
}

sendBtn.addEventListener('click', handleSend);
inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });
clearBtn?.addEventListener('click', () => { chatEl.innerHTML = ''; });
toggleLiveBtn?.addEventListener('click', () => {
    LIVE_MODE = !LIVE_MODE;
    toggleLiveBtn.textContent = LIVE_MODE ? 'Disable Live Mode' : 'Enable Live Mode';
    addMsg('bot', LIVE_MODE ? 'Live Mode enabled. Add your API key in Settings.' : 'Live Mode disabled. Using mock brain.');
});

// Seed messages
addMsg('bot', '🎓 I am your AI Career & Skill Development Advisor. Tell me your background and target role to get a 30/60/90‑day roadmap.');
