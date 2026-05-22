import React, { useState, useRef, useLayoutEffect, cloneElement } from "react";

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const DefaultCompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
);

const DefaultBellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export type NavItem = {
  id: string | number;
  icon: React.ReactElement;
  label?: string;
  onClick?: () => void;
};

const defaultNavItems: NavItem[] = [
  { id: "default-home", icon: <DefaultHomeIcon />, label: "Home" },
  { id: "default-explore", icon: <DefaultCompassIcon />, label: "Explore" },
  { id: "default-notifications", icon: <DefaultBellIcon />, label: "Notifications" },
];

type LimelightNavProps = {
  items?: NavItem[];
  defaultActiveIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
};

export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  onTabChange,
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
}: LimelightNavProps) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [isReady, setIsReady] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  const moveLimelightToItem = (index: number) => {
    const limelight = limelightRef.current;
    const activeItem = navItemRefs.current[index];

    if (limelight && activeItem) {
      const newLeft = activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2;
      limelight.style.left = `${newLeft}px`;
    }
  };

  useLayoutEffect(() => {
    if (items.length === 0) return;

    moveLimelightToItem(activeIndex);

    if (!isReady) {
      setTimeout(() => setIsReady(true), 50);
    }
  }, [activeIndex, isReady, items]);

  if (items.length === 0) {
    return null;
  }

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    setActiveIndex(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const nav = navRef.current;
    const limelight = limelightRef.current;
    if (!nav || !limelight) return;

    const rect = nav.getBoundingClientRect();
    const nextLeft = event.clientX - rect.left - limelight.offsetWidth / 2;
    const maxLeft = rect.width - limelight.offsetWidth - 8;
    limelight.style.left = `${Math.max(8, Math.min(nextLeft, maxLeft))}px`;
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    moveLimelightToItem(activeIndex);
  };

  return (
    <nav
      ref={navRef}
      className={`relative inline-flex h-16 items-center rounded-lg border bg-card px-2 text-foreground ${className || ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {items.map(({ id, icon, label, onClick }, index) => (
        <a
          key={id}
          ref={(el) => (navItemRefs.current[index] = el)}
          className={`relative z-20 flex h-full cursor-pointer items-center justify-center p-5 ${iconContainerClassName || ""}`}
          onClick={() => handleItemClick(index, onClick)}
          onMouseEnter={() => setHoverIndex(index)}
          aria-label={label}
        >
          {cloneElement(icon, {
            className: `h-6 w-6 transition-opacity duration-100 ease-in-out ${
              activeIndex === index || hoverIndex === index ? "opacity-100" : "opacity-40"
            } ${icon.props.className || ""} ${iconClassName || ""}`,
          })}
        </a>
      ))}

      <div
        ref={limelightRef}
        className={`absolute top-0 z-10 h-[5px] w-11 rounded-full bg-primary shadow-[0_50px_15px_var(--primary)] ${
          isReady ? "transition-[left] duration-[400ms] ease-in-out" : ""
        } ${limelightClassName || ""}`}
        style={{ left: "-999px" }}
      >
        <div className="pointer-events-none absolute left-[-30%] top-[5px] h-14 w-[160%] bg-gradient-to-b from-primary/30 to-transparent [clip-path:polygon(5%_100%,25%_0,75%_0,95%_100%)]" />
      </div>
    </nav>
  );
};
