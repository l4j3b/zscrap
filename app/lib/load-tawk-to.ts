export function loadTawkTo() {
  const script = document.createElement('script');
  script.src = 'https://embed.tawk.to/<property-id>/<widget-id>';
  script.async = true;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');

  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script); // Cleanup when component unmounts
  };
}
