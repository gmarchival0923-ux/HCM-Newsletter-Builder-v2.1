export interface AwardItem {
  name: string;
  deadline: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl?: string;
}

export interface SpotlightCard {
  id: string;
  label: string;
  title: string;
  img: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  badgeClass?: string;
}

export interface NewsletterFields {
  // Theme selection
  theme: "modern" | "legacy";

  // Visibility toggles
  hideHeader?: boolean;
  hideEditor?: boolean;
  hideTopAd?: boolean;
  hideLeadStory?: boolean;
  hideHotTakes?: boolean;
  hideColumns?: boolean;
  hideBottomAd?: boolean;
  hidePollSection?: boolean;
  hideFooter?: boolean;

  // Custom sections sequence order
  sectionsOrder?: string[];

  // Header
  signupText: string;
  signupUrl: string;
  headerTitle: string;
  headerSubtitle: string;
  headerImg: string;
  headerImgAlt: string;
  dateText: string;

  // Editor's Note
  editorSalutation: string;
  editorParagraphs: string;
  topAdImg: string;
  topAdUrl: string;
  topAdAlt: string;

  // Lead Story
  leadTitleLabel: string;
  leadImg: string;
  leadStoryTitle: string;
  leadStoryAuthor: string;
  leadStoryParagraphs: string;
  leadStoryButtonText: string;
  leadStoryButtonUrl: string;

  // Hot Marketing Takes
  hotTakesTitleLabel: string;
  hotTakesImg: string;
  hotTakesParagraphs: string;

  // Column Section - Dynamic Spotlight Cards
  spotlightCards: SpotlightCard[];

  // 6. HR.com Awards
  awardsLabel: string;
  awardsSectionTitle: string;
  awardsList: AwardItem[];
  awardsPositionIndex?: number;

  // Bottom Ad
  bottomAdImg: string;
  bottomAdUrl: string;
  bottomAdAlt: string;

  // Poll
  pollTitle: string;
  pollQuestion: string;
  pollChoices?: { text: string; url: string; }[];
  pollChoice1: string;
  pollChoice1Url: string;
  pollChoice2: string;
  pollChoice2Url: string;
  pollChoice3: string;
  pollChoice3Url: string;
  pollChoice4: string;
  pollChoice4Url: string;

  // Forward Email
  forwardTextContent: string;

  // Footer
  footerFacebookUrl: string;
  footerLinkedinUrl: string;
  footerInstagramUrl: string;
  footerYoutubeUrl: string;
  footerTwitterUrl: string;
  footerClosingText: string;
  footerSubscribeText: string;
  footerSubscribeUrl: string;
  footerUnsubscribeUrl: string;
  footerManageSubscriptionUrl: string;
  footerAdvertiseUrl: string;
  footerPrivacyPolicyUrl: string;
  footerContactUsUrl: string;
  footerCopyrightText: string;
  footerDisclaimerText: string;
}
