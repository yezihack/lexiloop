// 朗读：英文优先 mp3（有道，按口音分英美），失败 fallback 系统 TTS
let speakSeq = 0;

export function cancelSpeak() {
  speakSeq++;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

export function speakEnglishOnce(word, rate, onend, accent = 'us') {
  // 有道发音：type=1 英音，type=2 美音
  const type = accent === 'uk' ? 1 : 2;
  const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word.toLowerCase())}&type=${type}`;
  const audio = new Audio(url);
  audio.playbackRate = rate;
  let settled = false;
  const fallback = () => {
    if (settled) return;
    settled = true;
    if (!('speechSynthesis' in window)) { onend(); return; }
    const u = new SpeechSynthesisUtterance(word);
    u.lang = accent === 'uk' ? 'en-GB' : 'en-US';
    u.rate = rate;
    u.onend = onend;
    u.onerror = onend;
    speechSynthesis.speak(u);
  };
  audio.onended = () => { if (!settled) { settled = true; onend(); } };
  audio.onerror = fallback;
  setTimeout(() => { if (!settled) { audio.pause(); fallback(); } }, 3000);
  audio.play().catch(fallback);
}

// 提取中文释义文本（去词性前缀）
export function firstMeaning(raw, all = false) {
  if (!raw) return '';
  const stripped = raw.replace(/^[a-z./&]+\s*/i, '');
  if (!all) return stripped.split(/[；;,，]/)[0].trim();
  return stripped.split(/[；;]/)
    .map(s => s.trim().replace(/^[a-z./&]+\s*/i, ''))
    .filter(Boolean)
    .join(' ');
}

// 连读 N 次 + 可选中文：返回一个取消器
export function speakRepeat({ word, meaning, times, rate, speakMode, brainwash, zhReadAll, accent, onfinish }) {
  if (!('speechSynthesis' in window)) { onfinish && onfinish(); return () => {}; }
  speechSynthesis.cancel();
  const mySeq = ++speakSeq;

  const zhText = (speakMode === 'enzh') ? firstMeaning(meaning, zhReadAll) : '';
  const wantZh = !!zhText;
  const zhAfterEach = wantZh && !brainwash;
  const zhAtEnd = wantZh && brainwash;

  let count = 0;

  const speakZh = (cb) => {
    const z = new SpeechSynthesisUtterance(zhText);
    z.lang = 'zh-CN';
    z.rate = rate;
    z.onend = () => { if (mySeq === speakSeq) cb(); };
    z.onerror = () => { if (mySeq === speakSeq) cb(); };
    speechSynthesis.speak(z);
  };

  const one = () => {
    if (mySeq !== speakSeq) return;
    if (count >= times) {
      if (zhAtEnd) speakZh(() => { if (mySeq === speakSeq) onfinish && onfinish(); });
      else onfinish && onfinish();
      return;
    }
    count++;
    speakEnglishOnce(word, rate, () => {
      if (mySeq !== speakSeq) return;
      if (zhAfterEach) speakZh(() => setTimeout(one, 200));
      else setTimeout(one, 200);
    }, accent);
  };
  one();

  return () => { if (mySeq === speakSeq) speakSeq++; };
}
