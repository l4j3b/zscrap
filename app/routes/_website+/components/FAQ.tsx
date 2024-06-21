import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';

const questions = [
  {
    title: 'What types of websites can I scrape?',
    description:
      'You can scrape almost any publicly available website, as long as it complies with our terms of service and local laws.',
  },
  {
    title: 'Do I need any technical skills to use this tool?',
    description:
      'No technical skills are required. Simply describe what you need using natural language, and our tool will extract the data for you.',
  },
  {
    title: 'How does the pricing work?',
    description:
      'Our pricing is based on pre-bought API credits. You purchase a certain number of credits, and each scrape request deducts credits from your balance. Check our pricing page for more details.',
  },
  {
    title: 'Is there an API?',
    description:
      'Yes, our API allows developers to programmatically interact with our scraping engine. You can integrate scraping directly into your own applications.',
  },
  {
    title: 'Can I process multiple URLs at once?',
    description:
      'Yes, our batch processing feature allows you to scrape data from multiple URLs simultaneously, saving time and effort.',
  },
  {
    title: 'What happens if the scraper fails?',
    description: "If the scraper fails, you won't be charged any credits.",
  },
];

export default function FAQ() {
  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="mb-20 text-center text-3xl font-bold">Frequently Asked Questions</h2>

        <Accordion type="single" collapsible className="w-full">
          {questions.map((question, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{question.title}</AccordionTrigger>
              <AccordionContent>{question.description}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
