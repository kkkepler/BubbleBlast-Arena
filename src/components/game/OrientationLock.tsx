'use client';
import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

const OrientationLock = () => {
const { t } = useI18n();
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
setIsMobile(mobile);
if (mobile && screen.orientation && typeof (screen.orientation as any).lock === 'function') {
(screen.orientation as any).lock('portrait-primary').catch(() => {});
const hv = () => { if (document.visibilityState === 'visible') (screen.orientation as any).lock('portrait-primary').catch(() => {}); };
document.addEventListener('visibilitychange', hv);
return () => document.removeEventListener('visibilitychange', hv);
}
}, []);

if (!isMobile) return null;

return (
<div id="orientation-lock"> 
  <div className="content"> 
    <Smartphone className="icon" /> 
    <p>{t('orientation.message')}</p> 
  </div> 
</div> 
); };
export default OrientationLock;
