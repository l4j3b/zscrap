import * as cheerio from 'cheerio';

export async function extractBodyText(html: string) {
  const $ = cheerio.load(html);
  $('script, style').remove();

  const title = $('title').text();
  const content = $('body').text();

  return {
    title,
    content,
  };
}
