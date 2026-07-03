import { NewsletterFields } from "./types";

export const defaultNewsletterFields: NewsletterFields = {
  theme: "modern",

  // Visibility toggles
  hideHeader: false,
  hideEditor: false,
  hideTopAd: false,
  hideLeadStory: false,
  hideHotTakes: false,
  hideColumns: false,
  hideBottomAd: false,
  hidePollSection: false,
  hideFooter: false,

  // Custom sections sequence order
  sectionsOrder: ["editor", "topAd", "leadStory", "hotTakes", "columns", "bottomAd", "poll"],

  // Header
  signupText: "Sign Up",
  signupUrl: "https://www.hr.com/en?t=/CustomCode/hr/subscribe/epubs",
  headerTitle: "HCM Sales and Marketing Excellence Bi-Weekly",
  headerSubtitle: "Trends, intel, and strategies for HR marketers and sellers",
  headerImg: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/header-newsletter-700x100.jpg",
  headerImgAlt: "illustration of diverse professionals",
  dateText: "June 22, 2026",

  // Editor's Note
  editorSalutation: "Dear __FIRST_NAME__,",
  editorParagraphs: `In this edition of HCM Sales and Marketing Excellence, we're exploring how data-driven decision-making is reshaping the HR technology market and influencing buyer priorities.

In today’s issue, our Guest Editor breaks down the 5 market forces making data-driven HR a top priority for buyers, revealing exactly how HR tech providers and consultants can capitalize on this strategic shift.

Alongside this feature, you'll find fresh marketing perspectives from leading B2B experts, practical ways to use AI in sales, new HR research, and award opportunities. Also, don’t forget to cast your vote in our weekly poll on what's currently stalling your HR tech deals.

Let's dive in!`,
  topAdImg: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/June/hr-in-retail-virtual-event-300x250.jpg",
  topAdUrl: "https://web.hr.com/ui9j8",
  topAdAlt: "Reach Retail HR Buyers Eager for Solutions - HR in Retail Virtual Event - Sep 23, 2026 - Sponsor Info",

  // Lead Story
  leadTitleLabel: "Lead Story",
  leadImg: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/June/lead-story-700x100-2026-06-22.jpg",
  leadStoryTitle: "5 Market Forces Making Data-Driven HR a Top Priority for Buyers",
  leadStoryAuthor: "By Parul Gupta, Social media and community manager at HR.com",
  leadStoryParagraphs: `Decision-making based on data is no longer a new trend in HR; it is quickly turning into a must-have for businesses.

Facing rising pressure to boost workforce productivity, enhance retention rates, skills forecasting, and provide the best experience for employees, HR executives are forced to make more strategic choices using hard evidence instead of gut feeling. The result is the emergence of a major market opportunity for HR tech providers, consultants, and service firms.`,
  leadStoryButtonText: "READ ARTICLE →",
  leadStoryButtonUrl: "https://web.hr.com/jhnbk",

  // Hot Marketing Takes
  hotTakesTitleLabel: "Hot Marketing Takes",
  hotTakesImg: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/April/hot-marketing-takes-700x100-2.jpg",
  hotTakesParagraphs: `The latest B2B marketing landscape is shifting, and recent podcasts are highlighting the need for commercial impact and stronger agency partnerships. The B2B Marketing Podcast recently released three essential episodes. Episode 218 features Harry Davies from Sage, who discusses the truth about agency relationships, covering red flags and how to avoid drift. Episode 215 explores the tension between creativity and commercial impact with the “UK Agency of the Year,” Omne. Additionally, Episode 213 dives into "Best Answer Marketing" with Lee Odden of TopRank Marketing, emphasizing trust, buying groups, and the impact of AI-driven content overload. These discussions offer practical frameworks for marketers seeking to drive stronger results in an increasingly complex market.

In addition to these strategic discussions, practical application is essential. The Exit Five Live session showcases “B2B Ad Campaigns That Actually Worked,” featuring five demand gen marketers sharing their real-world results. Presenters break down specific campaigns, ranging from an $8K influencer campaign that generated $700K in pipeline to effective multi-channel signal-based targeting and conference plays that achieved significant ROI. These sessions provide actionable, data-backed examples that marketing professionals can implement to optimize their own demand generation strategies without relying solely on theoretical advice.`,

  // Column Section - Dynamic Spotlight Cards
  spotlightCards: [
    {
      id: "podcast",
      label: "Podcast Spotlight",
      title: "Spilling the Tea on HR Tech",
      img: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/March/podcast-spotlight-350x70.jpg",
      content: "A modern outlook on the latest innovations, trends, and disruptions in the HR software workspace.",
      buttonText: "WATCH NOW ▶",
      buttonUrl: "https://web.hr.com/74xtq",
      badgeClass: "badge-podcast"
    },
    {
      id: "marketingWebcast",
      label: "Marketing Webcast",
      title: "The Top 10 Ways to Use AI for Sales",
      img: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/marketing-webcast-350x70.jpg",
      content: "Master sales intelligence, automated personalization, and high-impact lead scoring models using AI.",
      buttonText: "VIEW NOW ▶",
      buttonUrl: "https://web.hr.com/ebcl",
      badgeClass: "badge-webcast"
    },
    {
      id: "hrWebcast",
      label: "HR Webcast",
      title: "How to Hire Frontline Workers at Scale Without Losing the Human Touch",
      img: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/March/hr-webcast-350x70.jpg",
      content: "Insights from HR.com's State of Frontline and Volume Hiring Research. Maintain the crucial human touch at scale.",
      buttonText: "WATCH NOW ▶",
      buttonUrl: "https://web.hr.com/j1eka",
      badgeClass: "badge-webcast"
    },
    {
      id: "research",
      label: "Featured HR Research",
      title: "HR.com's Future of Human Experience",
      img: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/March/featured-research-350x70.jpg",
      content: "Organizations that deliver strong employee experiences see higher engagement, productivity, innovation, and business performance. Yet only 41% achieve this level. What differentiates these high-performing organizations from the rest?",
      buttonText: "DOWNLOAD REPORT →",
      buttonUrl: "https://web.hr.com/q2g6",
      badgeClass: "badge-research"
    },
    {
      id: "winners",
      label: "Award Winners",
      title: "Award Winners Announced for Advancing Employee Experience in 2026",
      img: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/hr-com-awards-2-350x70.jpg",
      content: "HR.com honors innovative solutions and leaders who are redefining how organizations engage, support, and empower employees to drive stronger engagement and retention.",
      buttonText: "SEE WINNERS »",
      buttonUrl: "https://www.hr.com/en/about_us/hr_com_press_releases/award-winners-announced-for-advancing-employee-exp_mnqddkpv.html",
      badgeClass: "badge-winners"
    }
  ],

  // 6. HR.com Awards
  awardsLabel: "HR.com Awards",
  awardsSectionTitle: "Nominate Your Solution for an HR.com Award:",
  awardsList: [
    {
      name: "Best HR Solution for Retail Business Award",
      deadline: "Deadline: July 23",
      buttonText: "APPLY NOW »",
      buttonUrl: "https://web.hr.com/swvju"
    },
    {
      name: "Best Pay Equity & Transparency Platform",
      deadline: "Deadline: August 14",
      buttonText: "APPLY NOW »",
      buttonUrl: "https://web.hr.com/c6p0"
    },
    {
      name: "Best HR Solution for Small Business Award",
      deadline: "Deadline: August 28",
      buttonText: "NOMINATE NOW »",
      buttonUrl: "https://web.hr.com/j1h4u"
    }
  ],
  awardsPositionIndex: 5,

  // Bottom Ad
  bottomAdImg: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/June/hrcom-state-of-frontline-and-volume-hiring-300x250.png",
  bottomAdUrl: "https://web.hr.com/6hei",
  bottomAdAlt: "Want to Be HR's Hiring Solution? - HR.com's State of Frontline and Volume Hiring Virtual Event - October 7, 2026 - Become a Sponsor",

  // Poll
  pollTitle: "Poll Of The Week",
  pollQuestion: "What is currently the biggest blocker in selling HR tech?",
  pollChoices: [
    { text: "A. Budget freezes / cost scrutiny", url: "https://forms.gle/SD14BCZZtRotbp1q9" },
    { text: "B. Too many similar vendor options", url: "https://forms.gle/SD14BCZZtRotbp1q9" },
    { text: "C. Long procurement cycles", url: "https://forms.gle/SD14BCZZtRotbp1q9" },
    { text: "D. Internal stakeholder misalignment", url: "https://forms.gle/SD14BCZZtRotbp1q9" }
  ],
  pollChoice1: "A. Budget freezes / cost scrutiny",
  pollChoice1Url: "https://forms.gle/SD14BCZZtRotbp1q9",
  pollChoice2: "B. Too many similar vendor options",
  pollChoice2Url: "https://forms.gle/SD14BCZZtRotbp1q9",
  pollChoice3: "C. Long procurement cycles",
  pollChoice3Url: "https://forms.gle/SD14BCZZtRotbp1q9",
  pollChoice4: "D. Internal stakeholder misalignment",
  pollChoice4Url: "https://forms.gle/SD14BCZZtRotbp1q9",

  // Forward Email
  forwardTextContent: `Was this email forwarded to you?
Subscribe to the HCM Sales and Marketing Excellence Newsletter
(Just log in with your free HR.com account)`,

  // Footer
  footerFacebookUrl: "https://www.facebook.com/hrdotcom",
  footerLinkedinUrl: "https://www.linkedin.com/company/hrdotcom",
  footerInstagramUrl: "https://www.instagram.com/hrdotcom",
  footerYoutubeUrl: "https://www.youtube.com/hrcomonline",
  footerTwitterUrl: "https://twitter.com/hrdotcom",
  footerClosingText: "Thanks for reading! See you in 2 weeks with more stories and insights that matter to HR Sales and Marketing leaders.",
  footerSubscribeText: "SUBSCRIBE TO OUR OTHER NEWSLETTERS",
  footerSubscribeUrl: "http://hr.com/newslettersubscription",
  footerUnsubscribeUrl: "https://www.hr.com/en?t=/CustomCode/hr/subscribe/sub.campaign.7&cid1=__CUSTOMER_ID__&cid2=1391791205566",
  footerManageSubscriptionUrl: "https://web.hr.com/95bh?uid=__CUSTOMER_ID__",
  footerAdvertiseUrl: "https://www.hr.com/en/about_us/advertise/epublications_joerjbm9.html",
  footerPrivacyPolicyUrl: "https://www.hr.com/en/about_us/privacy_information/",
  footerContactUsUrl: "mailto:info@hr.com?subject=Contact+Us:+HR+Excellence+Newsletter",
  footerCopyrightText: "Copyright 2026, All Rights Reserved. HR.com Limited. 56 Malone Road, Jackson’s Point, ON, Canada, L0E 1L0",
  footerDisclaimerText: "This email account is not monitored. Please do not reply to this email."
};
