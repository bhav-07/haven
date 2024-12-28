import React from "react";

type LogoProps = {
  variant: "gradient1" | "gradient2" | "gradient3";
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ variant, className }) => {
  switch (variant) {
    case "gradient1":
      return (
        <svg
          className={className}
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_105_666)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M100 22C100 9.84974 90.1503 0 78 0H22C9.84974 0 0 9.84972 0 22V78.7194C0 90.8697 9.84974 100.719 22 100.719H78C90.1503 100.719 100 110.569 100 122.719V178C100 190.15 109.85 200 122 200H178C190.15 200 200 190.15 200 178V121.28C200 109.13 190.15 99.2805 178 99.2805H122C109.85 99.2805 100 89.4308 100 77.2805V22Z"
              fill="url(#paint0_linear_105_666)"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_105_666"
              x1="0"
              y1="0"
              x2="200"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#243949" offset="0%" />
              <stop stopColor="#517fa4" offset="100%" />
            </linearGradient>
            <clipPath id="clip0_105_666">
              <rect width="200" height="200" fill="white" />
            </clipPath>
          </defs>
        </svg>
      );

    case "gradient2":
      return (
        <svg
          className={className}
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_105_666)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M100 22C100 9.84974 90.1503 0 78 0H22C9.84974 0 0 9.84972 0 22V78.7194C0 90.8697 9.84974 100.719 22 100.719H78C90.1503 100.719 100 110.569 100 122.719V178C100 190.15 109.85 200 122 200H178C190.15 200 200 190.15 200 178V121.28C200 109.13 190.15 99.2805 178 99.2805H122C109.85 99.2805 100 89.4308 100 77.2805V22Z"
              fill="url(#paint0_linear_105_666)"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_105_666"
              x1="0"
              y1="0"
              x2="200"
              y2="200"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#fdfcfb" />
              <stop offset="100%" stopColor="#e2d1c3" />
            </linearGradient>
            <clipPath id="clip0_105_666">
              <rect width="200" height="200" fill="white" />
            </clipPath>
          </defs>
        </svg>
      );

    case "gradient3":
      return (
        <svg
          className={className}
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_105_666)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M100 22C100 9.84974 90.1503 0 78 0H22C9.84974 0 0 9.84972 0 22V78.7194C0 90.8697 9.84974 100.719 22 100.719H78C90.1503 100.719 100 110.569 100 122.719V178C100 190.15 109.85 200 122 200H178C190.15 200 200 190.15 200 178V121.28C200 109.13 190.15 99.2805 178 99.2805H122C109.85 99.2805 100 89.4308 100 77.2805V22Z"
              fill="url(#paint0_linear_105_666)"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_105_666"
              x1="0"
              y1="0"
              x2="200"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0acffe" offset="0%" />
              <stop stopColor="#495aff" offset="100%" />
            </linearGradient>
            <clipPath id="clip0_105_666">
              <rect width="200" height="200" fill="white" />
            </clipPath>
          </defs>
        </svg>
      );

    default:
      return null;
  }
};

export default Logo;
