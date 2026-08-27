import { useEffect, useRef, useState } from "react";
import styles from "./HeaderTitle.module.css";

const HeaderTitle = ({ title }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      const text = textRef.current;

      if (!container || !text) return;

      setIsOverflowing(text.scrollWidth > container.clientWidth);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [title]);

  return (
    <div ref={containerRef} className={styles.headerTitle}>
      <span
        ref={textRef}
        className={isOverflowing ? styles.headerOverflow : styles.headerText}
      >
        {title}
      </span>
    </div>
  );
};

export default HeaderTitle;
