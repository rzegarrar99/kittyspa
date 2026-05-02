// 🚀 MIGRACIÓN A FIREBASE: 
// Este es el ÚNICO archivo donde cambiaremos la lógica de datos.
// Reemplazaremos getStorage/setStorage por getDocs, addDoc, updateDoc, deleteDoc de 'firebase/firestore'.
// Las firmas de las funciones (getAll, create, etc.) se mantendrán EXACTAMENTE IGUAL.

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback seguro para entornos sin HTTPS estricto
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export class BaseService<T extends { id: string }> {
  protected collectionName: string;
  protected initialData: T[];

  constructor(collectionName: string, initialData: T[] = []) {
    this.collectionName = collectionName;
    this.initialData = initialData;
  }

  // --- MOCK LOCALSTORAGE (A ELIMINAR EN FASE FIREBASE) ---
  protected getStorage(): T[] {
    const stored = localStorage.getItem(this.collectionName);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(this.collectionName, JSON.stringify(this.initialData));
    return this.initialData;
  }

  protected setStorage(data: T[]): void {
    localStorage.setItem(this.collectionName, JSON.stringify(data));
  }
  // -------------------------------------------------------

  async getAll(): Promise<T[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simula latencia de red
    return this.getStorage();
  }

  async getById(id: string): Promise<T | undefined> {
    const data = await this.getAll();
    return data.find(item => item.id === id);
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newItem = { 
      ...item, 
      id: generateId(),
      created_at: new Date().toISOString() 
    } as unknown as T;
    
    const data = this.getStorage();
    this.setStorage([newItem, ...data]);
    return newItem;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = this.getStorage();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) throw new Error(`Documento con id ${id} no encontrado en ${this.collectionName}`);
    
    const updatedItem = { ...data[index], ...updates };
    data[index] = updatedItem;
    this.setStorage(data);
    return updatedItem;
  }

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = this.getStorage();
    this.setStorage(data.filter(item => item.id !== id));
  }
}
