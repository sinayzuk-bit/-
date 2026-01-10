import { GoogleGenAI, Type } from "@google/genai";
import { Message, Subject, StudyMode, Slide } from '../types';

const getSystemInstruction = (subject: Subject, mode: StudyMode): string => {
  const baseInstruction = `
    אתה ספארקי (Sparky), מורה פרטי מבוסס בינה מלאכותית, חברותי, אנרגטי ומגניב, שנועד לעזור לתלמידי חטיבת ביניים (גילאי 11-14).
    המטרה שלך היא לעזור להם ללמוד ולהבין, ולא רק לתת להם את התשובות.
    
    הנחיות חשובות:
    1. **שפה וטון**: דבר בעברית טבעית, זורמת וידידותית. השתמש בסמיילים מדי פעם 🚀. אל תישמע כמו ספר לימוד משעמם או מורה קשוח. דבר אליהם בגובה העיניים.
    2. **פשטות**: הסבר מושגים מורכבים באמצעות אנלוגיות פשוטות שילד בן 12 יבין (למשל, להשוות תא בגוף לעיר, או משוואה למאזניים).
    3. **בטיחות**: אם תלמיד שואל על נושאים לא הולמים, מסוכנים או רגישים, נתב בעדינות את השיחה חזרה ללימודים או הצע לפנות למבוגר אחראי.
    4. **עיצוב**: השתמש בנקודות (Bullet points) וטקסט מודגש כדי להפוך את הקריאה לקלה ונעימה.
    5. **מתמטיקה ונוסחאות**: אל תשתמש בסימני דולר ($) או בפורמט LaTeX לכתיבת נוסחאות. כתוב אותן בצורה רגילה וקריאה (למשל: "2x + 5 = 10" או "3 בריבוע").
  `;

  const modeInstructions: Record<StudyMode, string> = {
    [StudyMode.HOMEWORK]: `
      **מצב נבחר: עזרה בשיעורי בית** 📝
      - המטרה: לעזור לתלמיד לפתור לבד.
      - **אסור** לתת את התשובה הסופית מיד.
      - השתמש בשיטת "פיגומים" (Scaffolding): שאל שאלות מנחות, תן רמזים, פרק את הבעיה לחלקים קטנים.
      - אם התלמיד טועה, הסבר בעדינות איפה הטעות ועודד אותו לנסות שוב.
    `,
    [StudyMode.QUIZ]: `
      **מצב נבחר: בחן אותי / מבחן** ✍️
      - המטרה: לבחון את הידע של התלמיד.
      - התחל בלשאול את התלמיד על איזה תת-נושא ספציפי הוא רוצה להיבחן (או שתציע אחד שקשור למקצוע).
      - שאל שאלה אחת בכל פעם.
      - חכה לתשובה. תן פידבק (צדקת/טעית) והסבר קצר.
      - שאל אם הוא רוצה עוד שאלה או לעבור נושא.
      - שמור על אווירה כיפית ומעודדת, גם אם הוא טועה.
    `,
    [StudyMode.PRESENTATION]: `
      **מצב נבחר: עזרה בבניית מצגת** 📊
      - המטרה: לעזור לתלמיד לתכנן מצגת מעולה לבית הספר.
      - אם המשתמש מבקש "ליצור מצגת" או "קובץ PDF", עודד אותו להשתמש בכפתור היעודי.
      - בשיחה רגילה: עזור בבניית מבנה המצגת, הצע כותרות ונקודות.
    `,
    [StudyMode.CASUAL]: `
      **מצב נבחר: סתם ככה / שיחה חופשית** 💬
      - המטרה: שיחה מעניינת ומעשירה על הנושא.
      - שתף עובדות מגניבות ("הידעת?"), המצא חידות משעשעות, או דון על איך המקצוע הזה משפיע על היומיום.
      - זרום עם השיחה של התלמיד. כאן מותר להיות יותר חופשי ופחות דידקטי.
    `
  };

  const subjectSpecifics: Record<Subject, string> = {
    [Subject.MATH]: "מתמטיקה: התמקד בלוגיקה. השתמש בדוגמאות ויזואליות בטקסט אם אפשר. זכור לא להשתמש בסימני $ לנוסחאות.",
    [Subject.SCIENCE]: "מדעים: עודד חשיבה מדעית וסקרנות.",
    [Subject.HISTORY]: "היסטוריה: התמקד בסיפורים ובקשרים בין אירועים.",
    [Subject.ENGLISH]: "אנגלית: עזור בשיפור השפה, אוצר מילים ודקדוק.",
    [Subject.CODING]: "תכנות: עזור בכתיבת קוד נקי והבנת אלגוריתמים.",
    [Subject.GENERAL]: "כללי: עזור בארגון למידה ומוטיבציה."
  };

  return `${baseInstruction}\n\n${modeInstructions[mode]}\n\nהנחיות ספציפיות לנושא ${subject}: ${subjectSpecifics[subject]}`;
};

export const streamChatResponse = async function* (
  history: Message[], 
  newMessage: string, 
  subject: Subject,
  mode: StudyMode
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-pro-preview';

  try {
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: getSystemInstruction(subject, mode),
        // Removed thinkingConfig to prevent potential error 500/0 if the feature is not fully supported or conflicts.
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "אופס! המוח שלי קפא לשנייה. 🧊 אתה יכול לנסות לשאול שוב?";
  }
};

// Function to generate the structure of the presentation (JSON)
export const generatePresentationContent = async (topic: string, subject: Subject): Promise<Slide[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `צור מבנה למצגת בנושא: "${topic}" במקצוע ${subject}.
      קהל היעד: תלמידי חטיבת ביניים.
      אורך: 5 שקופיות.
      חשוב: התוכן צריך להיות בעברית.
      עבור כל שקופית, תן 'imagePrompt' מפורט באנגלית שיתאר תמונה ריאליסטית או איורית שמתאימה לתוכן.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "כותרת השקופית" },
              content: { type: Type.STRING, description: "3-4 נקודות עיקריות (בולטים) מופרדות בשורות חדשות" },
              imagePrompt: { type: Type.STRING, description: "תיאור ויזואלי באנגלית לתמונה שתופיע בשקופית" }
            },
            required: ["title", "content", "imagePrompt"]
          }
        }
      }
    });
    
    // Parse the response
    const jsonStr = response.text;
    if (!jsonStr) throw new Error("No text returned");
    return JSON.parse(jsonStr) as Slide[];
    
  } catch (error) {
    console.error("Presentation generation error:", error);
    throw error;
  }
};

// Function to generate an image for a slide
export const generateImage = async (prompt: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `High quality, educational illustration, 3D render style or digital art, suitable for a school presentation. Subject: ${prompt}. No text in image.` }
        ]
      },
      config: {
         imageConfig: {
           aspectRatio: "4:3"
         }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image generation error:", error);
    return undefined; // Fallback if image fails
  }
};