import {
  AzureKeyCredential,
  TextAnalyticsClient,
  type PiiEntity,
} from "@azure/ai-text-analytics";
import { type NextRequest } from "next/server";
import pdf from "pdf-parse";
import { env } from "~/env.mjs";

// Azure Gov PII Recognition Service: https://learn.microsoft.com/en-us/azure/ai-services/language-service/personally-identifiable-information/overview
// Azure Gov PII Service Security Rules: https://learn.microsoft.com/en-us/legal/cognitive-services/language-service/data-privacy?context=/azure/cognitive-services/language-service/context/context#how-is-data-retained-and-what-customer-controls-are-available
// TLDR: Data is encrypted at rest and in transit, and is not stored for logs, training, or any other purpose

export async function POST(request: NextRequest) {
  // Create a new instance of the TextAnalyticsClient and retrieve the text or file from the request
  const client = new TextAnalyticsClient(
    env.AZURE_ENDPOINT,
    new AzureKeyCredential(env.AZURE_KEY),
  );
  const data = await request.formData();
  const text = data.get("text") as string;
  const file = data.get("file") as File;

  // If request is empty return an error
  if (!text && !file) {
    return Response.json(
      { error: "No text or file provided" },
      { status: 400 },
    );
  }

  let toRedact: string[] = [];
  if (file) {
    const buff = Buffer.from(await file.arrayBuffer());
    const parsed = await pdf(buff);
    toRedact = [parsed.text];
  }
  if (toRedact.length === 0) toRedact = [text];

  // If text is too long split it into multiple requests
  const maxCharacters = 5100;
  const requests = toRedact.flatMap((text) => splitString(text, maxCharacters));

  let redactedText = "";
  for (let i = 0; i < requests.length; i+=4) {
    const result = await client.recognizePiiEntities(requests.slice(i, i+4), "en");
    if (!result) {
      return Response.json(
        { error:  "Unknown error" },
        { status: 500 },
      );
    }
    result.forEach((result) => {
      if (!result.error) {
        redactedText += redactText(result.redactedText, result.entities);
      }
    });

  }  
  

  return Response.json({redacted: redactedText}, { status: 200 });
  // return Response.json("hello", { status: 200 });
}

// The default is to replace PII '*'. However it would be more helpful it we replaced it with the type of PII
// For example My number is 555-555-5555 -> My number is [PhoneNumber]
function redactText(text: string, entities: PiiEntity[]): string {
  const safeCategories = ["Person"]; // We received feedback that names don't need to be redacted if all other PII is redacted
  let redactedText = text;

  // Sort entities in descending order of their offset
  const sortedEntities = entities.sort((a, b) => b.offset - a.offset);

  for (const entity of sortedEntities) {
    const start = entity.offset;
    const end = start + entity.length;
    const category = entity.category;
    redactedText =
      redactedText.substring(0, start) +
      (safeCategories.includes(category) ? entity.text : `[${category}]`)+
      redactedText.substring(end);
  }

  return redactedText;
}

function splitString(input: string, maxLength: number): string[] {
  if (input.length <= maxLength) {
    return [input];
  }

  let currentIndex = maxLength;
  while (currentIndex > 0 && input[currentIndex] !== ".") {
    currentIndex--;
  }

  // If a period wasn't found, we might choose to split at maxLength
  if (currentIndex === 0) {
    return [
      input.substring(0, maxLength),
      ...splitString(input.substring(maxLength), maxLength),
    ];
  }

  // Include the period in the first part of the split string
  return [
    input.substring(0, currentIndex + 1),
    ...splitString(input.substring(currentIndex + 1), maxLength),
  ];
}
