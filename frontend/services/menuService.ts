const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1/menu`;

export interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    ingredients: string[];
    isAvailable: boolean;
    preparationTime?: number;
    tags: string[];
    createdAt?: string;
    updatedAt?: string;
}

export const menuService = {
    getAllMenus: async (): Promise<MenuItem[]> => {
        const response = await fetch(`${API_URL}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch menus');
        const data = await response.json();
        return data.menuItems || [];
    },

    getMenuById: async (id: string): Promise<MenuItem> => {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch menu item');
        const data = await response.json();
        return data.menuItem;
    },

    getMenusByCategory: async (category: string): Promise<MenuItem[]> => {
        const response = await fetch(`${API_URL}/category/${category}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch menus by category');
        const data = await response.json();
        return data.menuItems || [];
    },

    createMenu: async (menuData: Partial<MenuItem>): Promise<MenuItem> => {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(menuData),
            credentials: 'include'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create menu item');
        }
        const data = await response.json();
        return data.menuItem;
    },

    updateMenu: async (id: string, menuData: Partial<MenuItem>): Promise<MenuItem> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(menuData),
            credentials: 'include'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update menu item');
        }
        const data = await response.json();
        return data.menuItem;
    },

    deleteMenu: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to delete menu item');
    }
};
