
import React from "react";

export default function StatCard({
  title,
  value,
  label,
  icon: Icon,
  color,
  trend,
  onClick,
}) {
  /*
   * Supports BOTH:
   *
   * icon={Activity}
   *
   * and
   *
   * icon={<Activity />}
   *
   * so the dashboard won't crash because of icon format.
   */

  const renderIcon = () => {
    if (!Icon) return null;

    // Already-created JSX element
    if (React.isValidElement(Icon)) {
      return Icon;
    }

    // Lucide component / React component
    if (typeof Icon === "function") {
      return <Icon size={22} strokeWidth={1.8} />;
    }

    return null;
  };

  return (
    <div
      className={`stat-card ${onClick ? "stat-card-clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
    >
      <div className="stat-card-top">
        <div
          className="stat-icon"
          style={
            color
              ? {
                  color: color,
                  borderColor: `${color}40`,
                  background: `${color}10`,
                }
              : undefined
          }
        >
          {renderIcon()}
        </div>

        {trend && (
          <span className="stat-trend">
            {trend}
          </span>
        )}
      </div>

      <div className="stat-card-value">
        {value ?? "—"}
      </div>

      <div className="stat-card-title">
        {title}
      </div>

      {label && (
        <div className="stat-card-label">
          {label}
        </div>
      )}
    </div>
  );
}

