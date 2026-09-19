import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

class GeminiService {
  static model = null;

  /* =========================================================
     GET GEMINI MODEL
     ========================================================= */

  static getModel() {
    if (this.model) {
      return this.model;
    }

    const apiKey =
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Gemini API key is missing. Set GOOGLE_API_KEY or GEMINI_API_KEY in server/.env"
      );
    }

    console.log("Initializing Gemini model...");
    console.log(
      "Gemini API key loaded:",
      Boolean(apiKey)
    );

    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      model:
        process.env.GEMINI_MODEL ||
        "gemini-3.5-flash-lite",
      temperature: 0.3,
    });

    return this.model;
  }

  /* =========================================================
     NORMAL GENERATION
     ========================================================= */

  static async generate(
    systemPrompt,
    userPrompt
  ) {
    try {
      const model = this.getModel();

      const response = await model.invoke([
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ]);

      return response.content;
    } catch (error) {
      console.error("========== GEMINI ERROR ==========");
      console.error("Message:", error?.message);
      console.error("Name:", error?.name);
      console.error("Status:", error?.status);
      console.error("Code:", error?.code);
      console.error("Full error:", error);
      console.error("==================================");

      throw error;
    }
  }

  /* =========================================================
     STRUCTURED GENERATION
     ========================================================= */

  static async generateStructured(
    systemPrompt,
    userPrompt,
    schema
  ) {
    try {
      const model = this.getModel();

      console.log(
        "Generating structured Gemini response..."
      );

      const structuredModel =
        model.withStructuredOutput(schema);

      const response =
        await structuredModel.invoke([
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ]);

      console.log(
        "Structured Gemini response generated successfully."
      );

      return response;
    } catch (error) {
      console.error(
        "========== STRUCTURED OUTPUT ERROR =========="
      );

      console.error("Message:", error?.message);
      console.error("Name:", error?.name);
      console.error("Status:", error?.status);
      console.error("Code:", error?.code);

      if (error?.response) {
        console.error(
          "Response:",
          error.response
        );
      }

      console.error("Full error:", error);

      console.error(
        "=============================================="
      );

      /*
       * IMPORTANT:
       * Don't hide the original Gemini error.
       */
      throw error;
    }
  }
}

export default GeminiService;