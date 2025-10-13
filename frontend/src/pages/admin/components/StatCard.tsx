import React from "react";
import { useI18n } from "../../../contexts/I18nContext";
import { formatCurrency, formatNumber } from "../../../utils/format";

interface StatCardProps {
  title: string;
  value: number;
  growth?: number;
  icon: React.ReactNode;
  color?: string;
  formatType?: "number" | "currency";
  growthSuffix?: string;
  showGrowth?: boolean;
  showStars?: boolean; // Cho rating
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  growth,
  icon,
  color = "rgb(148, 204, 230)",
  formatType = "number",
  growthSuffix = "%",
  showGrowth = true,
  showStars = false,
}) => {
  const { locale } = useI18n();

  const formatValue = () => {
    if (formatType === "currency") {
      return formatCurrency(value, locale);
    }
    return formatNumber(value, locale);
  };

  const renderGrowth = () => {
    if (!showGrowth || growth === undefined) return null;

    return (
      <p className="text-xs text-green-600 mt-1">
        {growthSuffix === "/5.0"
          ? `${value}${growthSuffix}`
          : `+${growth}${growthSuffix} so với tháng trước`}
      </p>
    );
  };

  const renderStars = () => {
    if (!showStars) return null;

    return (
      <div className="flex items-center mt-2">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${
              i < Math.floor(value) ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">({value}/5.0)</span>
      </div>
    );
  };

  return (
    <div
      className="p-4 rounded-xl shadow-md hover:shadow-md transition-all duration-300"
      style={{
        backgroundColor: showStars ? "white" : "rgba(148, 204, 230, 0.1)",
        borderColor: "rgba(148, 204, 230, 0.2)",
        border: "1px solid",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color }}>
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">{formatValue()}</p>
          {renderGrowth()}
          {renderStars()}
        </div>
        <div className="p-1 rounded-full" style={{ backgroundColor: color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};
