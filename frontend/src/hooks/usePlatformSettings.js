import { useSelector } from 'react-redux'

export const usePlatformSettings = () => {
  const platformSettings = useSelector((state) => state.admin.platformSettings)
  const { platformName, currency, currencySymbol } = platformSettings

  return {
    platformName,
    currency,
    currencySymbol,
    formatCurrency: (amount) => `${currencySymbol}${Number(amount).toFixed(2)}`
  }
}