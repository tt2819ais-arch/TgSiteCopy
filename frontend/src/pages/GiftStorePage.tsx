import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GiftStorePage.module.css';
import { Header, BackButton } from '@/components/Layout/Header';
import { GiftStoreComponent } from '@/components/Gifts/GiftStore';
import { GiftHistory } from '@/components/Gifts/GiftHistory';
import { Modal } from '@/components/UI/Modal/Modal';
import { Button } from '@/components/UI/Button/Button';
import useGiftStore from '@/store/giftStore';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import { formatPrice, formatBalance } from '@/utils/formatters';
import { classNames } from '@/utils/helpers';

type StoreTab = 'store' | 'my' | 'history';

export function GiftStorePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addToast = useUIStore((s) => s.addToast);
  const buyGift = useGiftStore((s) => s.buyGift);
  const selectedGift = useGiftStore((s) => s.selectedGift);
  const setSelectedGift = useGiftStore((s) => s.setSelectedGift);
  const gifts = useGiftStore((s) => s.gifts);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [activeTab, setActiveTab] = useState<StoreTab>('store');
  const [buying, setBuying] = useState(false);

  const handleSelectGift = (giftId: string) => {
    const gift = gifts.find((g) => g.id === giftId);
    if (gift) setSelectedGift(gift);
  };

  const handleBuy = async () => {
    if (!selectedGift || !user) return;
    if (user.balance < selectedGift.price) {
      addToast('Недостаточно средств', 'error');
      return;
    }
    setBuying(true);
    try {
      await buyGift(selectedGift.id);
      updateUser({ balance: user.balance - selectedGift.price });
      addToast(`Подарок "${selectedGift.name}" куплен!`, 'success');
      setSelectedGift(null);
    } catch {
      addToast('Ошибка покупки', 'error');
    } finally {
      setBuying(false);
    }
  };

  const tabs: { id: StoreTab; label: string }[] = [
    { id: 'store', label: 'Магазин' },
    { id: 'my', label: 'Мои подарки' },
    { id: 'history', label: 'История' },
  ];

  return (
    <div className={styles.page}>
      <Header
        title="Подарки"
        subtitle={user ? `Баланс: ${formatBalance(user.balance)} NYX` : ''}
        leftAction={<BackButton onClick={() => navigate('/')} />}
      />

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={classNames(styles.tab, activeTab === tab.id && styles.activeTab)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'store' && (
          <GiftStoreComponent onSelectGift={handleSelectGift} />
        )}
        {activeTab === 'my' && (
          <div className={styles.myGifts}>
            <p className={styles.placeholder}>Ваши подарки будут отображаться здесь</p>
          </div>
        )}
        {activeTab === 'history' && <GiftHistory />}
      </div>

      {/* Buy modal */}
      <Modal
        isOpen={!!selectedGift}
        onClose={() => setSelectedGift(null)}
        title="Купить подарок"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedGift(null)}>Отмена</Button>
            <Button variant="primary" loading={buying} onClick={handleBuy}>
              Купить за {selectedGift ? formatPrice(selectedGift.price) : ''}
            </Button>
          </>
        }
      >
        {selectedGift && (
          <div className={styles.buyContent}>
            <img src={selectedGift.image} alt={selectedGift.name} className={styles.buyImage} />
            <div className={styles.buyInfo}>
              <span className={styles.buyName}>{selectedGift.name}</span>
              <span className={styles.buyDescription}>{selectedGift.description}</span>
              <span className={styles.buyPrice}>{formatPrice(selectedGift.price)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default GiftStorePage;
