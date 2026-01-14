export const useFormatPrice = () => {
    const formatPrice = (price: string | number): string => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    };

    return { formatPrice };
};
