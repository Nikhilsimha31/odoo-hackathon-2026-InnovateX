import { useState, useEffect, type FormEvent } from 'react';
import styles from './Forms.module.css';

interface Category {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface RegisterAssetFormProps {
  onSuccess: () => void;
}

export default function RegisterAssetForm({ onSuccess }: RegisterAssetFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [usefulLifeYears, setUsefulLifeYears] = useState('5');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch(err => console.error("Failed to load categories", err));

    fetch('http://localhost:3000/api/departments')
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
      })
      .catch(err => console.error("Failed to load departments", err));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) return;
    
    setLoading(true);
    try {
      const body: Record<string, string> = { name, categoryId };
      if (acquisitionCost) body.acquisitionCost = acquisitionCost;
      if (usefulLifeYears) body.usefulLifeYears = usefulLifeYears;
      if (departmentId) body.departmentId = departmentId;

      const response = await fetch('http://localhost:3000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
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
        <label className={styles.label}>Asset Name *</label>
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
        <label className={styles.label}>Category *</label>
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

      <div className={styles.formGroup}>
        <label className={styles.label}>Assign to Department</label>
        <select 
          className={styles.select}
          value={departmentId} 
          onChange={e => setDepartmentId(e.target.value)}
        >
          <option value="">— No Department —</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Acquisition Cost (₹)</label>
          <input 
            className={styles.input}
            type="number" 
            min="0"
            value={acquisitionCost} 
            onChange={e => setAcquisitionCost(e.target.value)}
            placeholder="e.g. 150000"
          />
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Useful Life (Years)</label>
          <select 
            className={styles.select}
            value={usefulLifeYears} 
            onChange={e => setUsefulLifeYears(e.target.value)}
          >
            <option value="3">3 years</option>
            <option value="5">5 years</option>
            <option value="7">7 years</option>
            <option value="10">10 years</option>
          </select>
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Registering...' : 'Register Asset'}
      </button>
    </form>
  );
}
