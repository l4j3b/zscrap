import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { AppLoadContext } from '@remix-run/cloudflare';
import { inArray } from 'drizzle-orm';
// import pLimit from 'p-limit';

import { scraperUrlsTable } from 'drizzle/schema';

const initializeSQSClient = (context: AppLoadContext) => {
  return new SQSClient({
    region: context.cloudflare.env.AWS_REGION,
    credentials: {
      accessKeyId: context.cloudflare.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: context.cloudflare.env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

export async function sendScraperUrlsToSQS(
  scraperUrlIds: string[],
  context: AppLoadContext,
): Promise<void> {
  // Fetch the scraper URLs and their associated scraper data
  const scraperUrls = await context.db.query.scraperUrlsTable.findMany({
    where: inArray(scraperUrlsTable.id, scraperUrlIds),
    with: {
      scraper: true,
    },
  });

  const sqsClient = initializeSQSClient(context);

  // Prepare messages for SQS
  const messages = scraperUrls.map((scraperUrl) => ({
    Id: scraperUrl.id,
    MessageBody: JSON.stringify({
      url: scraperUrl.url,
      prompt: scraperUrl.scraper.prompt,
      scraperUrlId: scraperUrl.id,
    }),
  }));

  // Send messages to SQS in batches of up to 10
  // const batchSize = 5;
  // const promises = [];
  // const limit = pLimit(5);

  const params = {
    QueueUrl: context.cloudflare.env.SCRAPER_SQS_QUEUE_URL,
    Entries: messages,
  };

  await sqsClient.send(new SendMessageBatchCommand(params)).then((result) => {
    if (result.Failed && result.Failed.length > 0) {
      console.error('Failed to send messages:', result.Failed);
    }
  });

  // for (let i = 0; i < messages.length; i += batchSize) {
  //   const batch = messages.slice(i, i + batchSize);

  //   const params = {
  //     QueueUrl: context.cloudflare.env.SCRAPER_SQS_QUEUE_URL,
  //     Entries: batch,
  //   };

  //   const promise = limit(() =>
  //     sqsClient.send(new SendMessageBatchCommand(params)).then((result) => {
  //       if (result.Failed && result.Failed.length > 0) {
  //         console.error('Failed to send messages:', result.Failed);
  //       }
  //     }),
  //   );

  //   promises.push(promise);
  // }

  // await Promise.all(promises);
}
