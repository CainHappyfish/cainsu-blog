/**
 * 判断是否为移动端设备
 * @returns {boolean} 是否为移动端
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // 检查用户代理字符串
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'mobile'
  ];
  
  const isMobileUserAgent = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );
  
  // 检查屏幕宽度
  const isMobileWidth = window.innerWidth <= 768;
  
  // 检查触摸支持
  const hasTouchSupport = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0;
  
  return isMobileUserAgent || (isMobileWidth && hasTouchSupport);
}

/**
 * 检查是否为平板设备
 * @returns {boolean} 是否为平板
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isTabletUserAgent = userAgent.includes('ipad') || 
    (userAgent.includes('android') && !userAgent.includes('mobile'));
  
  const isTabletWidth = window.innerWidth > 768 && window.innerWidth <= 1024;
  
  return isTabletUserAgent || isTabletWidth;
}

/**
 * 获取设备类型
 * @returns {'mobile' | 'tablet' | 'desktop'} 设备类型
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}