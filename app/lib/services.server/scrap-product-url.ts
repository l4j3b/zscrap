import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapProductUrl(url: string) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // Remove styles and scripts
  $('script, style').remove();

  const title = $('title').text() || $("meta[name='title']").attr('content');
  const description = $("meta[name='description']").attr('content');
  const imageUrl = $("meta[property='og:image']").attr('content');
  const price = $("meta[property='product:price:amount']").attr('content');

  // Keep only the text content
  const content = $('body').text().replace(/\s+/g, ' ').trim();

  return {
    title,
    description,
    imageUrl,
    price,
    content,
  };
}
