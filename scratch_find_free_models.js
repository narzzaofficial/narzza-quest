const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Xia Xia\\.gemini\\antigravity-ide\\brain\\a9242a09-fbe7-4ff0-ba31-bea503cdaf64\\.system_generated\\steps\\355\\content.md', 'utf-8');
const jsonStr = content.split('---')[1].trim();
try {
    const data = JSON.parse(jsonStr).data;
    const freeModels = data.filter(m => m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0");
    console.log("FREE MODELS:");
    freeModels.forEach(m => console.log(m.id));
} catch (e) {
    console.error("Parse error", e);
}
