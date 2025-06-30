const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "translations.master.json");
const outputBase = path.join(__dirname);
const languages = ["en", "ko", "jp"];

const master = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

// 초기 언어별 결과 객체
const result = {
  en: {},
  ko: {},
  jp: {}
};

// 중첩 구조로 변환하는 함수
function insertNested(target, keys, value) {
  let current = target;
  keys.forEach((key, idx) => {
    if (idx === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] = current[key] || {};
      current = current[key];
    }
  });
}

// 키 순회
function traverse(obj, keyPath = []) {
  for (const key in obj) {
    const value = obj[key];
    if (
      typeof value === "object" &&
      value !== null &&
      languages.every((lang) => Object.hasOwn(value, lang))
    ) {
      // 번역 객체 { en: "...", ko: "...", ... }
      languages.forEach((lang) => {
        insertNested(result[lang], [...keyPath, key], value[lang] || "");
      });
    } else {
      // 재귀 탐색
      traverse(value, [...keyPath, key]);
    }
  }
}

traverse(master);

// 디렉토리 생성 + 파일 쓰기
languages.forEach((lang) => {
  const dir = path.join(outputBase, lang);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, "translation.json");
  fs.writeFileSync(filePath, JSON.stringify(result[lang], null, 2), "utf-8");
  console.log(`✅ ${filePath} 생성 완료`);
});
