.economy {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.statCard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.statValue {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.statLabel {
  font-size: 13px;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .statsGrid {
    grid-template-columns: 1fr 1fr;
  }
}
