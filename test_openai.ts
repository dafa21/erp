import OpenAI from "openai";

const openai = new OpenAI();
openai.chat.completions.create({
    model: "gpt-4",
    messages: []
}, {
    body: { asdf: 123 }
});
