export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface MissionValue {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ChooseUsReason {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ContactInfo {
  address: {
    line1: string;
    line2: string;
    line3: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  support: {
    email: string;
    phone: string;
    chat: string;
  };
}

export interface CTASection {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface VideoSection {
  description: string;
  enabled: boolean;
  thumbnailUrl: string;
  title: string;
  videoUrl: string;
}

export interface AboutUsData {
  storyTitle: string;
  storyText: string[];
  storyImage: string;
  teamTitle: string;
  teamDescription: string;
  teamMembers: TeamMember[];
  missionTitle: string;
  missionDescription: string;
  missionValues: MissionValue[];
  chooseUsTitle: string;
  chooseUsDescription: string;
  chooseUsReasons: ChooseUsReason[];
  contactInfo: ContactInfo;
  ctaSection: CTASection;
  videoSection: VideoSection;
}
