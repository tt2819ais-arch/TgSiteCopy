import { useState } from 'react';
import styles from './GiftSendModal.module.css';
import { Modal } from '@/components/UI/Modal/Modal';
import { Button } from '@/components/UI/Button/Button';
import useGiftStore from '@/store/giftStore';
import useUIStore from '@/store/uiStore';
import { formatPrice } from '@/utils/formatters';
import type { Gift } from '@/types/gift';

interface GiftSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  gift: Gift;
  toUserId: string;
  toUsername: string;
}

export function GiftSendModal({ isOpen, onClose, gift, toUserId, toUsername }: GiftSendModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const sendGift = useGiftStore((s) => s.sendGift);
  const addToast = useUIStore((s) => s.addToast);

  const handleSend = async () => {
    setSending(true);
    try {
      await sendGift(gift.id, toUserId, message || undefined);
      addToast(`Подарок отправлен пользователю ${toUsername}`, 'success');
      onClose();
    } catch {
      addToast('Не удалось отправить подарок', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Отправить подарок"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button variant="primary" loading={sending} onClick={handleSend}>
            Отправить за {formatPrice(gift.price)}
          </Button>
        </>
      }
    >
      <div className={styles.content}>
        <div className={styles.giftPreview}>
          <img src={gift.image} alt={gift.name} className={styles.giftImage} />
          <div className={styles.giftInfo}>
            <span className={styles.giftName}>{gift.name}</span>
            <span className={styles.giftPrice}>{formatPrice(gift.price)}</span>
          </div>
        </div>

        <div className={styles.recipient}>
          <span className={styles.recipientLabel}>Получатель</span>
          <span className={styles.recipientName}>@{toUsername}</span>
        </div>

        <div className={styles.messageField}>
          <label className={styles.messageLabel}>Сообщение (необязательно)</label>
          <textarea
            className={styles.messageInput}
            placeholder="Напишите сообщение..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
}

export default GiftSendModal;
