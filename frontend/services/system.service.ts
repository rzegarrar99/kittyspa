import { SimpleDictionary, Brand, Unit, Area, Service } from '../types';
import { BaseService } from './base.service';
import { MOCK_SERVICES } from '../constants';

class CategoryService extends BaseService<SimpleDictionary> {
  constructor() {
    super('spa_categories', [
      { id: 'c1', name: 'Faciales', description: 'Tratamientos para el rostro' }, 
      { id: 'c2', name: 'Masajes', description: 'Relajación corporal' }
    ]);
  }
}

class BrandService extends BaseService<Brand> {
  constructor() {
    super('spa_brands', [
      { id: 'b1', name: 'Glow Beauty', description: 'Línea premium de cuidado facial', origin: 'Francia' }, 
      { id: 'b2', name: 'Kitty Cosmetics', description: 'Maquillaje y accesorios coquette', origin: 'Japón' }
    ]);
  }
}

class UnitService extends BaseService<Unit> {
  constructor() {
    super('spa_units', [
      { id: 'u1', name: 'Mililitros', abbreviation: 'ml' }, 
      { id: 'u2', name: 'Unidades', abbreviation: 'und' },
      { id: 'u3', name: 'Gramos', abbreviation: 'gr' }
    ]);
  }
}

class AreaService extends BaseService<Area> {
  constructor() {
    super('spa_areas', [
      { id: 'a1', name: 'Sala VIP 1', capacity: 1, status: 'Disponible' }, 
      { id: 'a2', name: 'Sala Masajes', capacity: 2, status: 'Ocupado' }
    ]);
  }
}

class SpaServiceService extends BaseService<Service> {
  constructor() {
    super('spa_services', MOCK_SERVICES);
  }
}

export const categoryService = new CategoryService();
export const brandService = new BrandService();
export const unitService = new UnitService();
export const areaService = new AreaService();
export const spaServiceService = new SpaServiceService();

// 🚀 MIGRACIÓN A FIREBASE: 
// No requiere cambios. Heredan de BaseService.
