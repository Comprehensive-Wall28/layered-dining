'use client';

import { useState, useEffect } from 'react';
import styles from './inventory.module.css';

interface InventoryItem {
    _id: string;
    name: string;
    quantity: number;
    unit: string;
    supplier?: string;
    expirationDate?: string;
    status: 'Safe to Consume' | 'Expired' | 'Expires soon';
}

interface FormData {
    name: string;
    quantity: number;
    unit: string;
    supplier: string;
    expirationDate: string;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchName, setSearchName] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState(10);
    const [showLowStock, setShowLowStock] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        quantity: 0,
        unit: 'kg',
        supplier: '',
        expirationDate: '',
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    };

    const getAuthHeader = (): Record<string, string> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchItems = async (status: string = '', name: string = '') => {
        try {
            setLoading(true);
            const baseUrl = `${getApiUrl()}/api/v1/inventory`;
            let url = baseUrl;
            const params = new URLSearchParams();
            
            if (status) params.append('status', status);
            if (name) params.append('name', name);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                headers: getAuthHeader()
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch items: ${response.statusText}`);
            }
            
            const data = await response.json();
            setItems(data.items || []);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching items');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchItems(filterStatus, searchName);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: FormData) => ({
            ...prev,
            [name]: name === 'quantity' ? (parseFloat(value) || 0) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!formData.name || formData.quantity < 0) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const baseUrl = `${getApiUrl()}/api/v1/inventory`;
            const url = editingId ? `${baseUrl}/${editingId}` : baseUrl;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Failed to save item: ${response.statusText}`);
            }

            await fetchItems(filterStatus, searchName);
            resetForm();
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error saving item');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: InventoryItem) => {
        setFormData({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            supplier: item.supplier || '',
            expirationDate: item.expirationDate ? item.expirationDate.split('T')[0] : '',
        });
        setEditingId(item._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            setLoading(true);
            const baseUrl = `${getApiUrl()}/api/v1/inventory`;
            const response = await fetch(`${baseUrl}/${id}`, { 
                method: 'DELETE',
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`Failed to delete item: ${response.statusText}`);
            }

            await fetchItems(filterStatus, searchName);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deleting item');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityUpdate = async (id: string, change: number) => {
        try {
            setLoading(true);
            const baseUrl = `${getApiUrl()}/api/v1/inventory`;
            const response = await fetch(`${baseUrl}/${id}/quantity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ quantityChange: change })
            });

            if (!response.ok) {
                throw new Error(`Failed to update quantity: ${response.statusText}`);
            }

            await fetchItems(filterStatus, searchName);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error updating quantity');
        } finally {
            setLoading(false);
        }
    };

    const handleLowStock = async () => {
        try {
            setLoading(true);
            const baseUrl = `${getApiUrl()}/api/v1/inventory`;
            const response = await fetch(`${baseUrl}/report/low-stock?threshold=${lowStockThreshold}`, {
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch low stock items: ${response.statusText}`);
            }
            
            const data = await response.json();
            setItems(data.items || []);
            setShowLowStock(true);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching low stock items');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            quantity: 0,
            unit: 'kg',
            supplier: '',
            expirationDate: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    const getStatusBadgeClass = (status: string): string => {
        switch (status) {
            case 'Safe to Consume':
                return styles.statusSafe;
            case 'Expires soon':
                return styles.statusSoon;
            case 'Expired':
                return styles.statusExpired;
            default:
                return '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Inventory Management</h1>
                <button 
                    className={styles.addBtn}
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                >
                    + Add Item
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.filterSection}>
                <div className={styles.filterGroup}>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchName(e.target.value)}
                        className={styles.searchInput}
                    />
                    <select 
                        value={filterStatus}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                        className={styles.select}
                    >
                        <option value="">All Statuses</option>
                        <option value="Safe to Consume">Safe to Consume</option>
                        <option value="Expires soon">Expires Soon</option>
                        <option value="Expired">Expired</option>
                    </select>
                    <button 
                        className={styles.searchBtn}
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        Search
                    </button>
                </div>

                <div className={styles.filterGroup}>
                    <input
                        type="number"
                        placeholder="Low stock threshold"
                        value={lowStockThreshold}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                        min="1"
                        className={styles.numberInput}
                    />
                    <button 
                        className={styles.lowStockBtn}
                        onClick={handleLowStock}
                        disabled={loading}
                    >
                        Show Low Stock
                    </button>
                    {showLowStock && (
                        <button 
                            className={styles.clearBtn}
                            onClick={() => {
                                setShowLowStock(false);
                                fetchItems();
                            }}
                        >
                            Show All
                        </button>
                    )}
                </div>
            </div>

            {showForm && (
                <div className={styles.formContainer}>
                    <div className={styles.formCard}>
                        <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Item Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Tomatoes"
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Unit</label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="liters">liters</option>
                                        <option value="pieces">pieces</option>
                                        <option value="packs">packs</option>
                                        <option value="boxes">boxes</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Supplier</label>
                                <input
                                    type="text"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Local Farm"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Expiration Date</label>
                                <input
                                    type="date"
                                    name="expirationDate"
                                    value={formData.expirationDate}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button 
                                    type="submit" 
                                    className={styles.submitBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                </button>
                                <button 
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading && !showForm ? (
                <div className={styles.loading}>Loading...</div>
            ) : items.length === 0 ? (
                <div className={styles.empty}>
                    <p>No items found</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                                <th>Supplier</th>
                                <th>Expiration Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: InventoryItem) => (
                                <tr key={item._id}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unit}</td>
                                    <td>{item.supplier || '-'}</td>
                                    <td>
                                        {item.expirationDate 
                                            ? new Date(item.expirationDate).toLocaleDateString() 
                                            : '-'}
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusBadgeClass(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button 
                                            className={styles.decreaseBtn}
                                            onClick={() => handleQuantityUpdate(item._id, -1)}
                                            disabled={loading}
                                            title="Decrease by 1"
                                        >
                                            −
                                        </button>
                                        <button 
                                            className={styles.increaseBtn}
                                            onClick={() => handleQuantityUpdate(item._id, 1)}
                                            disabled={loading}
                                            title="Increase by 1"
                                        >
                                            +
                                        </button>
                                        <button 
                                            className={styles.editBtn}
                                            onClick={() => handleEdit(item)}
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(item._id)}
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
