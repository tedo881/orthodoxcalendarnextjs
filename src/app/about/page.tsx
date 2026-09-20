export const metadata = { title: "კონტაქტი — საეკლესიო კალენდარი" };

export default function AboutPage() {
  return (
    <article className="card mx-auto max-w-3xl space-y-4 p-6 sm:p-8">
      <h1 className="font-[family-name:var(--font-ucnobi)] text-3xl">
        კონტაქტი
      </h1>
      <p>
        გამოყენებული მასალა: „წმიდანთა ცხოვრება“, ტომი I–IV, თბილისი, 2001–2003
        წწ. ყოველდღიური სახარებისა და სამოციქულოს საკითხავების მითითებები
        აღებულია წიგნიდან „საქართველოს ეკლესიის კალენდარი“, რომელიც მომზადებულია
        საქართველოს საპატრიარქოს გამომცემლობისა და რეცენზირების დეპარტამენტთან
        არსებულ საეკლესიო კალენდრის რედაქციაში.
      </p>
      <p>
        შენიშვნების, რჩევების ან სხვა წინადადების შემთხვევაში დაგვიკავშირდით:{" "}
        <a className="underline" href="mailto:tedo881@gmail.com">
          tedo881@gmail.com
        </a>
      </p>
    </article>
  );
}
