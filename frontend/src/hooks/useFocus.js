import { useEffect, useState } from 'react';

function useFocus(onFocus) {
  const [isFocused, setIsFocused] = useState(document.hasFocus());

  useEffect(() => {
    const handleFocus = () => {
      if (onFocus) {
        onFocus();
      }
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onFocus]);

  return isFocused;
}

export default useFocus;
