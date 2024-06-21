import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';

const steps = [
  {
    title: 'Enter URLs',
    description:
      'Submit one or more URLs for processing. No need to inspect the HTML or install extensions.',
  },
  {
    title: 'Describe what you want',
    description:
      'Use natural language to explain what you need. No coding or manual selector setup required.',
  },
  {
    title: 'Get results in a predefined format',
    description: 'Receive the extracted data in JSON or CSV. We can handle the schema for you.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container mx-auto">
        <h2 className="mb-20 text-center text-3xl font-bold">How it works</h2>
        <div
          className={`
            grid grid-cols-1 gap-8
            lg:grid-cols-3
            sm:grid-cols-2
          `}
        >
          {steps.map((step, index) => (
            <Card key={index} className="border-border bg-muted/60 backdrop-blur transition-all">
              <CardHeader className="flex flex-col items-center justify-center text-foreground">
                <CardTitle className="text-lg font-semibold">
                  {index + 1}. {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-lg text-muted-foreground">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
