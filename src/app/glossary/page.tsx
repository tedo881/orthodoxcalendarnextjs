import { ReadingHtml } from "@/components/Reading";

export const metadata = { title: "მცირე განმარტებანი — საეკლესიო კალენდარი" };

const ENTRIES = [
  {
    term: "მარხვა",
    html: "მოკლე ან გრძელვადიანი თავშეკავება ყველანაირი ან ზოგიერთი საკვებისაგან; თავშეკავება, რომელიც ეკლესიამ სხვადასხვა დღეებში, სხვადასხვა სიმკაცრით დააწესა.",
    color: "var(--ink)",
  },
  {
    term: "მსგეფსი",
    html: "ძველ ქართულად ნიშნავს შვიდეულს, კვირას. მაგრამ ეკლესიურად მსგეფსებად მხოლოდ ის შვიდეულები იწოდება, როდესაც ოთხშაბათი-პარასკევი მარხვა არ არის.",
    color: "var(--feast)",
  },
  {
    term: "ყველიერი",
    html: "დიდი მარხვის წინა კვირა. ამ კვირის განმავლობაში ყოველ დღე, ოთხშაბათ-პარასკევის ჩათვლით, დაშვებულია ნებისმიერი საკვები ხორცეულის გარდა (სამარხვო საკვებთან ერთად დაშვებულია რძის ნაწარმი, კვერცხი, თევზეული).",
    color: "var(--fastfree)",
  },
];

export default function GlossaryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-center font-[family-name:var(--font-ucnobi)] text-3xl sm:text-4xl">
        მცირე განმარტებანი
      </h1>

      <div className="card flex items-center gap-3 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/fish3.png" alt="" className="h-6 w-6" />
        <p>მოცემული მარხვის დღე თევზით ხსნილია.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ENTRIES.map((entry) => (
          <section key={entry.term} className="card p-5">
            <h2 className="font-[family-name:var(--font-ucnobi)] text-2xl" style={{ color: entry.color }}>
              {entry.term}
            </h2>
            <ReadingHtml className="mt-2" html={entry.html} />
          </section>
        ))}
      </div>
    </div>
  );
}
