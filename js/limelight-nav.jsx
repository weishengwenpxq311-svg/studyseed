const { useState: useStateL, useRef: useRefL, useLayoutEffect: useLayoutEffectL } = React;

function LimelightNav({ items, defaultActiveIndex = 0, onTabChange }) {
  const [activeIndex, setActiveIndex] = useStateL(defaultActiveIndex);
  const [isReady, setIsReady] = useStateL(false);
  const [hoverIndex, setHoverIndex] = useStateL(null);
  const navRef = useRefL(null);
  const itemRefs = useRefL([]);
  const lightRef = useRefL(null);

  const moveLightToItem = (index) => {
    const activeItem = itemRefs.current[index];
    const light = lightRef.current;
    if (!activeItem || !light) return;

    const left = activeItem.offsetLeft + activeItem.offsetWidth / 2 - light.offsetWidth / 2;
    light.style.left = `${left}px`;
  };

  useLayoutEffectL(() => {
    if (!items || !items.length) return;

    moveLightToItem(activeIndex);

    if (!isReady) {
      setTimeout(() => setIsReady(true), 50);
    }
  }, [activeIndex, isReady, items]);

  if (!items || !items.length) return null;

  const handleClick = (index, item) => {
    setActiveIndex(index);
    onTabChange && onTabChange(index);
    item.onClick && item.onClick();
  };

  const handleMouseMove = (event) => {
    const nav = navRef.current;
    const light = lightRef.current;
    if (!nav || !light) return;

    const rect = nav.getBoundingClientRect();
    const left = event.clientX - rect.left - light.offsetWidth / 2;
    const maxLeft = rect.width - light.offsetWidth - 6;
    light.style.left = `${Math.max(6, Math.min(left, maxLeft))}px`;
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    moveLightToItem(activeIndex);
  };

  return (
    <nav
      ref={navRef}
      className="limelight-nav"
      aria-label="primary navigation"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={el => itemRefs.current[index] = el}
          className={"limelight-item " + (activeIndex === index || hoverIndex === index ? "active" : "")}
          onClick={() => handleClick(index, item)}
          onMouseEnter={() => setHoverIndex(index)}
          aria-label={item.label}
          type="button"
        >
          {item.icon && <span className="limelight-icon">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
      <div
        ref={lightRef}
        className={"limelight-beam " + (isReady ? "ready" : "")}
        aria-hidden="true"
        style={{left:"-999px"}}
      >
        <div className="limelight-cone"/>
      </div>
    </nav>
  );
}

Object.assign(window, { LimelightNav });
