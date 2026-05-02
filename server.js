import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { nanoid } from "nanoid";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const data = {};

function createCode(){
  return nanoid(8).toUpperCase();
}

// 🧠 CHAT
app.post("/chat", async (req,res)=>{
  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: req.body.message
    });

    res.json({
      reply: response.output_text || "No response"
    });

  } catch(err){
    console.log(err);
    res.json({ reply: "שגיאה בצ'אט" });
  }
});

// 🎨 IMAGE
app.post("/image", async (req,res)=>{
  try {
    const img = await openai.images.generate({
      model: "gpt-image-1",
      prompt: req.body.prompt,
      size: "1024x1024"
    });

    const code = createCode();

    data[code] = img.data[0].b64_json;

    res.json({
      message: "☕ chat gptea יצר תמונה!",
      code: code
    });

  } catch(err){
    console.log(err);
    res.json({ message: "שגיאה ביצירת תמונה" });
  }
});

// 📦 GET IMAGE BY CODE
app.get("/:code",(req,res)=>{
  const img = data[req.params.code];

  if(!img){
    return res.json({ error: "לא נמצא קוד" });
  }

  res.json({ image: img });
});

app.listen(3000, ()=>{
  console.log("chat gptea server running 🚀");
});
