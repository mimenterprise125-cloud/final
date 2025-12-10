import { useAdmin } from './AdminContext';

export const useSocialLinks = () => {
  const { adminSettings } = useAdmin();

  return {
    communityLinks: adminSettings.community_links || [],
    footerLinks: adminSettings.footer_social_links || [],
  };
};
