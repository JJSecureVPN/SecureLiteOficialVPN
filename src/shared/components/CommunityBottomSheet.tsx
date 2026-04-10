import { memo } from 'react';
import { useTranslation } from '@/i18n';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { BottomSheet } from './BottomSheet';
import '@/styles/components/community-bottom-sheet.css';

interface CommunityBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityBottomSheet = memo(function CommunityBottomSheet({
  isOpen,
  onClose,
}: CommunityBottomSheetProps) {
  const { t } = useTranslation();

  const handleLinkClick = (url: string) => {
    const sdk = getSdk();
    if (sdk && sdk.android && typeof sdk.android.openExternalUrl === 'function') {
      sdk.android.openExternalUrl(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const communityLinks = [
    {
      id: 'whatsapp-community',
      title: t('menu.communityWhatsappTitle'),
      subtitle: t('menu.communityWhatsappSubtitle'),
      icon: 'fa-whatsapp',
      url: 'https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja',
      className: 'community-card--whatsapp',
    },
    {
      id: 'whatsapp-channel',
      title: t('menu.communityWhatsappChannelTitle'),
      subtitle: t('menu.communityWhatsappChannelSubtitle'),
      icon: 'fa-whatsapp',
      url: 'https://whatsapp.com/channel/0029Vb5f328C1Fu5xIVfLx2U',
      className: 'community-card--whatsapp',
    },
    {
      id: 'telegram-channel',
      title: t('menu.communityTelegramTitle'),
      subtitle: t('menu.communityTelegramSubtitle'),
      icon: 'fa-telegram',
      url: 'https://t.me/JHServicesChannel',
      className: 'community-card--telegram',
    },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('menu.communityTitle')}
      subtitle={t('menu.communitySubtitle')}
      icon={<i className="fa fa-users" />}
      height="70vh"
      className="community-bs"
    >
      <div className="community-links">
        {communityLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`community-card ${link.className}`}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(link.url);
            }}
          >
            <div className="community-card__icon">
              <i className={`fa-brands ${link.icon}`} />
            </div>
            <div className="community-card__info">
              <h3 className="community-card__title">{link.title}</h3>
              <p className="community-card__subtitle">{link.subtitle}</p>
            </div>
            <div className="community-card__arrow">
              <i className="fa fa-chevron-right" />
            </div>
          </a>
        ))}
      </div>
    </BottomSheet>
  );
});
