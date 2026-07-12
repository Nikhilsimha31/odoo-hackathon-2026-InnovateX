import { useState, useEffect, type FormEvent } from 'react';
import styles from './Forms.module.css';

interface Category {
  id: string;
  name: string;
}

interface RegisterAssetFormProps {
  onSuccess: () => void;
}

export default function RegisterAssetForm({ onSuccess }: RegisterAssetFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, categoryId })
      });
      
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to register asset", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Asset Name</label>
        <input 
          className={styles.input}
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          placeholder="e.g. MacBook Pro M3"
          required
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Category</label>
        <select 
          className={styles.select}
          value={categoryId} 
          onChange={e => setCategoryId(e.target.value)}
          required
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Registering...' : 'Register Asset'}
      </button>
    </form>
  );
}
