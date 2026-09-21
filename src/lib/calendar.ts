/**
 * Church calendar logic, ported 1:1 from the Android/iOS app.
 * The heavy tables (moving feasts, saints of the day, fasting, icons) are generated
 * from the original Java classes and live in /public/data.
 */

export type Fragment = { kind: "html" | "text"; value: string };

export interface Day {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

export interface FastingInfo {
  out: string;
  fer: number; // -1 fast free, 0 normal, 1 fasting
  tevz: boolean; // fish allowed
  brc: boolean; // feast
}

interface MovingYear {
  atormeta: number[];
  atormetb: number[];
  lista: number[];
  listb: number[];
  listc: number[];
  listd: number[];
  listcxmebi: number[];
  listdxmebi: number[];
  listBeforec: number[];
  listBefored: number[];
  listBeforeFiestc: number[];
  listBeforeFiestd: number[];
}

interface CalendarData {
  strings: string[];
  moving: Record<string, MovingYear>;
  movingTroparions: Record<string, MovingYear>;
  fixed: {
    names: (number | null)[][];
    icons: string[][];
    troparions: (number | null)[][];
    readings: (number | null)[][];
  };
  yearIndicators: Record<string, number[][]>;
}

export interface Saint {
  name: string;
  date: string;
}

const EMPTY_MOVING: MovingYear = {
  atormeta: [], atormetb: [], lista: [], listb: [], listc: [], listd: [],
  listcxmebi: [], listdxmebi: [], listBeforec: [], listBefored: [],
  listBeforeFiestc: [], listBeforeFiestd: [],
};

export const FIRST_YEAR = 1899;
export const LAST_YEAR = 2101;

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;
const START = Date.UTC(1898, 0, 1);

export const MONTHS = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];

export const MONTHS_SHORT = [
  "იანვ.", "თებ.", "მარ.", "აპრ.", "მაისი", "ივნ.",
  "ივლ.", "აგვ.", "სექ.", "ოქტ.", "ნოემ.", "დეკ.",
];

export const WEEKDAYS = [
  "კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი",
];

export const WEEK_HEADERS = ["ორშ.", "სამშ.", "ოთხშ.", "ხუთშ.", "პარ.", "შაბ.", "კვ."];

export function today(): Day {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

export function toUTC(d: Day): number {
  return Date.UTC(d.year, d.month - 1, d.day);
}

export function fromUTC(ms: number): Day {
  const date = new Date(ms);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function addDays(d: Day, days: number): Day {
  return fromUTC(toUTC(d) + days * MS_PER_DAY);
}

/** Old style (Julian) date — the app always uses new style minus 13 days. */
export function julian(d: Day): Day {
  return addDays(d, -13);
}

/** 0 = Sunday ... 6 = Saturday */
export function weekday(d: Day): number {
  return new Date(toUTC(d)).getUTCDay();
}

export function dayKey(d: Day): number {
  return d.year * 10000 + d.month * 100 + d.day;
}

export function sameDay(a: Day, b: Day): boolean {
  return dayKey(a) === dayKey(b);
}

export function clampDay(d: Day): Day {
  if (d.year < FIRST_YEAR) return { year: FIRST_YEAR, month: 1, day: 1 };
  if (d.year > LAST_YEAR) return { year: LAST_YEAR, month: 12, day: 31 };
  return d;
}

export function formatDay(d: Day): string {
  return `${d.day} ${MONTHS[d.month - 1]}`;
}

export function toISO(d: Day): string {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

export function fromISO(value: string | null): Day | null {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return clampDay({ year: parts[0], month: parts[1], day: parts[2] });
}

/* ------------------------------------------------------------------- data */

export interface Tables {
  data: CalendarData;
  fasting: Uint8Array;
  images: Uint8Array;
  imageNames: string[];
  fastingNames: string[];
  icons: Record<string, string>;
  lifeIndex: Record<string, string[]>;
  saints: Saint[];
}

let cache: Promise<Tables> | null = null;

export function loadTables(): Promise<Tables> {
  if (!cache) {
    cache = (async () => {
      const json = async <T,>(name: string): Promise<T> =>
        (await fetch(`/data/${name}.json`)).json();
      const bin = async (name: string): Promise<Uint8Array> =>
        new Uint8Array(await (await fetch(`/data/${name}.bin`)).arrayBuffer());

      const [data, meta, icons, lifeIndex, saints, fasting, images] = await Promise.all([
        json<CalendarData>("calendar_data"),
        json<{ imageNames: string[]; fastingNames: string[] }>("day_meta"),
        json<Record<string, string>>("icons"),
        json<Record<string, string[]>>("life_index"),
        json<Saint[]>("saints"),
        bin("fasting"),
        bin("day_images"),
      ]);

      const collator = new Intl.Collator("ka");
      return {
        data,
        fasting,
        images,
        imageNames: meta.imageNames,
        fastingNames: meta.fastingNames,
        icons,
        lifeIndex,
        saints: [...saints].sort((a, b) => collator.compare(a.name, b.name)),
      };
    })();
  }
  return cache;
}

/* --------------------------------------------------------------- lookups */

function dayIndex(d: Day): number {
  return Math.round((toUTC(d) - START) / MS_PER_DAY);
}

export function fastingOf(t: Tables, d: Day): FastingInfo {
  const i = dayIndex(d);
  if (i < 0 || i >= t.fasting.length) return { out: "", fer: 0, tevz: false, brc: false };
  const b = t.fasting[i];
  return {
    out: t.fastingNames[b & 15] ?? "",
    fer: ((b >> 4) & 3) - 1,
    tevz: (b & 64) !== 0,
    brc: (b & 128) !== 0,
  };
}

/** File name of the icon of the day, or null when the default cross is used. */
export function iconOf(t: Tables, d: Day): string | null {
  const i = dayIndex(d);
  if (i < 0 || i >= t.images.length) return null;
  const name = t.imageNames[t.images[i]];
  if (!name) return null;
  return t.icons[name] ?? null;
}

function text(t: Tables, id: number | null | undefined): string | null {
  if (id === null || id === undefined || id < 0 || id >= t.data.strings.length) return null;
  return t.data.strings[id];
}

function at(t: Tables, ids: number[], index: number): string {
  if (index < 0 || index >= ids.length) return "";
  return text(t, ids[index]) ?? "";
}

function idx(list: number[], key: number): number {
  return list.indexOf(key);
}

function moving(t: Tables, year: number): MovingYear {
  return t.data.moving[String(year)] ?? EMPTY_MOVING;
}

function movingTroparions(t: Tables, year: number): MovingYear {
  return t.data.movingTroparions[String(year)] ?? EMPTY_MOVING;
}

function fixedName(t: Tables, month: number, day: number): string | null {
  if (month < 0 || month > 11 || day < 0 || day > 31) return null;
  return text(t, t.data.fixed.names[month][day]);
}

/** Commemorations of the day, exactly as the mobile app composes them. */
export function dayFragments(t: Tables, g: Day): Fragment[] {
  const result: Fragment[] = [];
  const j = julian(g);
  const key = dayKey(g);
  const jm = j.month - 1;
  const jd = j.day;
  const m = moving(t, g.year);
  const mb = moving(t, g.year - 1);

  let dd = fixedName(t, jm, jd);
  if (j.year % 4 !== 0 && jm === 1 && jd === 28) {
    const next = fixedName(t, jm, jd + 1);
    if (dd !== null || next !== null) dd = (dd ?? "") + (next ?? "");
  }

  const great = idx(m.atormeta, key);
  if (great !== -1) {
    result.push({ kind: "html", value: `<h4>${at(t, m.atormetb, great)}</h4>` });
  }

  const inList = idx(m.listc, key);
  if (inList !== -1) {
    let value = at(t, m.listd, inList);
    const before = idx(mb.listc, key);
    if (before !== -1) value = at(t, mb.listd, before) + value;
    result.push({ kind: "html", value });
  } else if (idx(m.listBeforeFiestc, key) !== -1) {
    let value = at(t, m.listBeforeFiestd, idx(m.listBeforeFiestc, key));
    const before = idx(mb.listcxmebi, key);
    if (before !== -1) value += at(t, mb.listdxmebi, before);
    result.push({ kind: "html", value });
  } else if (idx(m.listBeforec, key) !== -1) {
    let value = at(t, m.listBefored, idx(m.listBeforec, key));
    const before = idx(mb.listcxmebi, key);
    if (before !== -1) value += at(t, mb.listdxmebi, before);
    result.push({ kind: "html", value });
  } else if (idx(mb.listc, key) !== -1) {
    result.push({ kind: "html", value: at(t, mb.listd, idx(mb.listc, key)) });
  }

  const weekly = idx(m.lista, key);
  if (weekly !== -1) {
    result.push({ kind: "html", value: at(t, m.listb, weekly) });
  }

  if (j.year === 2023) {
    const reading = text(t, t.data.fixed.readings[jm][jd]);
    if (reading) dd = (dd ?? "") + "<br><br><small><b>" + reading;
  }
  if (dd) result.push({ kind: "html", value: dd });

  return result;
}

/** Troparion and kontakion of the day. */
export function troparionHtml(t: Tables, g: Day): string {
  const j = julian(g);
  const key = dayKey(g);
  const m = moving(t, g.year);
  const mb = moving(t, g.year - 1);
  const tr = movingTroparions(t, g.year);
  const tr2 = movingTroparions(t, g.year - 1);

  let title = "";
  if (idx(m.atormeta, key) !== -1) {
    title += `<h4>${at(t, tr.atormetb, idx(tr.atormeta, key))}</h4>`;
  }
  if (idx(tr.listc, key) !== -1) {
    let value = at(t, tr.listd, idx(tr.listc, key));
    if (idx(tr2.listc, key) !== -1) value = at(t, tr2.listd, idx(tr2.listc, key)) + value;
    title += value;
  } else if (idx(m.listBeforeFiestc, key) !== -1) {
    let value = at(t, tr.listBeforeFiestd, idx(tr.listBeforeFiestc, key));
    if (idx(tr2.listcxmebi, key) !== -1) value += at(t, tr2.listdxmebi, idx(tr2.listcxmebi, key));
    title += value;
  } else if (idx(m.listBeforec, key) !== -1) {
    let value = at(t, tr.listBefored, idx(tr.listBeforec, key));
    if (idx(mb.listcxmebi, key) !== -1) value += at(t, tr2.listdxmebi, idx(mb.listcxmebi, key));
    title += value;
  } else if (idx(mb.listc, key) !== -1) {
    title += at(t, tr2.listd, idx(tr2.listc, key));
  }
  if (idx(m.lista, key) !== -1) {
    title += at(t, tr.listb, idx(m.lista, key));
  }
  return title + (text(t, t.data.fixed.troparions[j.month - 1][j.day]) ?? "");
}

/** Plain text of an HTML fragment, used for previews. */
export function plainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export const YEAR_SECTIONS = [
  "უდიდესი დღესასწაულები",
  "დიდი დღესასწაულები",
  "მარხვები, ხსნილები",
  "მიცვალებულთა მოხსენება",
];

/** Yearly indicators (Easter, feasts, fasts, memorial days). */
export function yearIndicators(t: Tables, year: number, section: number): Fragment[] {
  const sections = t.data.yearIndicators[String(year)];
  if (!sections || section < 0 || section >= sections.length) return [];
  const fragments: Fragment[] = [];
  for (const id of sections[section]) {
    const value = text(t, id);
    if (value === null) continue;
    if (value.startsWith("\u0002")) fragments.push({ kind: "html", value: value.slice(1) });
    else fragments.push({ kind: "text", value });
  }
  return fragments;
}

/** Titles of the lives of saints commemorated on this day. */
export function lifeTitles(t: Tables, g: Day): string[] {
  const j = julian(g);
  return t.lifeIndex[`${j.month}/${j.day}`] ?? [];
}

/**
 * Assets that are not part of the deployment (lives of saints, pictures) are served
 * from R2. Override with NEXT_PUBLIC_ASSETS_BASE if the bucket changes.
 */
export const ASSETS_BASE = (
  process.env.NEXT_PUBLIC_ASSETS_BASE ?? "https://pub-dc86fbd1e4bb4370b4338b45e00effe7.r2.dev"
).replace(/\/+$/, "");

/** https://<bucket>/<month>/<day>/<index>.html */
export function lifeUrl(g: Day, index: number): string {
  const j = julian(g);
  return `${ASSETS_BASE}/${j.month}/${j.day}/${index + 1}.html`;
}

/** Layouts that are tried in order, in case the files were uploaded into a "life/" folder. */
function lifeCandidates(g: Day, index: number): string[] {
  const j = julian(g);
  const path = `${j.month}/${j.day}/${index + 1}.html`;
  return [`${ASSETS_BASE}/${path}`, `${ASSETS_BASE}/life/${path}`];
}

const lifeCache = new Map<string, Promise<string | null>>();

function cleanLife(raw: string): string {
  // the same clean-up the mobile apps do
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/<img.+\/(img)*>/g, "")
    .replace(/<a href=.+<\/a>/g, "")
    .replace(/<img.+?>/g, "");
}

/** Falls back to the bundled monthly file when the bucket is unreachable. */
async function lifeFromBundle(g: Day, index: number): Promise<string | null> {
  const j = julian(g);
  try {
    const response = await fetch(`/data/life/${j.month}.json`);
    if (!response.ok) return null;
    const month = (await response.json()) as Record<string, string>;
    const raw = month[`${j.day}/${index + 1}`];
    return raw ? cleanLife(raw) : null;
  } catch {
    return null;
  }
}

/** Cleaned-up HTML of one life, or null when there is no text for it. */
export function lifeHtml(g: Day, index: number): Promise<string | null> {
  const j = julian(g);
  const key = `${j.month}/${j.day}/${index + 1}`;
  let entry = lifeCache.get(key);
  if (!entry) {
    entry = (async () => {
      for (const url of lifeCandidates(g, index)) {
        try {
          const response = await fetch(url, { mode: "cors" });
          if (!response.ok) {
            console.warn(`[life] ${response.status} ${url}`);
            continue;
          }
          const text = await response.text();
          if (text.trim()) return cleanLife(text);
        } catch (error) {
          // usually a missing CORS policy on the bucket
          console.warn(`[life] request blocked (CORS?) ${url}`, error);
        }
      }
      return lifeFromBundle(g, index);
    })();
    lifeCache.set(key, entry);
  }
  return entry;
}

export function pictureUrl(g: Day, index: number): string {
  const j = julian(g);
  return `${ASSETS_BASE}/${j.month}/${j.day}/Pictures/${index + 1}_1.jpg`;
}

const MAX_PICTURES = 12;
const pictureCache = new Map<string, Promise<string[]>>();

function imageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}

const firstPictureCache = new Map<string, Promise<string | null>>();

/** First picture of one life ("<n>_1.jpg" or "<n> (1).jpg"), or null. Cached. */
export function firstLifePicture(g: Day, index: number): Promise<string | null> {
  const j = julian(g);
  const key = `${j.month}/${j.day}/${index + 1}`;
  let entry = firstPictureCache.get(key);
  if (!entry) {
    entry = findFirstLifePicture(g, index);
    firstPictureCache.set(key, entry);
  }
  return entry;
}

async function findFirstLifePicture(g: Day, index: number): Promise<string | null> {
  const j = julian(g);
  const folder = `${ASSETS_BASE}/${j.month}/${j.day}/Pictures/`;
  const candidates = [
    `${folder}${index + 1}_1.jpg`,
    `${folder}${encodeURIComponent(`${index + 1} (1).jpg`)}`,
  ];
  const found = await Promise.all(candidates.map((url) => imageExists(url)));
  const at = found.indexOf(true);
  return at === -1 ? null : candidates[at];
}

/**
 * Icon for days that have no icon of their own: the first picture of the first saint,
 * otherwise of the second one, and so on.
 */
export async function fallbackDayPicture(g: Day, lifeCount: number): Promise<string | null> {
  for (let index = 0; index < lifeCount; index += 1) {
    const picture = await firstLifePicture(g, index);
    if (picture) return picture;
  }
  return null;
}

/**
 * All pictures of one life. Besides the original "<n>_1.jpg" a life can have several
 * pictures named "<n> (1).jpg", "<n> (2).jpg" … — they are checked in parallel and
 * returned in order, stopping at the first missing number.
 */
export function lifePictures(g: Day, index: number): Promise<string[]> {
  const j = julian(g);
  const key = `${j.month}/${j.day}/${index + 1}`;
  let entry = pictureCache.get(key);
  if (!entry) {
    entry = (async () => {
      const folder = `${ASSETS_BASE}/${j.month}/${j.day}/Pictures/`;
      const legacy = `${folder}${index + 1}_1.jpg`;
      const numbered = Array.from(
        { length: MAX_PICTURES },
        (_, n) => `${folder}${encodeURIComponent(`${index + 1} (${n + 1}).jpg`)}`,
      );
      const [legacyOk, ...numberedOk] = await Promise.all(
        [legacy, ...numbered].map((url) => imageExists(url)),
      );
      const found: string[] = legacyOk ? [legacy] : [];
      for (let n = 0; n < numbered.length; n += 1) {
        if (!numberedOk[n]) break;
        found.push(numbered[n]);
      }
      return found;
    })();
    pictureCache.set(key, entry);
  }
  return entry;
}

/** Colour of the marker shown under a day in the month grid. */
export function markerColor(t: Tables, d: Day): string | null {
  const out = fastingOf(t, d).out;
  if (out.includes("მარხვა") || out.includes("ვნების")) {
    return d.month === 1 && d.day === 19 ? null : "fast";
  }
  if (out.includes("მსგეფსი") || out.includes("ბრწყ")) return "feast";
  if (out.includes("ყველ")) return "cheese";
  return null;
}

export interface DayView {
  fragments: Fragment[];
  fasting: FastingInfo;
  icon: string | null;
  isFeast: boolean;
}

export function dayView(t: Tables, g: Day): DayView {
  const fasting = fastingOf(t, g);
  return {
    fragments: dayFragments(t, g),
    fasting,
    icon: iconOf(t, g),
    isFeast: fasting.brc || weekday(g) === 0,
  };
}