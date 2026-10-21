/**
 * Verified source data for the ZZZ release countdown site.
 *
 * Every timestamp below comes from an official HoYoverse announcement that was
 * read directly (HoYoLAB public API). Sources are listed in `sources` and each
 * date row carries the id of the announcement it came from, so the UI can link
 * back to the original post.
 *
 * Server time in ZZZ is UTC+8; the official notices quote "(UTC+8)" and
 * "(server time)" interchangeably. We keep both labels in the data so the UI
 * never has to guess which one is being shown.
 *
 * Do not add a date here without an official announcement behind it. Estimates
 * are allowed but must be flagged with `estimated: true`.
 */

export const SITE = {
  name: 'ZZZ Countdown',
  version: '3.3',
  versionTitle: 'Journey to the Sky',
  /** Official launch date as printed by HoYoverse (server time). */
  officialDateLabel: 'October 21, 2026',
  lastChecked: '2026-10-21 18:00 (UTC+8)',
  disclaimer:
    'Independent fan site. Not affiliated with HoYoverse or miHoYo. Version dates follow the official announcements linked on this page.',
} as const;

export type Source = {
  id: string;
  title: string;
  url: string;
  /** When the announcement was published, as shown by HoYoLAB. */
  published: string;
  /** What this announcement confirms, in plain words. */
  confirms: string;
  kind: 'pre-download' | 'update' | 'channels' | 'intel' | 'previous' | 'press';
};

export const sources: Source[] = [
  {
    id: 'E01',
    title: 'Version 3.3 "Journey to the Sky" Pre-Download Available & Update Notice',
    url: 'https://www.hoyolab.com/article/47130875',
    published: '2026-10-19 12:00 (UTC+8)',
    confirms:
      'Pre-download window and file sizes per platform, the 2026/10/21 06:00 (UTC+8) maintenance start, the "about five hours" estimate and the Polychrome x300 compensation.',
    kind: 'pre-download',
  },
  {
    id: 'E02',
    title: 'Version 3.3 "Journey to the Sky" Update Announcement',
    url: 'https://www.hoyolab.com/article/47149468',
    published: '2026-10-21 (UTC+8)',
    confirms:
      'Update start time, the 42-day version length ending 2026/12/02 06:00 (UTC+8), issue-fix compensation deadline, new S-Rank Agents and W-Engines.',
    kind: 'update',
  },
  {
    id: 'E03',
    title: 'V3.3 Limited-Time Channels (Phase I)',
    url: 'https://www.hoyolab.com/article/47131668',
    published: '2026-10-19 (UTC+8)',
    confirms:
      'The four Phase I Signal Search channels, their end time (2026/11/11 11:59 server time) and the rule that guaranteed-signal counts are cumulative across Exclusive Channels.',
    kind: 'channels',
  },
  {
    id: 'E04',
    title: 'Zenless Zone Zero Version 3.3 "Journey to the Sky" Special Program | Intel Report',
    url: 'https://www.hoyolab.com/article/47023957',
    published: '2026-10-09 (UTC+8)',
    confirms:
      'The Special Program redemption code and its expiry (October 11 at 23:59:59 UTC+8), plus the Phase II lineup shown in the Intel Report.',
    kind: 'intel',
  },
  {
    id: 'E05',
    title: 'Version 3.2 "Their Secret Histories" Update Announcement',
    url: 'https://www.hoyolab.com/article/46622788',
    published: '2026-09-09 (UTC+8)',
    confirms: 'That Version 3.2 ran 42 days and ended on 2026/10/21 06:00 (UTC+8) - the same cadence as 3.3.',
    kind: 'previous',
  },
  {
    id: 'E06',
    title: 'Zenless Zone Zero Version 3.3 "Journey to the Sky" Special Program Announcement',
    url: 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=4162040',
    published: '2026-10-08 (UTC+8)',
    confirms:
      'The Special Program aired on October 9 at 19:30 (UTC+8) and is mirrored on the official Steam news feed (app 4162040).',
    kind: 'press',
  },
  {
    id: 'E07',
    title: 'Official press release — Version 3.3 "Journey to the Sky" Coming Soon',
    url: 'https://www.hoyoverse.com/en-us/news/166759',
    published: '2026-10 (UTC+8)',
    confirms: 'The English press release naming Phoenix, Severian and the all-new mech combat.',
    kind: 'press',
  },
];

export type Milestone = {
  id: string;
  label: string;
  /** ISO 8601 with the +08:00 offset that HoYoverse uses. */
  at: string;
  /** 'server' = the game's own clock, 'utc8' = UTC+8 (identical in ZZZ). */
  clock: 'server' | 'utc8';
  sourceId: string;
  note: string;
  estimated?: boolean;
};

/**
 * The four timers the site runs on. `launch` is derived from the official
 * maintenance window (06:00 UTC+8 + "about five hours"), so it is an estimate:
 * HoYoverse never published a confirmed go-live minute.
 */
export const milestones: Milestone[] = [
  {
    id: 'predownload-start',
    label: 'Pre-download opens',
    at: '2026-10-19T12:00:00+08:00',
    clock: 'utc8',
    sourceId: 'E01',
    note: 'PC, mobile, PS5 and Xbox pre-download files become available.',
  },
  {
    id: 'predownload-end',
    label: 'Pre-download closes',
    at: '2026-10-21T05:50:00+08:00',
    clock: 'utc8',
    sourceId: 'E01',
    note: 'Download must finish before maintenance starts.',
  },
  {
    id: 'maintenance-start',
    label: 'Maintenance starts',
    at: '2026-10-21T06:00:00+08:00',
    clock: 'utc8',
    sourceId: 'E01',
    note: 'Login is unavailable while the version update runs.',
  },
  {
    id: 'launch',
    label: 'Version 3.3 goes live',
    at: '2026-10-21T11:00:00+08:00',
    clock: 'utc8',
    sourceId: 'E01',
    estimated: true,
    note: 'Estimated: maintenance starts at 06:00 (UTC+8) and HoYoverse says it "will take five hours".',
  },
  {
    id: 'phase1-end',
    label: 'Phase I banners end',
    at: '2026-11-11T11:59:00+08:00',
    clock: 'server',
    sourceId: 'E03',
    note: 'The four Phase I Signal Search channels close; Phase II starts right after.',
  },
  {
    id: 'phase2-end',
    label: 'Phase II banners end',
    at: '2026-12-01T14:59:00+08:00',
    clock: 'server',
    sourceId: 'E02',
    note: 'End of the 3.3 banner cycle, one day before the version itself ends.',
  },
  {
    id: 'version-end',
    label: 'Version 3.3 ends',
    at: '2026-12-02T06:00:00+08:00',
    clock: 'utc8',
    sourceId: 'E02',
    note: 'Version 3.3 runs 42 days, ending 2026/12/02 06:00 (UTC+8).',
  },
  {
    id: 'fix-compensation-end',
    label: 'Issue-fix compensation claim closes',
    at: '2026-11-20T23:59:00+08:00',
    clock: 'utc8',
    sourceId: 'E02',
    note: 'Log in and claim the Polychrome x300 before this time; the mail expires after 30 days.',
  },
  {
    id: 'store-sale-end',
    label: 'Store discounts end',
    at: '2026-12-02T05:59:00+08:00',
    clock: 'utc8',
    sourceId: 'E01',
    note: 'Phoenix outfit bundle and the discounted outfits leave the shop.',
  },
];

/** Countdown targets shown in the hero grid. Order matters. */
export const countdownTargets = ['launch', 'phase1-end', 'phase2-end', 'version-end'] as const;

export type PreDownloadPlatform = {
  platform: string;
  size: string;
  detail: string;
};

export const preDownload: {
  window: string;
  windowStart: string;
  windowEnd: string;
  platforms: PreDownloadPlatform[];
  notes: { label: string; text: string; tone: 'ok' | 'warn' }[];
  steps: { platform: string; steps: string[] }[];
} = {
  window: '2026/10/19 12:00 - 2026/10/21 05:50 (UTC+8)',
  windowStart: '2026-10-19T12:00:00+08:00',
  windowEnd: '2026-10-21T05:50:00+08:00',
  platforms: [
    { platform: 'PC', size: '~6 GB', detail: 'Download through the HoYoPlay launcher, next to the Start Game button.' },
    {
      platform: 'Mobile (Android / iOS)',
      size: '~5 GB',
      detail: 'Tap the "Pre-Download Resources" icon in the bottom-right of the game.',
    },
    {
      platform: 'PS5 / PS5 Pro',
      size: '~14 GB',
      detail: 'Starts automatically once the console has enough reserved storage space.',
    },
    {
      platform: 'Xbox Series X|S',
      size: '~21 GB',
      detail: 'Auto-starts, or update from the console home screen under My games & apps > Manage > Updates.',
    },
  ],
  notes: [
    {
      label: 'PC and console',
      text: 'You can keep playing while the pre-download runs.',
      tone: 'ok',
    },
    {
      label: 'Mobile',
      text: 'Official notice: "Mobile users will not be able to play the game during the pre-download."',
      tone: 'warn',
    },
    {
      label: 'Before you start',
      text: 'Make sure the device has enough free space, use Wi-Fi, and remember installed voice packs change the size.',
      tone: 'warn',
    },
  ],
  steps: [
    {
      platform: 'PC',
      steps: [
        'Open the HoYoPlay launcher.',
        'Click the "Pre-Download" icon next to the "Start Game" button.',
        'Let the download finish before 2026/10/21 05:50 (UTC+8).',
      ],
    },
    {
      platform: 'Android',
      steps: ['Open the game.', 'Follow the in-game pop-up instructions to complete the update.'],
    },
    {
      platform: 'iOS',
      steps: ['Open the App Store.', 'Select update.'],
    },
    {
      platform: 'PS5 / PS5 Pro',
      steps: [
        'Open the PS5 home screen and highlight Zenless Zone Zero.',
        'Hold down the Options button on the controller.',
        'Check for updates.',
      ],
    },
    {
      platform: 'Xbox Series X|S',
      steps: [
        'Open the Xbox dashboard.',
        'Go to My games & apps > Manage.',
        'Select Zenless Zone Zero on the Updates page and confirm.',
      ],
    },
  ],
};

export type Banner = {
  phase: 'Phase I' | 'Phase II';
  name: string;
  kind: 'Agent' | 'W-Engine';
  attribute: string;
  channel: string;
  start: string;
  end: string;
  endIso: string;
  sourceId: string;
  highlight?: boolean;
};

export const banners: Banner[] = [
  {
    phase: 'Phase I',
    name: 'Phoenix',
    kind: 'Agent',
    attribute: 'Fire - Anomaly',
    channel: 'Into the Flames of Life',
    start: '2026-10-21 06:00 (UTC+8)',
    end: '2026-11-11 11:59 (server time)',
    endIso: '2026-11-11T11:59:00+08:00',
    sourceId: 'E02',
    highlight: true,
  },
  {
    phase: 'Phase I',
    name: 'Velina',
    kind: 'Agent',
    attribute: 'Wind - Anomaly',
    channel: 'Graceful Gale',
    start: '2026-10-21 06:00 (UTC+8)',
    end: '2026-11-11 11:59 (server time)',
    endIso: '2026-11-11T11:59:00+08:00',
    sourceId: 'E03',
  },
  {
    phase: 'Phase I',
    name: 'Plume of Rebirth',
    kind: 'W-Engine',
    attribute: 'Anomaly',
    channel: '"Plume of Rebirth" Signal Search',
    start: '2026-10-21 06:00 (UTC+8)',
    end: '2026-11-11 11:59 (server time)',
    endIso: '2026-11-11T11:59:00+08:00',
    sourceId: 'E03',
  },
  {
    phase: 'Phase I',
    name: 'Joyau Dore',
    kind: 'W-Engine',
    attribute: 'Anomaly',
    channel: '"Joyau Dore" Signal Search',
    start: '2026-10-21 06:00 (UTC+8)',
    end: '2026-11-11 11:59 (server time)',
    endIso: '2026-11-11T11:59:00+08:00',
    sourceId: 'E03',
  },
  {
    phase: 'Phase II',
    name: 'Severian',
    kind: 'Agent',
    attribute: 'Wind - Attack',
    channel: 'Answers in the Wind',
    start: '2026-11-11 12:00 (server time)',
    end: '2026-12-01 14:59 (server time)',
    endIso: '2026-12-01T14:59:00+08:00',
    sourceId: 'E02',
    highlight: true,
  },
  {
    phase: 'Phase II',
    name: 'Norma',
    kind: 'Agent',
    attribute: '',
    channel: 'Outlier of Prodigies',
    start: '2026-11-11 12:00 (server time)',
    end: '2026-12-01 14:59 (server time)',
    endIso: '2026-12-01T14:59:00+08:00',
    sourceId: 'E04',
  },
  {
    phase: 'Phase II',
    name: 'Incarcerating Grip',
    kind: 'W-Engine',
    attribute: 'Attack',
    channel: '"Incarcerating Grip" Signal Search',
    start: '2026-11-11 12:00 (server time)',
    end: '2026-12-01 14:59 (server time)',
    endIso: '2026-12-01T14:59:00+08:00',
    sourceId: 'E02',
  },
  {
    phase: 'Phase II',
    name: 'Chief Sidekick',
    kind: 'W-Engine',
    attribute: '',
    channel: '"Chief Sidekick" Signal Search',
    start: '2026-11-11 12:00 (server time)',
    end: '2026-12-01 14:59 (server time)',
    endIso: '2026-12-01T14:59:00+08:00',
    sourceId: 'E04',
  },
];

/**
 * Time zones the release page converts to. Offsets are the ones in effect on
 * the release date (2026-10-21 / 2026-11-11 / 2026-12-01), not today's.
 * `offset` is the UTC offset in hours on those dates.
 */
export type TimeZoneRow = {
  zone: string;
  label: string;
  offset: number;
  /** The abbreviation in force on the release date (EDT, not EST, in October). */
  dst: string;
};

export const timeZones: TimeZoneRow[] = [
  { zone: 'America/Los_Angeles', label: 'Los Angeles', offset: -7, dst: 'PDT' },
  { zone: 'America/Denver', label: 'Denver', offset: -6, dst: 'MDT' },
  { zone: 'America/Chicago', label: 'Chicago', offset: -5, dst: 'CDT' },
  { zone: 'America/New_York', label: 'New York', offset: -4, dst: 'EDT' },
  { zone: 'UTC', label: 'UTC / London (winter)', offset: 0, dst: 'UTC' },
  { zone: 'Europe/London', label: 'London', offset: 1, dst: 'BST' },
  { zone: 'Europe/Berlin', label: 'Berlin / Paris / Rome', offset: 2, dst: 'CEST' },
  { zone: 'Europe/Athens', label: 'Athens / Helsinki', offset: 3, dst: 'EEST' },
  { zone: 'Europe/Moscow', label: 'Moscow', offset: 3, dst: 'MSK' },
  { zone: 'Asia/Kolkata', label: 'Mumbai / New Delhi', offset: 5.5, dst: 'IST' },
  { zone: 'Asia/Bangkok', label: 'Bangkok / Jakarta', offset: 7, dst: 'ICT' },
  { zone: 'Asia/Shanghai', label: 'Shanghai / Beijing / Singapore', offset: 8, dst: 'CST' },
  { zone: 'Asia/Tokyo', label: 'Tokyo / Seoul', offset: 9, dst: 'JST' },
  { zone: 'Australia/Sydney', label: 'Sydney / Melbourne', offset: 11, dst: 'AEDT' },
];

export type VersionRow = {
  version: string;
  title: string;
  start: string;
  end: string;
  sourceId?: string;
  confirmed: boolean;
};

export const versionHistory: VersionRow[] = [
  {
    version: '3.3',
    title: 'Journey to the Sky',
    start: '2026-10-21',
    end: '2026-12-02',
    sourceId: 'E02',
    confirmed: true,
  },
  {
    version: '3.2',
    title: 'Their Secret Histories',
    start: '2026-09-09',
    end: '2026-10-21',
    sourceId: 'E05',
    confirmed: true,
  },
];

export const newContent = {
  agents: [
    {
      name: 'Phoenix',
      title: 'Phoenix Reffaella',
      attribute: 'Fire - Anomaly',
      channel: 'Into the Flames of Life',
      blurb:
        'Limited S-Rank Fire Anomaly Agent. Her damage is scaled by the Anomaly attribute, and her critical hits benefit from Anomaly boosts applied by allies.',
    },
    {
      name: 'Severian',
      title: 'Severian Lowell',
      attribute: 'Wind - Attack',
      channel: 'Answers in the Wind',
      blurb:
        'Limited S-Rank Wind Attack Agent arriving in Phase II. He is the second half of the 3.3 story that the Special Program teased.',
    },
  ],
  wEngines: [
    { name: 'Plume of Rebirth', attribute: 'Anomaly', phase: 'Phase I' },
    { name: 'Incarcerating Grip', attribute: 'Attack', phase: 'Phase II' },
    { name: 'Candlelit Scheme', attribute: 'Armorer', phase: 'Phase II' },
  ],
  outfits: [
    { name: 'Daydream Complex', owner: 'Phoenix', kind: 'Outfit' },
    { name: 'The Illness Called Life', owner: 'Phoenix', kind: 'Outfit' },
    { name: 'Solemnly Impeccable', owner: 'Severian', kind: 'Outfit' },
  ],
  events: [
    'All-New Program',
    '"En-Nah" Into Your Lap',
    'Angels Support Operation',
    'Spooky Funhouse Tales',
    'Cyber Miracle Healer, on Duty!',
    'Trails of the Hobbling Crow',
    'Repair! Drifting Art',
    'Shiyu Defense / Critical Node',
    'Deadly Assault',
    'Data Bounty: Combat Simulation',
    'Advanced Bounty: Area Patrol',
    'The Final Callback',
  ],
  areas: ['Quietude Isle (Restricted Area)', 'Airspace Control Tower (Restricted Area)'],
  gameModes: ['Enigma of the Labyrinth: Spooky Trial', 'Annihilation Simulacrum'],
  story: "Phaethon's Story, Season 3 Chapter 4: Journey to the Sky",
  features: [
    {
      title: 'Mech combat',
      body: 'Version 3.3 adds controllable combat mechs with a close-range and a long-range mode, the headline feature of the "Journey to the Sky" update.',
    },
    {
      title: 'Agent Guides',
      body: 'A new in-game Agent Guides feature explains upgrades and team compositions, with a Fairy Team Recommendation function that builds a lineup for you.',
    },
    {
      title: 'Enigma of the Labyrinth',
      body: 'A temporary Safe capacity increase now has its own in-game countdown timer. It expires at the end of Version 3.3 and resets with the 3.4 update.',
    },
    {
      title: 'New events',
      body: 'New Agent Trust events, the "Trails of the Hobbling Crow" event and new titles tied to the Zenless Zone Zero 2026 FES.',
    },
    {
      title: 'Limited Spookies',
      body: "Boojee's Store sells limited Spookies, including the Proxy accessory Full Moon Homecoming. They are only available during Version 3.3.",
    },
    {
      title: 'Notorious Hunt and Expert Challenge',
      body: 'In some permanent combat modes your team is now evaluated by the number of Agents deployed and their upgrade progress, with a warning prompt when the team looks weak.',
    },
  ],
  store: [
    {
      item: '"Empty Daydreams" outfit bundle (Phoenix)',
      price: 'Monochrome x2,350',
      when: 'Bundle discount until 2026/12/02 05:59 (UTC+8)',
    },
    {
      item: 'Phoenix: Daydream Complex',
      price: 'Monochrome x1,350 (x1,680 after the discount)',
      when: 'Discount until 2026/12/02 05:59 (UTC+8)',
    },
    {
      item: 'Phoenix: The Illness Called Life',
      price: 'Monochrome x1,350 (x1,680 after the discount)',
      when: 'Discount until 2026/12/02 05:59 (UTC+8)',
    },
    {
      item: 'Entertainment Invitation limited gift',
      price: 'Encrypted Master Tape x10, Denny x100,000',
      when: 'Until 2026/12/02 05:59 (UTC+8)',
    },
  ],
  rewards: [
    {
      label: 'Server update compensation',
      value: 'Polychrome x300',
      when: 'Claim by mail before the end of Version 3.3',
    },
    {
      label: 'Issue fix compensation',
      value: 'Polychrome x300',
      when: 'Log in and claim before 2026/11/20 23:59 (UTC+8)',
    },
    { label: 'Compensation eligibility', value: 'Inter-Knot Lv. 4', when: 'Reach it before 2026/10/21 06:00 (UTC+8)' },
  ],
};

export const faqs = {
  home: [
    {
      title: 'Does the maintenance end time equal the moment the version goes live?',
      description:
        'Almost, but not exactly. The official notice says maintenance starts at 2026/10/21 06:00 (UTC+8) and "will take five hours", so 11:00 (UTC+8) is our estimate of the go-live moment, not a published time. The moment the update finishes, login is restored.',
    },
    {
      title: 'Should I use EDT or EST right now?',
      description:
        'EDT. On the 3.3 launch date the US is still on daylight saving time, so New York is UTC-4 and Los Angeles is UTC-7. This is exactly where most countdown pages go wrong: they print a fixed UTC-5 offset and quietly give you the wrong hour.',
    },
    {
      title: 'Is the countdown on my time or on server time?',
      description:
        'Both. Every timer shows the target in UTC+8 (the ZZZ server clock) and in your own browser time zone, so you never have to do the arithmetic yourself.',
    },
    {
      title: 'When does Phase 2 start?',
      description:
        'The Phase I Signal Search channels run until 2026/11/11 11:59 (server time), so Phase II starts at 12:00 server time the same day. Severian and the Phase II reruns arrive with it.',
    },
    {
      title: 'When does Version 3.3 end?',
      description:
        '2026/12/02 06:00 (UTC+8). The official update announcement states that Version 3.3 runs 42 days and ends at that time, which is also when the store discounts finish and the next version is expected.',
    },
    {
      title: 'Can I play on mobile while the pre-download runs?',
      description:
        'No. The official notice states that mobile users cannot play during the pre-download, while PC, PS5 and Xbox players can keep playing.',
    },
    {
      title: 'How do I claim the Polychrome x300 compensation?',
      description:
        'You needed Inter-Knot Lv. 4 before 2026/10/21 06:00 (UTC+8) to qualify. The reward arrives by in-game mail after the update and has to be claimed before the end of Version 3.3; the mail itself expires after 30 days.',
    },
    {
      title: 'Is the 3.3 livestream code still valid?',
      description:
        'No. The Special Program code expired on October 11 at 23:59:59 (UTC+8). Each version has its own program and its own code, so check the date next to the code before you try it.',
    },
    {
      title: 'Why do some sites say October 20 and others say October 21?',
      description:
        'They are describing the same moment in different time zones. HoYoverse lists the update as October 21 (UTC+8, the server clock), while in the US the same instant falls on October 20 at 23:00 EDT. This page shows both, and also separates the maintenance start (10-21 06:00 UTC+8) from the estimated go-live moment (10-21 11:00 UTC+8).',
    },
  ],
  releaseTime: [
    {
      title: 'Which time zone does HoYoverse use?',
      description:
        'All official ZZZ notices are written in UTC+8, the same clock the game servers run on. "Server time" in an official notice therefore means UTC+8.',
    },
    {
      title: 'Why is the launch shown as both October 20 and October 21?',
      description:
        'The official date is October 21 on the UTC+8 server clock. In North America the same moment is October 20 at 23:00 EDT, which is why several English sites print October 20. Neither is wrong, they are just using different clocks.',
    },
    {
      title: 'Does daylight saving time change the answer?',
      description:
        'Not during Version 3.3. The US leaves daylight saving time in early November and the EU leaves it in late October, so by the Phase II window in November the offsets shift again. The Phase I and Phase II conversions on this page use the offsets in effect on those dates.',
    },
    {
      title: 'Why does the maintenance start time differ from the go-live time?',
      description:
        'The server is closed from 06:00 (UTC+8) while the update is installed. The estimated go-live time adds the "about five hours" that HoYoverse quotes for the maintenance itself.',
    },
  ],
  banners: [
    {
      title: 'Does the guaranteed-signal counter carry over between the 3.3 channels?',
      description:
        'Between Exclusive Channels, yes. The official Phase I notice states that the search count for guaranteed signals is cumulative across all Exclusive Channels, and that it is independent of other types of channels. Limited S-Rank Agents and W-Engines featured in those channels do not appear in the Star-Studded Cast Stable Channel.',
    },
    {
      title: 'Why do different sites show the banner ending a day apart?',
      description:
        'Usually a server-time versus local-date difference. The Phase I channels end at 2026/11/11 11:59 server time, which is still November 11 in UTC+8 but already late on November 10 for some readers in the Americas.',
    },
    {
      title: 'Is Phase 2 confirmed?',
      description:
        'The Phase II lineup and window were published in the 3.3 Intel Report after the Special Program on October 9. The exact Phase II end time is listed as an estimate on this page until the official Phase II notice is published.',
    },
    {
      title: 'Should I pull in Phase I or save for Phase II?',
      description:
        'That is a resource decision rather than a countdown fact, so this site does not make the call for you. What we can tell you is the deadline: Phase I closes at 2026/11/11 11:59 server time and Phase II closes at the end of the 3.3 banner cycle.',
    },
  ],
  preDownload: [
    {
      title: 'How much space do I need?',
      description:
        'About 6 GB on PC, 5 GB on mobile, 14 GB on PS5 and 21 GB on Xbox Series X|S. Installed voice packs change the number, and the official notice asks you to make sure the device has sufficient space and to use Wi-Fi.',
    },
    {
      title: 'Can I keep playing during the download?',
      description:
        'On PC, PS5 and Xbox, yes. On mobile, no: the official notice states that mobile users will not be able to play the game during the pre-download.',
    },
    {
      title: 'What if I missed the pre-download window?',
      description:
        'The 3.3 pre-download closed at 2026/10/21 05:50 (UTC+8), a few minutes before maintenance started. Every version ships the same pattern, so the practical answer for the next version is to start the download as soon as the notice appears.',
    },
    {
      title: 'Do I need a specific account level for the compensation?',
      description:
        'Yes, Inter-Knot Lv. 4 before 2026/10/21 06:00 (UTC+8). Without it the Polychrome x300 server update compensation is not issued.',
    },
  ],
};

export const milestoneById = (id: string) => milestones.find((m) => m.id === id);
export const sourceById = (id: string) => sources.find((s) => s.id === id);
