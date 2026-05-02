export function ThemeBoot() {
  const script = `(function(){try{var t=localStorage.getItem('shelved_theme');var r=document.documentElement;if(t==='light'){r.classList.add('light');}else{r.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
