import Grid from '~/components/app/PixelGrid';
import { CardHeader, CardTitle, CardContent, CardDescription } from '~/components/ui/card';

export default function Route() {
  return (
    <div>
      <CardHeader>
        <CardTitle>Pixel builder</CardTitle>
        <CardDescription>
          Little{' '}
          <a href="https://github.com/pmndrs/leva" target="_blank" rel="noreferrer">
            Leva
          </a>{' '}
          experiment. Also showing how to use the card layout without styling.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Grid />
      </CardContent>
    </div>
  );
}
