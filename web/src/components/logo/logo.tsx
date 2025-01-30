import LogoShape from "./logo-shape";

type Props = {
  shape?: boolean;
  text?: boolean;
  size?: number;
  logoType?: LogoProps;
};

type LogoProps = {
  variant: "gradient1" | "gradient2" | "gradient3";
};

const Logo = ({ shape = true, text = true, size = 40 }: Props) => {
  const textSize = size * 1.385;
  return (
    <span
      className="flex flex-row items-center justify-center gap-x-1"
      style={{ height: size }}
    >
      {shape && <LogoShape variant="gradient2" />}
      {text && (
        <h1
          className="font-poppins"
          style={{ fontSize: textSize, lineHeight: `${size}px` }}
        >
          Haven
        </h1>
      )}
    </span>
  );
};

export default Logo;
