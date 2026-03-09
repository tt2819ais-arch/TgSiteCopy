import { useEffect, useState } from 'react';
import styles from './GiftManagement.module.css';
import { Button } from '@/components/UI/Button/Button';
import { Input } from '@/components/UI/Input/Input';
import { Modal } from '@/components/UI/Modal/Modal';
import { Spinner } from '@/components/UI/Spinner/Spinner';
import useAdminStore from '@/store/adminStore';
import useUIStore from '@/store/uiStore';
import { RARITY_LABELS, CATEGORY_LABELS, RARITY_COLORS } from '@/utils/constants';
import { formatPrice } from '@/utils/formatters';
import type { CreateGiftPayload, GiftRarity, GiftCategory } from '@/types/gift';

const RARITIES: GiftRarity[] = ['common', 'rare', 'epic', 'legendary'];
const CATEGORIES: GiftCategory[] = ['card', 'collectible', 'decoration', 'special'];

export function GiftManagement() {
  const gifts = useAdminStore((s) => s.gifts);
  const isLoading = useAdminStore((s) => s.isLoading);
  const loadAdminGifts = useAdminStore((s) => s.loadAdminGifts);
  const createGift = useAdminStore((s) => s.createGift);
  const deleteGift = useAdminStore((s) => s.deleteGift);
  const addToast = useUIStore((s) => s.addToast);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateGiftPayload>({
    name: '',
    description: '',
    image: '',
    price: 100,
    rarity: 'common',
    category: 'card',
    isLimited: false,
    maxSupply: undefined,
  });

  useEffect(() => {
    loadAdminGifts();
  }, [loadAdminGifts]);

  const handleCreate = async () => {
    if (!form.name || !form.image) {
      addToast('Заполните все обязательные поля', 'warning');
      return;
    }
    setCreating(true);
    try {
      await createGift(form);
      addToast('Подарок создан', 'success');
      setIsCreateOpen(false);
      setForm({
        name: '', description: '', image: '', price: 100,
        rarity: 'common', category: 'card', isLimited: false,
      });
    } catch {
      addToast('Ошибка создания подарка', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (giftId: string, name: string) => {
    if (!confirm(`Удалить подарок "${name}"?`)) return;
    try {
      await deleteGift(giftId);
      addToast(`Подарок "${name}" удалён`, 'success');
    } catch {
      addToast('Ошибка удаления', 'error');
    }
  };

  const updateForm = (updates: Partial<CreateGiftPayload>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className={styles.management}>
      <div className={styles.header}>
        <h3 className={styles.title}>Подарки ({gifts.length})</h3>
        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
          Создать подарок
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loading}><Spinner size={28} /></div>
      ) : (
        <div className={styles.giftList}>
          {gifts.map((gift) => (
            <div key={gift.id} className={styles.giftItem}>
              <img src={gift.image} alt={gift.name} className={styles.giftImage} />
              <div className={styles.giftInfo}>
                <span className={styles.giftName}>{gift.name}</span>
                <div className={styles.giftMeta}>
                  <span
                    className={styles.rarityTag}
                    style={{ color: RARITY_COLORS[gift.rarity] }}
                  >
                    {RARITY_LABELS[gift.rarity]}
                  </span>
                  <span className={styles.categoryTag}>
                    {CATEGORY_LABELS[gift.category]}
                  </span>
                  <span className={styles.giftPrice}>{formatPrice(gift.price)}</span>
                </div>
              </div>
              <Button size="sm" variant="danger" onClick={() => handleDelete(gift.id, gift.name)}>
                Удалить
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create Gift Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Создать подарок"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Отмена</Button>
            <Button variant="primary" loading={creating} onClick={handleCreate}>Создать</Button>
          </>
        }
      >
        <div className={styles.createForm}>
          <Input
            label="Название"
            placeholder="Название подарка"
            value={form.name}
            onChange={(e) => updateForm({ name: e.target.value })}
          />
          <Input
            label="Описание"
            placeholder="Описание подарка"
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
          />
          <Input
            label="URL изображения"
            placeholder="https://..."
            value={form.image}
            onChange={(e) => updateForm({ image: e.target.value })}
          />
          <Input
            label="Цена (NYX)"
            type="number"
            placeholder="100"
            value={String(form.price)}
            onChange={(e) => updateForm({ price: parseInt(e.target.value, 10) || 0 })}
          />

          <div className={styles.selectRow}>
            <div className={styles.selectField}>
              <label className={styles.selectLabel}>Редкость</label>
              <select
                className={styles.select}
                value={form.rarity}
                onChange={(e) => updateForm({ rarity: e.target.value as GiftRarity })}
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>{RARITY_LABELS[r]}</option>
                ))}
              </select>
            </div>

            <div className={styles.selectField}>
              <label className={styles.selectLabel}>Категория</label>
              <select
                className={styles.select}
                value={form.category}
                onChange={(e) => updateForm({ category: e.target.value as GiftCategory })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.isLimited}
              onChange={(e) => updateForm({ isLimited: e.target.checked })}
            />
            <span>Лимитированный</span>
          </label>

          {form.isLimited && (
            <Input
              label="Макс. количество"
              type="number"
              placeholder="100"
              value={String(form.maxSupply || '')}
              onChange={(e) => updateForm({ maxSupply: parseInt(e.target.value, 10) || undefined })}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default GiftManagement;
