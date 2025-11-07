// ===== การตั้งค่า AI API =====
// ใส่ API Key ของคุณที่นี่
let API_KEY = ""; // ใส่ Gemini API Key
let AI_PROVIDER = "gemini"; // เลือก: 'gemini', 'openai', 'claude'

// ฟังก์ชันบันทึก API Key
function saveAPIKey() {
  const apiKey = document.getElementById("apiKeyInput").value.trim();
  const statusDiv = document.getElementById("apiStatus");

  if (!apiKey) {
    statusDiv.className = "api-status error";
    statusDiv.textContent = "❌ กรุณาใส่ API Key";
    return;
  }

  API_KEY = apiKey;
  statusDiv.className = "api-status success";
  statusDiv.textContent = "✅ บันทึก API Key เรียบร้อย! พร้อมใช้งาน AI";

  // ซ่อน API Key
  document.getElementById("apiKeyInput").value = "••••••••••••";
}

// ฟังก์ชันเปลี่ยน AI Provider
function updateAPIProvider() {
  AI_PROVIDER = document.getElementById("aiProvider").value;
  document.getElementById("apiKeyInput").value = "";
  document.getElementById("apiStatus").textContent = "";
  API_KEY = "";
}

// เอกสารในระบบ
const documents = {
  D1: ["bird", "cat", "bird", "cat", "dog", "dog", "bird"],
  D2: ["cat", "tiger", "cat", "dog"],
  D3: ["dog", "bird", "bird"],
  D4: ["cat", "tiger"],
  D5: ["tiger", "tiger", "dog", "tiger", "cat"],
  D6: ["cat", "cat", "tiger", "tiger"],
  D7: ["bird", "cat", "dog"],
  D8: ["dog", "cat", "bird"],
  D9: ["cat", "dog", "tiger"],
  D10: ["tiger", "cat", "tiger"],
  D11: ["cat", "cat", "dog", "tiger"],
  D12: ["bird", "bird", "cat", "tiger", "bird"],
  D13: ["dog", "dog", "cat", "cat"],
  D14: ["tiger", "tiger", "bird", "bird"],
  D15: ["cat", "dog", "bird", "tiger", "cat", "dog"],
};

// ===== ฟังก์ชันสำหรับเรียก AI API =====

// สร้าง Prompt สำหรับ AI
function createAIPrompt(queryString, documentsData) {
  const prompt = `คุณเป็นผู้เชี่ยวชาญด้าน Information Retrieval โดยใช้ Fuzzy Model แบบ Correlation-based

**เอกสารในระบบ:**
${Object.entries(documentsData)
  .map(([id, terms]) => `${id}: {${terms.join(", ")}}`)
  .join("\n")}

**Query จาก User:** ${queryString}

**คำสั่ง:**
กรุณาวิเคราะห์และคำนวณ Fuzzy Information Retrieval ตามขั้นตอนต่อไปนี้ และส่งคำตอบเป็น JSON format:

**ขั้นตอนที่ 1: สร้าง Correlation Matrix (Index Term Relationship)**
คำนวณค่า c(i,j) สำหรับทุกคู่คีย์เวิร์ด โดยใช้สูตร:
c(i,j) = n(i,j) / (n(i) + n(j) - n(i,j))
โดยที่:
- n(i,j) = จำนวนเอกสารที่มีทั้งคำ i และ j
- n(i) = จำนวนเอกสารที่มีคำ i
- n(j) = จำนวนเอกสารที่มีคำ j

**ขั้นตอนที่ 2: สร้าง Membership Matrix**
คำนวณค่า μ(k,d) สำหรับแต่ละคีย์เวิร์ด k ในแต่ละเอกสาร d ตามขั้นตอน:
1. ถ้าคำ k ปรากฏในเอกสาร d → μ(k,d) = 1
2. ถ้าคำ k ไม่ปรากฏ แต่มีคำอื่นที่สัมพันธ์กับ k → ใช้ค่า c(i,j) ที่สูงที่สุด
3. ถ้าไม่มีคำที่เกี่ยวข้องเลย → μ(k,d) = 0

**ขั้นตอนที่ 3: แยก Query และคำนวณตามตรรกะ**
Parse query ที่อาจมี AND, OR, NOT เช่น:
- "cat, dog" = (cat OR dog)
- "cat AND dog" = (cat AND dog)
- "cat AND NOT dog" = (cat AND NOT dog)
- "(cat OR tiger) AND NOT dog" = fuzzy logic combination

ใช้สูตร Fuzzy Logic:
- μ_NOT(x) = 1 - μ(x)
- μ_AND(x,y) = μ(x) × μ(y)
- μ_OR(x,y) = 1 - (1 - μ(x)) × (1 - μ(y))

**ขั้นตอนที่ 4: จัดอันดับ**
เรียงลำดับเอกสารตามคะแนนจากมากไปน้อย

**รูปแบบ JSON ที่ต้องการ:**
{
  "allTerms": ["bird", "cat", "dog", "tiger"],
  "queryParsed": {
    "original": "${queryString}",
    "structure": "(cat OR tiger) AND NOT dog",
    "terms": ["cat", "tiger", "dog"],
    "operators": ["OR", "AND", "NOT"]
  },
  "termCounts": {
    "bird": 5,
    "cat": 7,
    "dog": 6,
    "tiger": 4
  },
  "correlationMatrix": {
    "bird": {"bird": 1.00, "cat": 0.67, "dog": 0.00, "tiger": 0.25},
    "cat": {"bird": 0.67, "cat": 1.00, "dog": 0.25, "tiger": 0.50},
    "dog": {"bird": 0.00, "cat": 0.25, "dog": 1.00, "tiger": 0.25},
    "tiger": {"bird": 0.25, "cat": 0.50, "dog": 0.25, "tiger": 1.00}
  },
  "membershipMatrix": {
    "D1": {"bird": 1.00, "cat": 1.00, "dog": 1.00, "tiger": 0.50},
    "D2": {"bird": 0.67, "cat": 1.00, "dog": 1.00, "tiger": 1.00},
    "D3": {"bird": 1.00, "cat": 1.00, "dog": 0.00, "tiger": 0.25}
  },
  "calculations": {
    "D1": {
      "steps": [
        "μ_cat(D1) = 1.00",
        "μ_tiger(D1) = 1.00",
        "μ_dog(D1) = 0.25",
        "(cat OR tiger) = 1 - (1-1.00)×(1-1.00) = 1.00",
        "NOT dog = 1 - 0.25 = 0.75",
        "Final = 1.00 × 0.75 = 0.75"
      ],
      "finalScore": 0.75
    }
  },
  "ranking": [
    {"docId": "D1", "score": 0.75},
    {"docId": "D3", "score": 0.67},
    {"docId": "D5", "score": 0.50}
  ]
}

**หมายเหตุ:**
- ให้คำนวณตามสูตรที่กำหนดอย่างละเอียด
- แสดงขั้นตอนการคำนวณให้ชัดเจนในแต่ละเอกสาร
- ส่งคำตอบเป็น JSON เท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม
- คำนวณให้ถูกต้องแม่นยำตามข้อมูลที่มีอยู่`;

  return prompt;
}

// เรียก Gemini API
async function callGeminiAPI(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8000,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "เกิดข้อผิดพลาดในการเรียก API");
  }

  // ตรวจสอบว่ามี candidates และ content หรือไม่
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("AI ไม่ได้ส่งคำตอบกลับมา กรุณาลองใหม่อีกครั้ง");
  }

  const candidate = data.candidates[0];

  if (
    !candidate.content ||
    !candidate.content.parts ||
    candidate.content.parts.length === 0
  ) {
    throw new Error("AI ส่งคำตอบที่ไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง");
  }

  const textResponse = candidate.content.parts[0].text;

  // ดึง JSON ออกจาก response
  const jsonMatch =
    textResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
    textResponse.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("Raw AI Response:", textResponse);
    throw new Error(
      "ไม่สามารถแปลง response เป็น JSON ได้ กรุณาลองใหม่ หรือเปลี่ยน query"
    );
  }

  try {
    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } catch (parseError) {
    console.error("JSON Parse Error:", parseError);
    console.error("Attempted to parse:", jsonMatch[1] || jsonMatch[0]);
    throw new Error("ข้อมูลจาก AI ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
  }
}

// เรียก OpenAI API (ถ้าต้องการใช้)
async function callOpenAIAPI(prompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "เกิดข้อผิดพลาดในการเรียก API");
  }

  return JSON.parse(data.choices[0].message.content);
}

// เรียก AI API ตาม provider ที่เลือก
async function callAI(prompt) {
  if (!API_KEY) {
    throw new Error("กรุณาใส่ API Key ใน script.js");
  }

  if (AI_PROVIDER === "gemini") {
    return await callGeminiAPI(prompt);
  } else if (AI_PROVIDER === "openai") {
    return await callOpenAIAPI(prompt);
  } else {
    throw new Error("ยังไม่รองรับ AI Provider นี้");
  }
}

// ===== ฟังก์ชันแสดงผลข้อมูล =====

// ฟังก์ชันแสดง Correlation Matrix
function displayCorrelationMatrix(correlationMatrix, allTerms) {
  let html = "<table><thead><tr><th></th>";
  allTerms.forEach((term) => {
    html += `<th><strong>${term}</strong></th>`;
  });
  html += "</tr></thead><tbody>";

  allTerms.forEach((term1) => {
    html += `<tr><td><strong>${term1}</strong></td>`;
    allTerms.forEach((term2) => {
      const value = correlationMatrix[term1][term2];
      const color =
        value === 1.0
          ? "#d4edda"
          : value >= 0.5
          ? "#fff3cd"
          : value > 0
          ? "#f8d7da"
          : "#f0f0f0";
      html += `<td style="background-color: ${color}"><strong>${value.toFixed(
        2
      )}</strong></td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  html += `<div class="formula"><strong>🤖 สูตร:</strong> c(i,j) = n(i,j) / (n(i) + n(j) - n(i,j))<br>
  <strong>คำอธิบาย:</strong> ค่าความสัมพันธ์ระหว่างคำ (1.00 = เหมือนกัน, 0.00 = ไม่เกี่ยวข้อง)</div>`;
  return html;
}

// ฟังก์ชันแสดง Membership Matrix
function displayMembershipMatrix(membershipMatrix, queryTerms, allTerms) {
  const docIds = Object.keys(documents);
  const relevantTerms = allTerms.filter(
    (term) =>
      queryTerms.includes(term) || queryTerms.some((qt) => qt.includes(term))
  );

  let html = "<table><thead><tr><th>Document</th>";
  relevantTerms.forEach((term) => {
    const isInQuery =
      queryTerms.includes(term) || queryTerms.some((qt) => qt.includes(term));
    html += `<th style="background-color: ${
      isInQuery ? "#764ba2" : ""
    }"><strong>${term}</strong></th>`;
  });
  html += "</tr></thead><tbody>";

  docIds.forEach((docId) => {
    html += `<tr><td><strong>${docId}</strong></td>`;
    relevantTerms.forEach((term) => {
      const value = membershipMatrix[docId][term];
      const color =
        value === 1.0
          ? "#d4edda"
          : value >= 0.5
          ? "#fff3cd"
          : value > 0
          ? "#f8d7da"
          : "#f0f0f0";
      html += `<td style="background-color: ${color}"><strong>${value.toFixed(
        2
      )}</strong></td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  html += `<div class="formula"><strong>🤖 คำอธิบาย:</strong> μ(k,d) = ค่าความเป็นสมาชิกของคำ k ในเอกสาร d<br>
  <strong>กฎ:</strong> ถ้ามีคำ = 1.00, ถ้าไม่มีแต่มีคำที่สัมพันธ์ = ใช้ค่า c(i,j) สูงสุด, ถ้าไม่เกี่ยวข้อง = 0.00</div>`;
  return html;
}

// ฟังก์ชันแสดง Query Structure
function displayQueryStructure(queryParsed) {
  let html = `<div class="formula">
    <strong>Query ต้นฉบับ:</strong> ${queryParsed.original}<br>
    <strong>โครงสร้าง:</strong> ${queryParsed.structure}<br>
    <strong>คำที่เกี่ยวข้อง:</strong> [${queryParsed.terms.join(", ")}]<br>
    <strong>Operators:</strong> ${queryParsed.operators.join(", ")}
  </div>`;

  html += `<div class="formula">
    <strong>🤖 Fuzzy Logic Rules:</strong><br>
    • μ<sub>NOT</sub>(x) = 1 - μ(x)<br>
    • μ<sub>AND</sub>(x,y) = μ(x) × μ(y)<br>
    • μ<sub>OR</sub>(x,y) = 1 - (1 - μ(x)) × (1 - μ(y))
  </div>`;

  return html;
}

// ฟังก์ชันแสดงการคำนวณ Fuzzy Logic
function displayFuzzyCalculation(aiData) {
  const docIds = Object.keys(documents);
  let html =
    '<div class="formula"><strong>🤖 AI คำนวณตาม Query Structure โดยใช้ Fuzzy Logic</strong></div>';

  docIds.forEach((docId) => {
    const calc = aiData.calculations[docId];
    if (!calc) return;

    html += `<div class="calculation-step">
            <h4>${docId}: {${documents[docId].join(", ")}}</h4>
            <div class="calculation-detail" style="overflow-x: auto; max-width: 100%;">`;

    // แสดงขั้นตอนการคำนวณ
    if (calc.steps && Array.isArray(calc.steps)) {
      html += '<ol style="word-wrap: break-word; overflow-wrap: break-word;">';
      calc.steps.forEach((step) => {
        // แทนที่เครื่องหมายคูณและลบด้วยสัญลักษณ์ที่อ่านง่ายกว่า
        const formattedStep = step
          .replace(/×/g, " × ")
          .replace(/\(/g, " (")
          .replace(/\)/g, ") ");
        html += `<li style="margin-bottom: 8px; line-height: 1.6;">${formattedStep}</li>`;
      });
      html += "</ol>";
    } else if (calc.details) {
      html += `<div style="word-wrap: break-word; overflow-wrap: break-word;">${calc.details}</div>`;
    }

    html += `<br><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; padding: 12px; border-radius: 8px; text-align: center; 
                font-size: 1.1em; margin-top: 10px;">
                <strong>📊 Final Score = ${calc.finalScore.toFixed(4)}</strong>
             </div>`;
    html += `</div></div>`;
  });

  return html;
}

// ฟังก์ชันแสดง Ranking
function displayRanking(aiData) {
  const sorted = aiData.ranking || [];

  let html = "";

  if (sorted.length === 0) {
    html = '<div class="formula">❌ ไม่พบเอกสารที่เกี่ยวข้องกับ query</div>';
  } else {
    sorted.forEach((item, index) => {
      const rankClass =
        index === 0
          ? "rank-1"
          : index === 1
          ? "rank-2"
          : index === 2
          ? "rank-3"
          : "";
      const medal =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";

      html += `<div class="ranking-item ${rankClass}">
                <div class="rank-badge">${medal} #${index + 1}</div>
                <div class="doc-info">
                    <div class="doc-name">${item.docId}</div>
                    <div class="doc-content">{${documents[item.docId].join(
                      ", "
                    )}}</div>
                </div>
                <div class="score">${item.score.toFixed(4)}</div>
            </div>`;
    });
  }

  html +=
    '<div class="formula"><strong>🤖 AI Analysis:</strong> Ranking จัดโดย AI ตาม Fuzzy Similarity Score</div>';
  return html;
}

// ฟังก์ชันหลักในการประมวลผล Query ด้วย AI
async function processQuery() {
  const queryInput = document.getElementById("queryInput").value.trim();

  if (!queryInput) {
    alert("กรุณาใส่ query ที่ต้องการค้นหา");
    return;
  }

  // แสดง Loading
  const resultsDiv = document.getElementById("results");
  resultsDiv.style.display = "block";
  resultsDiv.innerHTML =
    '<div class="formula" style="text-align: center; padding: 40px;"><h2>🤖 AI กำลังประมวลผล Fuzzy Model...</h2><p>กำลังคำนวณ Correlation Matrix และ Membership Values</p></div>';
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    // สร้าง Prompt และเรียก AI
    const prompt = createAIPrompt(queryInput, documents);
    const aiResponse = await callAI(prompt);

    // แยก query terms สำหรับแสดงผล
    const queryTerms = aiResponse.queryParsed.terms || [];

    // แสดงผลแต่ละขั้นตอน
    resultsDiv.innerHTML = `
      <!-- Query Structure -->
      <div class="step-section highlight">
        <h2>� Query Analysis</h2>
        <p class="description">วิเคราะห์โครงสร้าง Query และระบุ Operators (คำนวณโดย AI)</p>
        <div id="queryStructure"></div>
      </div>

      <!-- Step 1: Correlation Matrix -->
      <div class="step-section">
        <h2>� ขั้นตอนที่ 1: Correlation Matrix (Index Term Relationship)</h2>
        <p class="description">คำนวณค่าความสัมพันธ์ระหว่างคำ c(i,j) ด้วยสูตร: n(i,j) / (n(i) + n(j) - n(i,j)) (คำนวณโดย AI)</p>
        <div id="correlationMatrix"></div>
      </div>

      <!-- Step 2: Membership Matrix -->
      <div class="step-section">
        <h2>🎯 ขั้นตอนที่ 2: Membership Matrix</h2>
        <p class="description">คำนวณค่า μ(k,d) สำหรับแต่ละคีย์เวิร์ดในแต่ละเอกสาร (คำนวณโดย AI)</p>
        <div id="membershipMatrix"></div>
      </div>

      <!-- Step 3: Fuzzy Logic Calculation -->
      <div class="step-section">
        <h2>� ขั้นตอนที่ 3: Fuzzy Logic Calculation</h2>
        <p class="description">คำนวณตาม Query Structure โดยใช้ Fuzzy AND, OR, NOT (คำนวณโดย AI)</p>
        <div id="fuzzyCalculation"></div>
      </div>

      <!-- Step 4: Final Ranking -->
      <div class="step-section highlight">
        <h2>🏆 ขั้นตอนที่ 4: Ranking ผลลัพธ์</h2>
        <p class="description">เรียงลำดับเอกสารตามคะแนนความเกี่ยวข้องจากมากไปน้อย (จัดอันดับโดย AI)</p>
        <div id="ranking"></div>
      </div>
    `;

    // แสดงผลลัพธ์จาก AI
    document.getElementById("queryStructure").innerHTML = displayQueryStructure(
      aiResponse.queryParsed
    );
    document.getElementById("correlationMatrix").innerHTML =
      displayCorrelationMatrix(
        aiResponse.correlationMatrix,
        aiResponse.allTerms
      );
    document.getElementById("membershipMatrix").innerHTML =
      displayMembershipMatrix(
        aiResponse.membershipMatrix,
        queryTerms,
        aiResponse.allTerms
      );
    document.getElementById("fuzzyCalculation").innerHTML =
      displayFuzzyCalculation(aiResponse);
    document.getElementById("ranking").innerHTML = displayRanking(aiResponse);
  } catch (error) {
    console.error("Error:", error);
    resultsDiv.innerHTML = `
      <div class="formula" style="background: #f8d7da; color: #721c24; border-left-color: #f5c6cb;">
        <h3>❌ เกิดข้อผิดพลาด</h3>
        <p><strong>ข้อความ:</strong> ${error.message}</p>
        <p><strong>แนะนำ:</strong></p>
        <ul>
          <li>ตรวจสอบว่าใส่ API Key แล้วหรือยัง (กดปุ่ม "บันทึก API Key")</li>
          <li>ตรวจสอบว่า API Key ถูกต้องและยังใช้งานได้</li>
          <li>ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</li>
          <li>ลอง refresh หน้าเว็บและทำใหม่อีกครั้ง</li>
          <li>ลองใช้ query ที่ง่ายกว่า เช่น "cat, dog"</li>
        </ul>
        <p><strong>ตัวอย่าง Query ที่รองรับ:</strong></p>
        <ul>
          <li><code>cat, dog</code> → (cat OR dog)</li>
          <li><code>(cat OR tiger) AND NOT dog</code> → Fuzzy logic combination</li>
          <li><code>bird AND cat</code> → ต้องมีทั้ง bird และ cat</li>
        </ul>
        <p><strong>วิธีขอ API Key:</strong></p>
        <ul>
          <li><strong>Gemini:</strong> <a href="https://makersuite.google.com/app/apikey" target="_blank">https://makersuite.google.com/app/apikey</a></li>
          <li><strong>OpenAI:</strong> <a href="https://platform.openai.com/api-keys" target="_blank">https://platform.openai.com/api-keys</a></li>
        </ul>
      </div>
    `;
  }
}

// เพิ่ม Event Listener สำหรับกด Enter
document.addEventListener("DOMContentLoaded", function () {
  const queryInput = document.getElementById("queryInput");
  queryInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      processQuery();
    }
  });
});
