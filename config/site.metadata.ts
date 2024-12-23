/** @format */

interface SiteConfig {
  copyWrite: { label: string; link: string };
  social?: {
    twitter: string;
    socialDescription: string;
  };
  website: {
    description: string;
    siteName: string;
    logoTitle: string;
    siteTitle: string;
    siteUrl?: string;
    keywords: string;
    author: string;
    siteCardImage: string;
  };
  links?: {
    [key: string]: string;
  };
}

const SiteMetadata: SiteConfig = {
  copyWrite: { label: "e_labs", link: "https://e-labs.co.uk" },
  social: {
    twitter: "@0xAtion",
    socialDescription: "Redefining Dollar-Cost-Average",
  },
  website: {
    description: "Redefining Dollar-Cost-Average",
    siteName: "ÅTION - The Distributed DCA",
    siteTitle: "ÅTION",
    siteUrl: "https://ation.capital",
    keywords:
      "crypto token ethereum dca dollar cost average protocol DeFi finance decentralised",
    author: "e_labs",
    siteCardImage: "",
    logoTitle: "ÅTION",
  },
  links: {
    home: "https://ation.capital",
    docs: "https://docs.ation.capital",
  },
};

export default SiteMetadata;
