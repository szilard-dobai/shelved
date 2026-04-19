/**
 * Inline script that reads the stored theme and applies it *before* React
 * hydrates. Prevents a flash of the wrong theme on first paint.
 */
export function ThemeBoot() {
  const script = `(function(){try{var t=localStorage.getItem('shelved_theme');var r=document.documentElement;if(t==='light'){r.classList.add('light');}else{r.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
