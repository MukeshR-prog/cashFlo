import Image from "next/image";

interface ThemeLogoProps {
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
}

export function ThemeLogo({
  width = 124,
  height = 32,
  alt = "Iteryx",
  className,
  priority = false,
}: ThemeLogoProps) {
  const logoStyle = {
    width: `${width}px`,
    height: `${height}px`,
    maxWidth: "100%",
  };

  return (
    <span className={`inline-flex shrink-0 items-center justify-start overflow-hidden ${className ?? ""}`}>
      <Image
        src="/dark-logo.png"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="block object-contain dark:hidden"
        style={logoStyle}
      />
      <Image
        src="/white-logo.png"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="hidden object-contain dark:block"
        style={logoStyle}
      />
    </span>
  );
}