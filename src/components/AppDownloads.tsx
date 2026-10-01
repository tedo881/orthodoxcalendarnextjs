const apps = [
  {
    name: "საეკლესიო კალენდარი",
    appStore:
      "https://apps.apple.com/us/app/georgian-orthodox-calendar/id6813075320",
    googlePlay:
      "https://play.google.com/store/apps/details?id=geo.orthodox.calendar",
  },
  {
    name: "ქართული გალობა",
    appStore: "https://apps.apple.com/ge/app/galoba/id1481196841",
    googlePlay:
      "https://play.google.com/store/apps/details?id=galobisa.cigni.galoba&hl=ka",
  },
  {
    name: "გულანი",
    appStore: "https://apps.apple.com/ge/app/gulani/id6572293957",
    googlePlay:
      "https://play.google.com/store/apps/details?id=geo.gulani&hl=ka",
  },
];

const linkClass =
  "pill inline-flex items-center gap-2 px-4 py-2 transition-colors hover:text-[color:var(--ink)]";

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 37.6 59 129.3 107.2 127.8 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-84.1 102.6-121.8-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 512 512" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M325.3 234.3L104.6 13.5c-8.3-4.5-17.5-4-25.8-.5C67.2 18 60 29.5 60 42.6v426.8c0 13.1 7.2 24.6 18.8 29.6 4.5 2 9.2 3 13.9 3 7.3 0 14.6-2.3 20.9-6.9l220.7-160.8-9-9zM40.6 481.1c-1.1-3.5-1.6-7.3-1.6-11.2V42.1c0-3.9.5-7.7 1.6-11.2L262.7 256 40.6 481.1zm253.4-198.2l60.2 60.2-243.6 141.7c-5.2 3-11 4-16.7 3.4l200.1-205.3zm60.2-53.8l-60.2 60.2-200.1-205.3c5.7-.6 11.5.4 16.7 3.4l243.6 141.7zM443.7 256c0 15.4-8.3 29.6-21.8 37.3l-35.6 20.7-65-65 65-65 35.6 20.7c13.5 7.7 21.8 21.9 21.8 37.3z" />
    </svg>
  );
}

export function AppDownloads() {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-10">
      {apps.map((app) => (
        <div key={app.name} className="flex flex-col items-center gap-3">
          <span className="text-sm" style={{ color: "var(--ink)" }}>
            {app.name}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={app.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <AppleIcon />
              App Store
            </a>
            <a
              href={app.googlePlay}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <PlayIcon />
              Google Play
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}