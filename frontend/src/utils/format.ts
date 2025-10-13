export const formatNumber = (value: number, locale: string = "vi-VN") =>
  new Intl.NumberFormat(locale).format(value);

export const formatCurrency = (
  value: number,
  locale: string = "vi-VN",
  currency: string = "VND"
) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);

export const formatTimeAgo = (timestamp: string, locale: string = "vi-VN") => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - time.getTime()) / (1000 * 60)
  );
  if (diffInMinutes < 60)
    return `${diffInMinutes} ${
      locale.startsWith("vi") ? "phút trước" : "minutes ago"
    }`;
  if (diffInMinutes < 1440)
    return `${Math.floor(diffInMinutes / 60)} ${
      locale.startsWith("vi") ? "giờ trước" : "hours ago"
    }`;
  return `${Math.floor(diffInMinutes / 1440)} ${
    locale.startsWith("vi") ? "ngày trước" : "days ago"
  }`;
};

