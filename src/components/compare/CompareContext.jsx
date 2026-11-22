import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('compare_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('compare_list', JSON.stringify(compareList));
  }, [compareList]);

  const addCar = (car) => {
    if (compareList.length >= 4) return false;
    if (compareList.find(c => c.id === car.id)) return false;
    setCompareList(prev => [...prev, car]);
    return true;
  };

  const removeCar = (carId) => {
    setCompareList(prev => prev.filter(c => c.id !== carId));
  };

  const clearAll = () => setCompareList([]);

  const isInCompare = (carId) => compareList.some(c => c.id === carId);

  return (
    <CompareContext.Provider value={{ compareList, addCar, removeCar, clearAll, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}