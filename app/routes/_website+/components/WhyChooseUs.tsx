import { Puzzle, Code2, MessageCircle, Layers, Coins } from 'lucide-react';
import { MdBrowserNotSupported } from 'react-icons/md';

import { Logo } from '~/components/app/Logo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';

const features = [
  {
    title: 'No Extensions Needed',
    description:
      'Unlike other tools that rely on browser extensions or manual clicks, just provide the URL and your instructions.',
    icon: MdBrowserNotSupported,
  },
  {
    title: 'Flexible & Robust',
    description:
      'Forget hardcoding selectors. Our AI adapts to any content changes on the page, so your scrapers are less likely to break. Your scraper can now work on multiple websites.',
    icon: Puzzle,
  },
  {
    title: 'API Access',
    description:
      'Integrate with our API to automate scraping at scale or build scrapers on the fly.',
    icon: Code2,
  },
  {
    title: 'Natural Language Processing',
    description:
      'Create a scraper by simply describing what you need in plain English. No more complex setup.',
    icon: MessageCircle,
  },
  {
    title: 'Batch Processing',
    description: 'Process multiple URLs at once, saving time and effort.',
    icon: Layers,
  },
  {
    title: 'Flexible Pricing',
    description: 'No annoying subscriptions. Pay as you go.',
    icon: Coins,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24">
      <div className="container mx-auto">
        <h2 className="mb-20 text-center text-3xl font-bold">
          Why use <Logo className="items-end" />?
        </h2>
        <div
          className={`
            grid grid-cols-1 gap-8
            lg:grid-cols-3
            sm:grid-cols-2
          `}
        >
          {features.map((feature, index) => (
            <Card key={index} className={`border-border bg-muted/60 backdrop-blur transition-all`}>
              <CardHeader className="flex flex-row items-center justify-start gap-4 text-foreground">
                <feature.icon className="size-6" />
                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
