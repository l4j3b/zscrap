import { CardHeader, CardTitle, CardContent } from '~/components/ui/card';

export default function AdminTestsSandBox() {
  return (
    <>
      <div>
        <CardHeader>
          <CardTitle>Sandbox</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              animate-gradient bg-gradient-to-tr from-violet-500 via-pink-400 to-orange-300
              bg-clip-text text-transparent
              bg-[length:200%_1000%]
            `}
            style={{
              overflow: 'visible',
              fontSize: '8rem',
              lineHeight: '1',
              verticalAlign: 'middle',
              paddingTop: '0.06em',
              textAlign: 'center',
            }}
          >
            &#11035;&#11035;&#11035;
            <br />
            &#11035;&#11035;&#11035;
            <br />
            &#11035;&#11035;&#11035;
          </div>

          <div
            className={`
              animate-gradient bg-gradient-to-tr from-violet-500 via-pink-400 to-orange-300
              bg-clip-text text-transparent
              bg-[length:200%_1000%]
            `}
            style={{
              overflow: 'visible',
              fontSize: '8rem',
              lineHeight: '1',
              verticalAlign: 'middle',
              paddingTop: '0.06em',
              textAlign: 'center',
            }}
          >
            <div>&#11035;&#11035;&#11035;&#11035;</div>
            <div>&#11035;&#11035;&#11035;&#11035;</div>
            <div>&#11035;&#11035;&#11035;&#11035;</div>
            <div>&#11035;&#11035;&#11035;&#11035;</div>
          </div>
        </CardContent>
      </div>
    </>
  );
}
