
export const maskCurrency = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");
  const numberValue = Number(cleanValue) / 100;
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const cleanValue = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleanValue) || 0;
};

export const maskDate = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{4})\d+?$/, "$1");
};

export const maskPhone = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

export const dateToISO = (dateStr: string): string => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return new Date().toISOString().split('T')[0];
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const isoToDisplayDate = (isoDate: string): string => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};
