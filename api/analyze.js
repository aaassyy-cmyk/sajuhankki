export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { year, month, day, calLabel, today } = req.body;
  if (!year || !month || !day) return res.status(400).json({ error: '생년월일을 입력해주세요.' });

  const foodList = [
    '삼계탕','부대찌개','떡볶이','순대국밥','짬뽕','닭볶음탕',
    '냉면','콩국수','미역국','해물탕','북엇국','굴국밥',
    '비빔밥','된장찌개','쌈밥','버섯전골','나물밥','청국장',
    '삼겹살','갈비탕','닭가슴살','순두부찌개','감자탕','설렁탕',
    '김치찌개','곰탕','잡채','닭갈비','소고기무국','육개장'
  ].join(', ');

const randomSeed = Math.floor(Math.random() * 1000);
const prompt = `당신은 사주명리학 전문가이자 음식 큐레이터입니다. (seed: ${randomSeed})
아래 생년월일의 사주를 분석하고, 오늘(${today}) 하루의 기운에 맞는 음식 1가지를 추천해주세요.
30개 목록에서 다양하게 골라주세요.
생년월일: ${year}년 ${month}월 ${day}일 (${calLabel})
추천 음식은 아래 목록에서 우선적으로 골라주세요. 목록에 없는 음식이 더 잘 맞는다면 자유롭게 추천해도 좋아요.
[추천 목록]: ${foodList}
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트나 마크다운은 절대 포함하지 마세요.
{
  "ohaeng": ["화","수","목","금","토"] 중 오늘 강하게 작용하는 기운 2~3개 배열,
  "food": "추천 음식 이름 (목록의 이름과 정확히 일치하게)",
  "emoji": "음식에 어울리는 이모지 1개",
  "reason": "오늘의 기운과 음식 추천 이유 (2~3문장, 친근하고 재미있게, 사주 근거 포함)"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: 'API 오류', detail: err });
    }

    const data = await response.json();
    const text = data.content.find(b => b.type === 'text')?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
