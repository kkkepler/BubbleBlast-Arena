'use client';
import { useEffect, useRef } from 'react';
import { platform } from '@/lib/platform';
import { useI18n } from '@/hooks/useI18n';

export default function PlatformBridge() {
const initialized = useRef(false);
const { setLanguage } = useI18n();

useEffect(() => {
const pd = (e: Event) => e.preventDefault();
document.addEventListener('contextmenu', pd);
document.addEventListener('selectstart', pd);
document.addEventListener('dragstart', pd as any);

const pth = (e: TouchEvent) => {
const target = e.target as HTMLElement;
if (target.closest('button, [role="button"], input, textarea, .scrollable-content')) {
return;
}
if (e.touches.length > 1) e.preventDefault();
};
document.addEventListener('touchstart', pth, { passive: false });

return () => {
document.removeEventListener('contextmenu', pd);
document.removeEventListener('selectstart', pd);
document.removeEventListener('dragstart', pd as any);
document.removeEventListener('touchstart', pth);
};
}, []);

useEffect(() => {
if (initialized.current) return;
initialized.current = true;

const init = async () => {
try {
await platform.init();
const lang = platform.getLang();
document.documentElement.lang = lang;
setLanguage(lang);
platform.gameReady();
platform.gameplay.ready();
window.dispatchEvent(new CustomEvent('platform-ready'));
} catch (e) {
console.warn('Platform bridge init error:', e);
window.dispatchEvent(new CustomEvent('platform-error'));
}
};

init();
}, [setLanguage]);

useEffect(() => {
const ps = () => window.dispatchEvent(new CustomEvent('game-pause-sound'));
const rs = () => window.dispatchEvent(new CustomEvent('game-resume-sound'));

const hv = () => {
if (document.hidden) {
ps();
} else {
rs();
}
};

document.addEventListener('visibilitychange', hv);
document.addEventListener('pagehide', ps);
window.addEventListener('blur', ps);
window.addEventListener('focus', rs);

return () => {
document.removeEventListener('visibilitychange', hv);
document.removeEventListener('pagehide', ps);
window.removeEventListener('blur', ps);
window.removeEventListener('focus', rs);
};
}, []);

return null;
}
