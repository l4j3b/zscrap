import { AppLoadContext } from '@remix-run/cloudflare';
import { z } from 'zod';

import { askGPT } from './ask-gpt';
import { scrapProductUrl } from './scrap-product-url';

const prompt = `
Extract relevant product information from the following content.

I want to retrieve:
- title, description, price
- product image url
- brand, category, model
- a list of the best possible tags you can come up to (max 10)

Please output the data in JSON format (only the JSON, nothing else).
{
"title": "Product Title",
"description": "Product Description",
"price": "Product Price",
"imageUrl": "Product Image URL",
"brand": "Product Brand",
"category": "Product Category",
"model": "Product Model",
"tags": ["tag1", "tag2"]
}

If the url does not point to a 'product', please return: {}
`;

const schema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.string(),
  imageUrl: z.string(),
  brand: z.string(),
  category: z.string(),
  model: z.string(),
  tags: z.array(z.string()),
});

export async function analyzeProductUrl(url: string, context: AppLoadContext) {
  // Fetch URL content
  const { title, description, imageUrl, price, content } = await scrapProductUrl(url);

  const initialData = {
    title,
    description,
    imageUrl,
    price,
  };

  const openAIData = await askGPT({
    apiKey: context.cloudflare.env.OPENAI_API_KEY,
    content,
    prompt,
  });

  // Parse data
  const parsedData = schema.parse(JSON.parse(openAIData));

  // Merge initial data with OpenAI (initial data takes precedence)
  const data = Object.assign(parsedData, initialData);

  return {
    data,
    initialData,
    openAIData,
  };
}
