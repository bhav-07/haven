import React from "react";
import { Loader } from "lucide-react";

interface LoaderProps {
  mode?: "light" | "dark";
  size?: "small" | "medium" | "large";
  className?: string;
}

const Loading: React.FC<LoaderProps> = ({
  mode = "light",
  size = "medium",
  className = "",
}) => {
  const sizeConfig = {
    small: {
      iconSize: 24,
      containerClasses: "w-8 h-8",
    },
    medium: {
      iconSize: 40,
      containerClasses: "w-12 h-12",
    },
    large: {
      iconSize: 56,
      containerClasses: "w-16 h-16",
    },
  };

  const colorConfig = {
    light: {
      iconColor: "text-gray-500",
    },
    dark: {
      iconColor: "text-gray-300",
    },
  };

  const { iconSize, containerClasses } = sizeConfig[size];
  const { iconColor } = colorConfig[mode];

  return (
    <div
      className={`flex items-center justify-center ${containerClasses} ${className}`}
    >
      <Loader className={`animate-spin ${iconColor}`} size={iconSize} />
    </div>
  );
};

export default Loading;
