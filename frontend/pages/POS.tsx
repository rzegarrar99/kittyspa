import React, { useState } from 'react';
import { Card, Button, Spinner, Modal, Badge } from '../components/UI';
import { ShoppingCart, User, Sparkles, Trash2, CheckCircle2, Printer, AlertTriangle, Package, MapPin, Wallet, Search, Banknote, CreditCard, Landmark, Plus, Minus, X, UserCheck, QrCode, Gift, Percent } from 'lucide-react';
import { useClients, useServices, useStaff, useOrders, useCashRegisters, useAreas, useInventory, useKardex } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuthStore } from '../stores/authStore';
import { Order, PaymentMethod, PaymentDetail, OrderItem } from '../types';
import { printTicket } from '../utils/exportUtils';
import { KittyIcon } from '../components/KittyIcon';
import { motion, AnimatePresence } from 'framer-motion';

type CartItem = { id: string; name: string; price: number; originalPrice: number; type: 'service' | 'product'; quantity: number; discountType?: 'percentage' | 'fixed' | 'gift'; discountValue?: number };

const PAYMENT_METHODS: { id: PaymentMethod; icon: any; color: string; bg: string; border: string }[] = [
  { id: 'Efectivo', icon: Banknote, color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200 hover:border-green-400' },
  { id: 'Billetera Digital', icon: QrCode, color: 'text-fuchsia-600', bg: 'bg-fuchsia-100', border: 'border-fuchsia-200 hover:border-fuchsia-400' },
  { id: 'Tarjeta', icon: CreditCard, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200 hover:border-blue-400' },
  { id: 'Transferencia', icon: Landmark, color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200 hover:border-orange-400' },
];

const QUICK_CASH = [10, 20, 50, 100, 200];

export const POS: React.FC = () => {
  const { clients = [], loading: loadingClients } = useClients();
  const { services = [], loading: loadingServices } = useServices();
  const { data: inventory = [], updateItem: updateInventory } = useInventory();
  const { addItem: addKardex } = useKardex();
  const { data: areas = [] } = useAreas();
  const { staff = [] } = useStaff();
  const { createOrder } = useOrders();
  const { data: registers = [] } = useCashRegisters();
  const { addToast } = useToast();
  const { settings } = useSettings();
  const { user } = useAuthStore();

  const [selectedClient, setSelectedClient] = useState('WALK_IN');
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [searchService, setSearchService] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('Todos');
  const [selectedProductCategory, setSelectedProductCategory] = useState('Todos');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [completedOrder, setCompletedOrder] = useState<{order: Order, clientName: string, staffName: string, items: CartItem[]} | null>(null);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountItemIndex, setDiscountItemIndex] = useState<number | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'gift'>('percentage');
  const [discountValue, setDiscountValue] = useState('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const activeRegister = registers.find(r => r.status === 'Abierta');

  const serviceCategories = ['Todos', ...Array.from(new Set((services || []).map(s => s.category)))];
  const productCategories = ['Todos', ...Array.from(new Set((inventory || []).map(i => i.category)))];

  const filteredServices = (services || []).filter(s => 
    (selectedServiceCategory === 'Todos' || s.category === selectedServiceCategory) &&
    (s.name || '').toLowerCase().includes(searchService.toLowerCase())
  );
  
  const filteredProducts = (inventory || []).filter(i => 
    i.stock > 0 && 
    (selectedProductCategory === 'Todos' || i.category === selectedProductCategory) &&
    (i.name || '').toLowerCase().includes(searchProduct.toLowerCase())
  );

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const vuelto = Math.max(0, totalPaid - total);
  const hasCashPayment = payments.some(p => p.method === 'Efectivo');
  
  const canConfirmPayment = totalPaid >= total && (vuelto === 0 || hasCashPayment);

  const handleAddToCart = (item: any, type: 'service' | 'product') => {
    const existingIndex = cart.findIndex(c => c.id === item.id && c.type === type && !c.discountType);
    
    if (existingIndex >= 0) {
      if (type === 'product') {
        const invItem = inventory.find(i => i.id === item.id);
        if (invItem && invItem.stock <= cart[existingIndex].quantity) {
          addToast('No hay suficiente stock en almacén.', 'error');
          return;
        }
      }
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        originalPrice: item.price,
        type, 
        quantity: 1 
      }]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    const item = newCart[index];
    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      setCart(cart.filter((_, i) => i !== index));
      return;
    }

    if (item.type === 'product' && delta > 0) {
      const invItem = inventory.find(i => i.id === item.id);
      if (invItem && invItem.stock < newQuantity) {
        addToast('No hay suficiente stock en almacén.', 'error');
        return;
      }
    }

    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  const openDiscountModal = (index: number) => {
    setDiscountItemIndex(index);
    const item = cart[index];
    setDiscountType(item.discountType || 'percentage');
    setDiscountValue(item.discountValue ? item.discountValue.toString() : '');
    setDiscountModalOpen(true);
  };

  const applyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountItemIndex === null) return;

    const newCart = [...cart];
    const item = newCart[discountItemIndex];
    let newPrice = item.originalPrice;

    if (discountType === 'gift') {
      newPrice = 0;
    } else if (discountType === 'percentage') {
      const val = Number(discountValue);
      if (val < 0 || val > 100) { addToast('Porcentaje inválido', 'error'); return; }
      newPrice = item.originalPrice * (1 - val / 100);
    } else if (discountType === 'fixed') {
      const val = Number(discountValue);
      if (val < 0 || val > item.originalPrice) { addToast('Monto inválido', 'error'); return; }
      newPrice = item.originalPrice - val;
    }

    newCart[discountItemIndex] = {
      ...item,
      price: newPrice,
      discountType,
      discountValue: discountType === 'gift' ? 100 : Number(discountValue)
    };

    setCart(newCart);
    setDiscountModalOpen(false);
    addToast('Promoción aplicada al item 🎀', 'success');
  };

  const removeDiscount = (index: number) => {
    const newCart = [...cart];
    newCart[index] = {
      ...newCart[index],
      price: newCart[index].originalPrice,
      discountType: undefined,
      discountValue: undefined
    };
    setCart(newCart);
  };

  const handleInitiateCheckout = () => {
    if (!activeRegister) {
      addToast('Debes abrir una caja antes de procesar ventas.', 'error');
      return;
    }
    if (!selectedStaff || !selectedArea || cart.length === 0) {
      addToast('Faltan datos para completar la orden (Staff o Área).', 'error');
      return;
    }
    setPayments([{ method: 'Efectivo', amount: total }]);
    setIsPaymentModalOpen(true);
  };

  const handleAddSpecificPayment = (method: PaymentMethod) => {
    const existingIndex = payments.findIndex(p => p.method === method);
    if (existingIndex >= 0) {
      const newPayments = [...payments];
      newPayments[existingIndex].amount += remaining;
      setPayments(newPayments);
    } else {
      setPayments([...payments, { method, amount: remaining }]);
    }
  };

  const handleUpdatePayment = (index: number, amount: number) => {
    const newPayments = [...payments];
    newPayments[index].amount = amount;
    setPayments(newPayments);
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleQuickCash = (amount: number) => {
    const cashIndex = payments.findIndex(p => p.method === 'Efectivo');
    if (cashIndex >= 0) {
      handleUpdatePayment(cashIndex, amount);
    } else {
      setPayments([...payments, { method: 'Efectivo', amount }]);
    }
  };

  const confirmPayment = async () => {
    if (!canConfirmPayment || !user) return;
    
    setIsPaymentModalOpen(false);
    setIsProcessing(true);
    
    let finalPayments = [...payments];
    if (vuelto > 0) {
      finalPayments = finalPayments.map(p => {
        if (p.method === 'Efectivo') {
          return { ...p, amount: p.amount - vuelto };
        }
        return p;
      });
    }
    finalPayments = finalPayments.filter(p => p.amount > 0);

    const order = await createOrder({
      client_id: selectedClient,
      staff_id: selectedStaff,
      area_id: selectedArea,
      total: total
    }, cart as any, finalPayments);
    
    const productsSold = cart.filter(c => c.type === 'product');
    const productCounts = productsSold.reduce((acc, prod) => {
      acc[prod.id] = (acc[prod.id] || 0) + prod.quantity;
      return acc;
    }, {} as Record<string, number>);

    for (const [prodId, qty] of Object.entries(productCounts)) {
      const invItem = inventory.find(i => i.id === prodId);
      if (invItem) {
        const newStock = invItem.stock - qty;
        await updateInventory(invItem.id, { stock: newStock });
        
        const cartItem = cart.find(c => c.id === prodId);
        const isGift = cartItem?.discountType === 'gift';

        await addKardex({
          item_id: invItem.id,
          type: 'Salida',
          transaction_type: 'VENTA_POS',
          document_type: 'TICKET',
          document_number: order.id.slice(-6),
          quantity: qty,
          previous_balance: invItem.stock,
          balance: newStock,
          unit_cost: invItem.cost,
          total_cost: invItem.cost * qty,
          reason: isGift ? 'Regalo / Promoción en POS' : 'Venta en POS',
          staff_name: user.name,
          date: new Date().toISOString()
        });
      }
    }

    setIsProcessing(false);
    addToast('¡Orden generada y pagada con éxito! 🎀', 'success');
    
    const clientName = selectedClient === 'WALK_IN' ? 'Público General' : (clients.find(c => c.id === selectedClient)?.name || 'Público General');
    const staffName = staff.find(s => s.id === selectedStaff)?.name || 'Staff';
    
    setCompletedOrder({ order, clientName, staffName, items: [...cart] });
    
    setCart([]);
    setSelectedClient('WALK_IN');
    setSelectedStaff('');
    setSelectedArea('');
  };

  const handlePrint = () => {
    if (completedOrder) {
      printTicket(completedOrder.order, completedOrder.clientName, completedOrder.staffName, completedOrder.items, settings);
    }
  };

  if (loadingClients || loadingServices) return <Spinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
            <KittyIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-plum">Punto de Venta</h1>
            <p className="text-plum/60 font-bold mt-1">Genera órdenes de servicio y cobra 🌸</p>
          </div>
        </div>
        {activeRegister && (
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-primary px-5 py-2.5 rounded-full font-bold border border-white shadow-sm">
            <Wallet className="w-4 h-4" /> Caja Activa: {activeRegister.name}
          </div>
        )}
      </div>

      {!activeRegister && (
        <Card className="bg-red-50/80 border-red-100 flex items-center gap-4 py-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <p className="font-bold text-red-700">Atención: No hay ninguna caja abierta. Ve al módulo de Cajas para iniciar el turno.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-plum mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Datos de la Orden
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Columna 1: Clienta */}
              <div>
                <div className="flex justify-between items-end mb-1.5 h-5">
                  <label className="block text-[11px] font-black text-plum-light uppercase tracking-widest leading-none">Clienta</label>
                  {selectedClient !== 'WALK_IN' && (
                    <button 
                      onClick={() => setSelectedClient('WALK_IN')}
                      className="text-[10px] font-black text-primary hover:text-plum flex items-center gap-1 transition-colors leading-none"
                    >
                      <UserCheck className="w-3 h-3" /> De Paso
                    </button>
                  )}
                </div>
                
                {selectedClient === 'WALK_IN' && !isSearchingClient ? (
                  <div className="flex items-center justify-between w-full px-4 bg-white/70 border border-white/80 rounded-2xl shadow-sm h-[52px]">
                    <span className="font-bold text-plum-light text-sm">Público General</span>
                    <button onClick={() => setIsSearchingClient(true)} className="text-[10px] font-black text-primary hover:text-plum transition-colors uppercase tracking-widest bg-white px-2 py-1 rounded-lg shadow-sm">
                      Asignar
                    </button>
                  </div>
                ) : selectedClient !== 'WALK_IN' ? (
                  <div className="flex items-center justify-between w-full px-4 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm h-[52px]">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-primary shrink-0 overflow-hidden border border-primary/20 shadow-sm">
                        {clients.find(c => c.id === selectedClient)?.avatarUrl ? (
                          <img src={clients.find(c => c.id === selectedClient)?.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="font-bold text-plum text-sm truncate">{clients.find(c => c.id === selectedClient)?.name}</span>
                    </div>
                    <button onClick={() => setSelectedClient('WALK_IN')} className="text-plum-light hover:text-red-500 transition-colors shrink-0 ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative h-[52px]">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-plum-light" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar nombre o DNI..."
                      value={clientSearchTerm}
                      onChange={e => setClientSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 h-full bg-white/90 border border-primary/30 rounded-2xl focus:ring-4 focus:ring-primary/10 text-plum font-bold shadow-sm text-sm outline-none transition-all"
                    />
                    <button onClick={() => { setIsSearchingClient(false); setClientSearchTerm(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-plum-light hover:text-plum bg-white rounded-full p-1 shadow-sm">
                      <X className="w-3 h-3" />
                    </button>
                    
                    {clientSearchTerm && (
                      <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-2xl border border-white rounded-2xl shadow-glass max-h-56 overflow-y-auto">
                        {clients.filter(c => c.id !== 'WALK_IN' && (c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || c.dni.includes(clientSearchTerm))).length === 0 ? (
                          <div className="p-4 text-center text-xs font-bold text-plum-light">No se encontraron clientas.</div>
                        ) : (
                          clients.filter(c => c.id !== 'WALK_IN' && (c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || c.dni.includes(clientSearchTerm))).map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => { setSelectedClient(c.id); setIsSearchingClient(false); setClientSearchTerm(''); }} 
                              className="p-3 hover:bg-primary/5 cursor-pointer border-b border-plum/5 last:border-0 flex items-center gap-3 transition-colors"
                            >
                              <img src={c.avatarUrl} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                              <div className="overflow-hidden">
                                <p className="font-bold text-sm text-plum truncate">{c.name}</p>
                                <p className="text-[10px] text-plum-light font-bold tracking-wider">{c.dni}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Columna 2: Especialista */}
              <div>
                <div className="flex justify-between items-end mb-1.5 h-5">
                  <label className="block text-[11px] font-black text-plum-light uppercase tracking-widest leading-none">Especialista</label>
                </div>
                <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} className="w-full px-4 h-[52px] bg-white/70 hover:bg-white/90 border border-white/80 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-plum font-bold shadow-sm outline-none text-sm transition-all cursor-pointer appearance-none">
                  <option value="" disabled>Seleccionar...</option>
                  {staff.map(s => {
                    const mainRole = [...(s.roles || [])].sort((a, b) => b.priority - a.priority)[0]?.name || 'Sin rol';
                    return <option key={s.id} value={s.id}>{s.name} - {mainRole}</option>;
                  })}
                </select>
              </div>

              {/* Columna 3: Área / Sala */}
              <div>
                <div className="flex justify-between items-end mb-1.5 h-5">
                  <label className="block text-[11px] font-black text-plum-light uppercase tracking-widest leading-none">Área / Sala</label>
                </div>
                <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)} className="w-full px-4 h-[52px] bg-white/70 hover:bg-white/90 border border-white/80 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-plum font-bold shadow-sm outline-none text-sm transition-all cursor-pointer appearance-none">
                  <option value="" disabled>Seleccionar...</option>
                  {areas.filter(a => a.status === 'Disponible').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-black text-plum flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="w-5 h-5 text-accent" /> Servicios
                </h3>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
                {serviceCategories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedServiceCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm ${selectedServiceCategory === cat ? 'bg-primary text-white border-primary' : 'bg-white/80 text-plum-light border-white hover:border-primary/30 hover:text-primary'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-plum-light" />
                <input 
                  type="text" 
                  placeholder="Buscar servicio..." 
                  value={searchService}
                  onChange={e => setSearchService(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/70 border border-white/80 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-plum font-bold shadow-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                {filteredServices.map(service => (
                  <div key={service.id} onClick={() => handleAddToCart(service, 'service')} className="p-4 rounded-2xl border border-white/80 bg-white/60 hover:bg-white cursor-pointer transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex justify-between items-center group">
                    <div>
                      <p className="font-black text-plum text-sm">{service.name}</p>
                      <p className="text-[11px] text-plum-light font-bold tracking-wider uppercase mt-0.5">{service.duration} min</p>
                    </div>
                    <span className="font-black text-primary text-lg">S/. {service.price}</span>
                  </div>
                ))}
                {filteredServices.length === 0 && <p className="text-xs text-center text-plum-light py-8 font-bold">No se encontraron servicios.</p>}
              </div>
            </Card>

            <Card>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-black text-plum flex items-center gap-2 uppercase tracking-wide">
                  <Package className="w-5 h-5 text-secondary" /> Productos
                </h3>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
                {productCategories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedProductCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm ${selectedProductCategory === cat ? 'bg-secondary text-white border-secondary' : 'bg-white/80 text-plum-light border-white hover:border-secondary/30 hover:text-secondary'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-plum-light" />
                <input 
                  type="text" 
                  placeholder="Buscar producto..." 
                  value={searchProduct}
                  onChange={e => setSearchProduct(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/70 border border-white/80 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-plum font-bold shadow-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                {filteredProducts.map(item => (
                  <div key={item.id} onClick={() => handleAddToCart(item, 'product')} className="p-4 rounded-2xl border border-white/80 bg-white/60 hover:bg-white cursor-pointer transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex justify-between items-center group">
                    <div>
                      <p className="font-black text-plum text-sm">{item.name}</p>
                      <p className="text-[11px] text-plum-light font-bold tracking-wider uppercase mt-0.5">Stock: {item.stock}</p>
                    </div>
                    <span className="font-black text-plum text-lg">S/. {item.price}</span>
                  </div>
                ))}
                {filteredProducts.length === 0 && <p className="text-xs text-center text-plum-light py-8 font-bold">No hay productos en stock.</p>}
              </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-28 flex flex-col h-[calc(100vh-9rem)] bg-white/50">
            <h3 className="text-lg font-black text-plum mb-5 flex items-center gap-2 pb-4 border-b border-white/80 uppercase tracking-wide">
              <ShoppingCart className="w-5 h-5 text-primary" /> Resumen de Orden
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
              {cart.length === 0 ? (
                <div className="text-center text-plum-light font-bold py-12 flex flex-col items-center">
                  <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                  <p>El carrito está vacío.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map((item, idx) => (
                    <motion.div 
                      key={`${item.id}-${item.type}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                      className={`flex items-center justify-between p-3 bg-white/90 border rounded-2xl shadow-sm transition-all ${item.discountType ? 'border-primary/40 bg-primary/5' : 'border-white'}`}
                    >
                      {/* Info del Item */}
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-black text-sm text-plum flex items-center gap-1.5 truncate">
                          {item.type === 'service' ? <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" /> : <Package className="w-3.5 h-3.5 text-primary shrink-0" />}
                          <span className="truncate">{item.name}</span>
                        </p>
                        
                        {/* Controles de Cantidad Compactos */}
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 bg-background rounded-lg p-0.5 border border-white shadow-inner">
                            <button onClick={() => handleUpdateQuantity(idx, -1)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-plum font-bold hover:bg-primary hover:text-white transition-colors shadow-sm"><Minus className="w-3 h-3"/></button>
                            <span className="text-[11px] font-black w-4 text-center">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(idx, 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-plum font-bold hover:bg-primary hover:text-white transition-colors shadow-sm"><Plus className="w-3 h-3"/></button>
                          </div>
                          
                          {/* Badge de Descuento Compacto */}
                          {item.discountType && (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-accent bg-accent/10 px-1.5 py-0.5 rounded-md border border-accent/20">
                                {item.discountType === 'gift' ? '🎁 Regalo' : '📉 Dcto'}
                              </span>
                              <button onClick={() => removeDiscount(idx)} className="text-[9px] text-red-400 hover:text-red-600 font-black uppercase tracking-wider underline">Quitar</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Precios y Acciones */}
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <div className="flex items-center gap-1">
                          {!item.discountType && (
                            <button onClick={() => openDiscountModal(idx)} className="p-1 text-accent hover:bg-accent/10 rounded-full transition-all bg-white shadow-sm border border-white" title="Aplicar Descuento/Regalo">
                              <Gift className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleRemoveFromCart(idx)} className="p-1 text-plum-light hover:text-red-500 hover:bg-red-50 rounded-full transition-all bg-white shadow-sm border border-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          {item.discountType && (
                            <p className="text-[9px] text-plum-light line-through font-bold leading-none mb-0.5">S/. {(item.originalPrice * item.quantity).toFixed(2)}</p>
                          )}
                          <p className={`text-sm font-black leading-none ${item.discountType === 'gift' ? 'text-green-500' : 'text-primary'}`}>
                            S/. {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="pt-5 border-t border-white/80 mt-auto">
              <div className="flex justify-between items-center mb-6 bg-white/60 p-4 rounded-2xl border border-white shadow-sm">
                <span className="text-plum-light font-black uppercase tracking-widest text-xs">Total a Pagar</span>
                <span className="text-3xl font-black text-plum">S/. {total.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full py-4 text-lg shadow-glow" 
                disabled={cart.length === 0 || !selectedStaff || !selectedArea || isProcessing || !activeRegister}
                onClick={handleInitiateCheckout}
              >
                {isProcessing ? <Spinner /> : <><CheckCircle2 className="w-6 h-6" /> Procesar Pago</>}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 🚀 MODAL DE DESCUENTOS Y REGALOS (Segmented Control Animado) */}
      <Modal isOpen={discountModalOpen} onClose={() => setDiscountModalOpen(false)} title="Aplicar Promoción">
        <form onSubmit={applyDiscount} className="space-y-6">
          <div className="flex gap-2 p-1.5 bg-white/60 border border-white rounded-2xl shadow-inner relative">
            {['percentage', 'fixed', 'gift'].map((type) => (
              <button 
                key={type}
                type="button"
                onClick={() => setDiscountType(type as any)}
                className={`relative flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all z-10 ${discountType === type ? 'text-primary' : 'text-plum-light hover:text-plum'}`}
              >
                {discountType === type && (
                  <motion.div layoutId="discountTab" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-white -z-10" />
                )}
                {type === 'percentage' ? '% Porcentaje' : type === 'fixed' ? 'S/. Monto Fijo' : '🎁 Regalo'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {discountType !== 'gift' ? (
              <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-plum-light">
                    {discountType === 'percentage' ? <Percent className="w-6 h-6" /> : <span className="font-black text-2xl">S/.</span>}
                  </div>
                  <input 
                    type="number" 
                    min="0" 
                    step={discountType === 'percentage' ? '1' : '0.1'}
                    max={discountType === 'percentage' ? '100' : undefined}
                    required 
                    value={discountValue} 
                    onChange={e => setDiscountValue(e.target.value)}
                    className="w-full pl-16 pr-6 py-6 bg-white/80 border border-white rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-plum font-black text-4xl shadow-sm outline-none transition-all text-center"
                    placeholder="0"
                  />
                </div>
                {/* Quick percentage buttons */}
                {discountType === 'percentage' && (
                  <div className="flex gap-2 justify-center">
                    {[10, 15, 20, 50].map(pct => (
                      <button type="button" key={pct} onClick={() => setDiscountValue(pct.toString())} className="px-4 py-2 bg-white/60 border border-white rounded-xl text-sm font-black text-plum hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                        {pct}%
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="gift" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-accent/10 border border-accent/20 p-8 rounded-3xl text-center shadow-sm">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-white">
                  <Gift className="w-10 h-10 text-accent" />
                </div>
                <p className="font-black text-plum text-lg uppercase tracking-wide">Item de Regalo</p>
                <p className="text-sm text-plum-light font-bold mt-2">El precio será S/. 0.00. El stock se descontará normalmente.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6 flex justify-end gap-3 border-t border-white/50">
            <Button type="button" variant="ghost" onClick={() => setDiscountModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="px-8">Aplicar Promoción</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Pagos Divididos (Enterprise UX) */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Procesar Pago" maxWidth="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Resumen Izquierda (Estilo Ticket) - Fijo */}
          <div className="lg:col-span-2 bg-white/60 p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col sticky top-0">
            <div className="text-center mb-8 pb-8 border-b-2 border-dashed border-plum/10">
              <p className="text-xs font-black text-plum-light uppercase tracking-widest mb-2">Total a Cobrar</p>
              <p className="text-5xl font-black text-plum tracking-tight">S/. {total.toFixed(2)}</p>
            </div>
            
            <div className="space-y-5 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-plum-light uppercase tracking-wider">Monto Recibido</span>
                <span className="text-2xl font-black text-plum">S/. {totalPaid.toFixed(2)}</span>
              </div>
              
              {remaining > 0 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center text-red-500 bg-red-50 p-4 rounded-2xl border border-white shadow-sm">
                  <span className="text-sm font-black uppercase tracking-wider">Faltante</span>
                  <span className="text-2xl font-black">S/. {remaining.toFixed(2)}</span>
                </motion.div>
              )}
              
              {vuelto > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`flex justify-between items-center p-4 rounded-2xl border border-white shadow-sm ${hasCashPayment ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                  <span className="text-sm font-black uppercase tracking-wider">Vuelto a entregar</span>
                  <span className="text-2xl font-black">S/. {vuelto.toFixed(2)}</span>
                </motion.div>
              )}
              {vuelto > 0 && !hasCashPayment && (
                <p className="text-[10px] text-red-500 font-bold text-center leading-tight bg-red-50 p-2 rounded-xl border border-red-100">
                  Error: No se puede dar vuelto si no hay un pago en Efectivo registrado.
                </p>
              )}
            </div>

            <Button 
              className={`w-full mt-8 py-4 text-lg ${canConfirmPayment ? 'animate-pulse shadow-glow' : ''}`}
              disabled={!canConfirmPayment || isProcessing}
              onClick={confirmPayment}
            >
              {isProcessing ? <Spinner /> : 'Confirmar Pago'}
            </Button>
          </div>
          
          {/* Métodos Derecha - Scrollable si es necesario */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* Quick Add Methods */}
            <div>
              <h4 className="font-black text-plum uppercase text-xs tracking-widest mb-4">Añadir Método de Pago</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map(method => (
                  <button 
                    key={method.id}
                    onClick={() => handleAddSpecificPayment(method.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-4 bg-white/80 border-2 hover:border-primary rounded-3xl shadow-sm hover:shadow-md transition-all group ${method.border}`}
                  >
                    <div className={`p-3.5 rounded-full ${method.bg} group-hover:scale-110 transition-transform shadow-inner-white`}>
                      <method.icon className={`w-6 h-6 ${method.color}`} />
                    </div>
                    <span className="font-black text-plum text-[10px] uppercase tracking-widest text-center leading-tight">{method.id}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Active Payments List */}
            <div className="space-y-4">
              <h4 className="font-black text-plum uppercase text-xs tracking-widest mb-2">Pagos Registrados</h4>
              {payments.length === 0 ? (
                <div className="text-center py-10 bg-white/40 rounded-3xl border border-white border-dashed">
                  <p className="text-plum-light font-bold text-sm">Selecciona un método de pago arriba.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {payments.map((payment, idx) => {
                      const methodInfo = PAYMENT_METHODS.find(m => m.id === payment.method);
                      const Icon = methodInfo?.icon || Banknote;
                      
                      return (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-4 bg-white/90 p-3.5 rounded-3xl border border-white shadow-sm"
                        >
                          <div className={`p-2.5 rounded-2xl ${methodInfo?.bg || 'bg-gray-100'} shadow-inner-white`}>
                            <Icon className={`w-5 h-5 ${methodInfo?.color || 'text-gray-500'}`} />
                          </div>
                          <span className="font-black text-plum text-sm uppercase tracking-wide flex-1 truncate">{payment.method}</span>
                          
                          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-plum/10 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all w-36 shrink-0 shadow-inner">
                            <span className="text-plum-light font-black text-sm">S/.</span>
                            <input 
                              type="number" 
                              min="0" 
                              step="0.1" 
                              value={payment.amount === 0 ? '' : payment.amount} 
                              onChange={e => handleUpdatePayment(idx, Number(e.target.value))}
                              className="w-full bg-transparent border-none text-right font-black text-plum focus:ring-0 p-0 text-lg outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <button onClick={() => handleRemovePayment(idx)} className="p-2.5 text-plum-light hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0">
                            <X className="w-5 h-5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Quick Cash Buttons (Only show if Efectivo is selected) */}
            {hasCashPayment && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-white/50">
                <h4 className="font-black text-plum uppercase text-xs tracking-widest mb-4">Billetes Rápidos (Efectivo)</h4>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => handleQuickCash(remaining > 0 ? remaining : total)}
                    className="px-5 py-2.5 bg-primary text-white rounded-2xl font-black text-sm shadow-glow hover:-translate-y-0.5 transition-transform uppercase tracking-wider"
                  >
                    Monto Exacto
                  </button>
                  {QUICK_CASH.map(amount => (
                    <button 
                      key={amount}
                      onClick={() => handleQuickCash(amount)}
                      className="px-5 py-2.5 bg-white text-green-700 border border-white rounded-2xl font-black text-sm shadow-sm hover:bg-green-50 hover:border-green-200 hover:-translate-y-0.5 transition-all"
                    >
                      S/. {amount}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </Modal>

      <Modal isOpen={!!completedOrder} onClose={() => setCompletedOrder(null)} title="¡Pago Exitoso!">
        <div className="text-center space-y-6">
          <div className="bg-green-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto text-green-500 border-4 border-white shadow-sm">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-5xl font-black text-plum tracking-tight">S/. {completedOrder?.order.total.toFixed(2)}</h3>
            <p className="text-plum-light font-bold mt-3 uppercase tracking-widest text-xs">Orden #{completedOrder?.order.id.slice(-6)} completada.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {completedOrder?.order.payments.map((p, i) => (
                <Badge key={i} variant="pink">{p.method}: S/. {p.amount.toFixed(2)}</Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-6 border-t border-white/50">
            <Button variant="outline" onClick={() => setCompletedOrder(null)}>Nueva Orden</Button>
            <Button onClick={handlePrint}><Printer className="w-5 h-5" /> Imprimir Ticket</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
