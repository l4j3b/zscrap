import * as cheerio from 'cheerio';

export function extractBodyText(rawHtml: string) {
  const $ = cheerio.load(rawHtml);

  $('script, style, svg, meta, link').remove();
  // Remove all styles attributes
  $('*').removeAttr('style');

  // Remove all attributes
  $('*').each(function () {
    // iterate over all elements
    $(this).attr('*', '');
  });

  // const title = $('title').text();
  const html = $('body').html()?.replace(/\n/g, '');
  const text = $.text();

  return { html, text };
}
