import { RotateCw } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { SectionHeader, SectionTitle } from '~/components/ui/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default function AdminTestsSandBox() {
  return (
    <>
      <SectionHeader>
        <SectionTitle>UI Components</SectionTitle>
      </SectionHeader>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <p className="text-lg font-bold text-muted-foreground">Variants:</p>

            <div className="space-x-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>

              <Button variant="link">Link</Button>
              <Button variant="ghost">Ghost</Button>
            </div>

            <p className="text-lg font-bold text-muted-foreground">Disabled:</p>

            <div className="space-x-4">
              <Button disabled>Primary</Button>
              <Button disabled variant="secondary">
                Secondary
              </Button>
              <Button disabled variant="outline">
                Outline
              </Button>
              <Button disabled variant="destructive">
                Destructive
              </Button>
              <Button disabled variant="link">
                Link
              </Button>
              <Button disabled variant="ghost">
                Ghost
              </Button>
            </div>

            <p className="text-lg font-bold text-muted-foreground">Loading:</p>

            <div className="space-x-4">
              <Button loading>Primary</Button>
              <Button loading variant="secondary">
                Secondary
              </Button>
              <Button loading variant="outline">
                Outline
              </Button>
              <Button loading variant="destructive">
                Destructive
              </Button>
              <Button loading variant="link">
                Link
              </Button>
              <Button loading variant="ghost">
                Ghost
              </Button>
            </div>

            <p className="text-lg font-bold text-muted-foreground">Sizes:</p>

            <div className="space-x-4">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
            </div>

            <p className="text-lg font-bold text-muted-foreground">Icon:</p>

            <div className="space-x-4">
              <Button size="icon">
                <RotateCw className="size-5" />
              </Button>

              <Button variant={'secondary'} size="icon">
                <RotateCw className="size-5" />
              </Button>

              <Button variant={'outline'} size="icon">
                <RotateCw className="size-5" />
              </Button>

              <Button variant={'destructive'} size="icon">
                <RotateCw className="size-5" />
              </Button>

              <Button variant={'link'} size="icon">
                <RotateCw className="size-5" />
              </Button>

              <Button variant={'ghost'} size="icon">
                <RotateCw className="size-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-x-4">
            <Badge>Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Text input" className="w-64" />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-x-4">
            <Tabs defaultValue="account" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="account">Tab_1</TabsTrigger>
                <TabsTrigger value="password">Tab_2</TabsTrigger>
              </TabsList>
              <TabsContent value="account">Content_1</TabsContent>
              <TabsContent value="password">Content_2</TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
