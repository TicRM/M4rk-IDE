import * as React from "react";

const MOBILE_BREAKPOINT = 768;

//aqui vamos a intentar hacer las vistas para mobil

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const checkIsMobile = () => {
      const isPortraitMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const isLandscapeMobile = window.innerHeight < 500 && window.innerWidth < 950;
      return isPortraitMobile || isLandscapeMobile;
    };

    const onChange = () => {
      setIsMobile(checkIsMobile());
    };
    
    // Listen to resize to handle orientation changes
    window.addEventListener("resize", onChange);
    setIsMobile(checkIsMobile());
    
    return () => window.removeEventListener("resize", onChange);
  }, []);

  return !!isMobile;
}
