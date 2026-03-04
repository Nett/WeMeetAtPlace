(() => {
  const colors = ['amber', 'teal', 'blue'];
  const count = 17;

  for (let i = 0; i < count; i++) {
    const pin = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    pin.className = `pin pin-${color}`;
    pin.style.top = `${Math.floor(Math.random() * 85 + 5)}%`;
    pin.style.left = `${Math.floor(Math.random() * 85 + 5)}%`;
    pin.style.setProperty('--size', `${Math.floor((Math.random() * 12 + 5) * 1.1)}px`);
    pin.style.setProperty('--delay', `${(Math.random() * 2.5).toFixed(1)}s`);
    document.body.appendChild(pin);
  }
})();
