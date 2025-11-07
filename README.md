# 🔍 Information Retrieval System - Correlation-based Fuzzy Model with AI

Web Application สำหรับการค้นหาเอกสารโดยใช้ **Correlation-based Fuzzy Model** ที่ประมวลผลด้วย **AI (Google Gemini หรือ OpenAI GPT-4)**

## ✨ คุณสมบัติ

- 🤖 **ใช้ AI ในการคำนวณ** - ไม่ต้องเขียนโค้ดคำนวณเอง AI จะวิเคราะห์และคำนวณให้
- 📊 **แสดงขั้นตอนทีละขั้น** - เห็นกระบวนการคำนวณทั้งหมดอย่างละเอียด
- 🎯 **Correlation-based Fuzzy Model** - ใช้ Fuzzy Logic และ Index Term Relationship ในการจัดอันดับ
- 🏆 **Ranking System** - จัดอันดับเอกสารที่เกี่ยวข้องมากที่สุด
- 🎨 **UI สวยงาม** - ออกแบบด้วย Modern CSS

## 📋 ขั้นตอนการทำงาน

1. **Correlation Matrix (Index Term Relationship)** - คำนวณค่าความสัมพันธ์ระหว่างคำทุกคู่
2. **Membership Matrix** - คำนวณค่าความเป็นสมาชิกของแต่ละคีย์เวิร์ดในแต่ละเอกสาร
3. **Query Parsing & Fuzzy Logic** - รองรับ AND, OR, NOT และคำนวณตามสูตร Fuzzy Logic
4. **Ranking** - จัดอันดับผลลัพธ์

## 🚀 วิธีใช้งาน

### 1. ขอ API Key (ฟรี!)

#### Google Gemini (แนะนำ)

1. เข้าไปที่: https://makersuite.google.com/app/apikey
2. กดปุ่ม "Create API Key"
3. คัดลอก API Key ที่ได้

#### OpenAI (มีค่าใช้จ่าย)

1. เข้าไปที่: https://platform.openai.com/api-keys
2. กดปุ่ม "Create new secret key"
3. คัดลอก API Key ที่ได้

### 2. เปิดใช้งานเว็บ

1. เปิดไฟล์ `index.html` ในเบราว์เซอร์
2. ใส่ API Key ในช่อง "🔑 ตั้งค่า AI API"
3. กดปุ่ม "บันทึก"

### 3. ค้นหาเอกสาร

1. กรอก query ที่ต้องการ เช่น: `cat, dog, bird`
2. กดปุ่ม "🤖 ค้นหาด้วย AI"
3. รอ AI ประมวลผล (ประมาณ 5-15 วินาที)
4. ดูผลลัพธ์และขั้นตอนการคำนวณ

## 📦 โครงสร้างไฟล์

```
IR/
├── index.html      # หน้าเว็บหลัก
├── styles.css      # CSS สำหรับออกแบบ UI
├── script.js       # JavaScript สำหรับเรียก AI และแสดงผล
└── README.md       # คู่มือการใช้งาน
```

## 🎓 เอกสารในระบบ (ใช้สำหรับทดสอบ)

- **D1:** {bird, cat, bird, cat, dog, dog, bird}
- **D2:** {cat, tiger, cat, dog}
- **D3:** {dog, bird, bird}
- **D4:** {cat, tiger}
- **D5:** {tiger, tiger, dog, tiger, cat}
- **D6:** {cat, cat, tiger, tiger}
- **D7:** {bird, cat, dog}
- **D8:** {dog, cat, bird}
- **D9:** {cat, dog, tiger}
- **D10:** {tiger, cat, tiger}
- **D11:** {cat, cat, dog, tiger}
- **D12:** {bird, bird, cat, tiger, bird}
- **D13:** {dog, dog, cat, cat}
- **D14:** {tiger, tiger, bird, bird}
- **D15:** {cat, dog, bird, tiger, cat, dog}

## 🔧 การตั้งค่า

### เปลี่ยน AI Provider

แก้ไขในไฟล์ `script.js` บรรทัดที่ 3:

```javascript
let AI_PROVIDER = "gemini"; // เลือก: 'gemini', 'openai'
```

### ใส่ API Key โดยตรงในโค้ด (ไม่แนะนำในการใช้งานจริง)

แก้ไขในไฟล์ `script.js` บรรทัดที่ 2:

```javascript
let API_KEY = "ใส่ API Key ของคุณที่นี่";
```

## 🤖 AI Prompt

ระบบจะส่ง Prompt ไปยัง AI ที่มีข้อมูลดังนี้:

- เอกสารทั้งหมดในระบบ (D1-D5)
- Query จาก User (รองรับ AND, OR, NOT)
- คำสั่งให้คำนวณตาม Correlation-based Fuzzy Model
- รูปแบบ JSON ที่ต้องการ

AI จะวิเคราะห์และคำนวณทุกขั้นตอนแทนเรา!

## 📊 ตัวอย่าง Query และผลลัพธ์

### ตัวอย่าง Query ที่รองรับ

- `cat, dog` → (cat OR dog)
- `cat AND dog` → ต้องมีทั้งสองคำ
- `cat AND NOT dog` → มี cat แต่ไม่มี dog
- `(cat OR kitty) AND NOT dog` → มี cat หรือ kitty แต่ไม่มี dog

### ตัวอย่างผลลัพธ์ (เช่น Query: `(cat OR tiger) AND NOT dog`)

```
🥇 #1: D1 (Score: 0.75)
🥈 #2: D3 (Score: 0.67)
🥉 #3: D5 (Score: 0.50)
```

## ⚠️ ข้อควรระวัง

- API Key เป็นข้อมูลสำคัญ อย่าแชร์หรือ commit ขึ้น Git
- Gemini มี Free Tier จำกัดจำนวนครั้ง/วัน
- OpenAI มีค่าใช้จ่ายตามการใช้งาน
- ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อเรียก AI API

## 🎯 Use Case

- 📚 งานนำเสนอ Assignment
- 🎓 เรียนรู้ Information Retrieval
- 🧪 ทดลอง Fuzzy Model
- 🤖 ศึกษาการใช้งาน AI API

## 📝 Assignment Requirements

✅ ใช้ 4 คนต่อ 1 กลุ่ม  
✅ มีเนื้อหาที่ต้องมี (ตามรูป)  
✅ ใช้ Prompt AI  
✅ ใช้ Correlation-based Fuzzy Model  
✅ แสดงการคำนวณทีละขั้น  
✅ สร้าง Ranking จาก Query

## 🌟 Credit

- Information Retrieval Course
- Google Gemini API
- OpenAI API
- Modern Web Technologies

---
