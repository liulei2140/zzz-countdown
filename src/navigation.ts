import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Countdown',
      href: getPermalink('/'),
    },
    {
      text: 'Release Time',
      href: getPermalink('/release-time'),
    },
    {
      text: 'Banners',
      href: getPermalink('/banners'),
    },
    {
      text: 'Pre-Download',
      href: getPermalink('/pre-download'),
    },
    {
      text: "What's New",
      href: getPermalink('/whats-new'),
    },
    {
      text: 'Versions',
      links: [
        {
          text: 'Version history',
          href: getPermalink('/versions'),
        },
        {
          text: 'Sources',
          href: getPermalink('/sources'),
        },
        {
          text: 'About',
          href: getPermalink('/about'),
        },
        {
          text: 'Contact',
          href: getPermalink('/contact'),
        },
      ],
    },
  ],
  actions: [{ text: 'Official 3.3 notice', href: 'https://www.hoyolab.com/article/47149468', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: 'Version 3.3',
      links: [
        { text: 'Countdown', href: getPermalink('/') },
        { text: 'Release time by time zone', href: getPermalink('/release-time') },
        { text: 'Banners and phase timers', href: getPermalink('/banners') },
        { text: 'Pre-download sizes', href: getPermalink('/pre-download') },
        { text: "What's new in 3.3", href: getPermalink('/whats-new') },
      ],
    },
    {
      title: 'Official sources',
      links: [
        { text: 'Pre-Download & Update Notice', href: 'https://www.hoyolab.com/article/47130875', target: '_blank' },
        { text: 'Update Announcement', href: 'https://www.hoyolab.com/article/47149468', target: '_blank' },
        { text: 'Phase I channels', href: 'https://www.hoyolab.com/article/47131668', target: '_blank' },
        { text: 'Intel Report', href: 'https://www.hoyolab.com/article/47023957', target: '_blank' },
        { text: 'Official press release', href: 'https://www.hoyoverse.com/en-us/news/166759', target: '_blank' },
      ],
    },
    {
      title: 'This site',
      links: [
        { text: 'Version history', href: getPermalink('/versions') },
        { text: 'Sources and verification log', href: getPermalink('/sources') },
        { text: 'About', href: getPermalink('/about') },
        { text: 'Editorial policy', href: getPermalink('/editorial-policy') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
    { text: 'Editorial Policy', href: getPermalink('/editorial-policy') },
    { text: 'Contact', href: getPermalink('/contact') },
  ],
  socialLinks: [
    { ariaLabel: 'HoYoLAB', icon: 'tabler:users', href: 'https://www.hoyolab.com/article/47149468', target: '_blank' },
    {
      ariaLabel: 'Zenless Zone Zero wiki',
      icon: 'tabler:book',
      href: 'https://zenless-zone-zero.fandom.com/wiki/Version_3.3',
      target: '_blank',
    },
  ],
  footNote: `
    <a class="text-blue-600 underline dark:text-muted" href="https://www.hoyolab.com/article/47149468">Version 3.3 "Journey to the Sky"</a> launches October 21, 2026. Independent fan site, not affiliated with HoYoverse. Artwork is official HoYoverse material, used for reference.
  `,
};
