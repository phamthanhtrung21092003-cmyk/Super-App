import React from 'react';
import Svg, {
  Path,
  Rect,
  Circle,
  Polygon,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';

// 1. VÉ MÁY BAY (Airplane - 3D Blue Jet flying up-right)
export const AirplaneIcon = ({ size = 36 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <SvgGradient id="planeBody" x1="8" y1="40" x2="38" y2="10" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#38BDF8" />
        <Stop offset="50%" stopColor="#0EA5E9" />
        <Stop offset="100%" stopColor="#0284C7" />
      </SvgGradient>
      <SvgGradient id="planeWing" x1="12" y1="36" x2="36" y2="12" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#7DD3FC" />
        <Stop offset="100%" stopColor="#0284C7" />
      </SvgGradient>
      <SvgGradient id="planeTail" x1="6" y1="42" x2="16" y2="32" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#BAE6FD" />
        <Stop offset="100%" stopColor="#0369A1" />
      </SvgGradient>
    </Defs>
    {/* Contrail / Wind trail */}
    <Path d="M6 42 Q14 38 18 36" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
    <Path d="M4 36 Q10 32 14 30" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
    
    {/* Tail fin */}
    <Path d="M9 39 L16 32 L12 28 L7 37 Z" fill="url(#planeTail)" />
    
    {/* Lower wing */}
    <Path d="M21 27 L15 39 L20 40 L28 29 Z" fill="#0369A1" opacity="0.85" />
    
    {/* Main fuselage (Body) */}
    <Path
      d="M39 9 C41 11 41 14 38 17 L15 40 C13 42 10 42 9 40 C8 39 8 36 10 34 L33 11 C36 8 37 7 39 9 Z"
      fill="url(#planeBody)"
    />
    
    {/* Cockpit window */}
    <Ellipse cx="35" cy="13" rx="3" ry="1.8" transform="rotate(-45 35 13)" fill="#E0F2FE" />
    
    {/* Top wing */}
    <Path d="M27 21 L35 7 L40 10 L29 25 Z" fill="url(#planeWing)" />
    
    {/* Engine pod */}
    <Ellipse cx="24" cy="27" rx="4" ry="2" transform="rotate(-45 24 27)" fill="#0284C7" />
    <Circle cx="26" cy="25" r="1.5" fill="#BAE6FD" />
  </Svg>
);

// 2. KHÁCH SẠN (Hotel - 3D Pink/Coral Building with windows & sign)
export const HotelIcon = ({ size = 36 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <SvgGradient id="hotelBody" x1="12" y1="44" x2="36" y2="8" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#FB7185" />
        <Stop offset="100%" stopColor="#F43F5E" />
      </SvgGradient>
      <SvgGradient id="hotelRoof" x1="10" y1="12" x2="38" y2="12" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#E11D48" />
        <Stop offset="100%" stopColor="#BE123C" />
      </SvgGradient>
      <SvgGradient id="hotelDoor" x1="20" y1="44" x2="28" y2="34" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#0284C7" />
        <Stop offset="100%" stopColor="#38BDF8" />
      </SvgGradient>
    </Defs>
    {/* Side buildings / Wings */}
    <Rect x="7" y="20" width="8" height="24" rx="2" fill="#FDA4AF" />
    <Rect x="33" y="20" width="8" height="24" rx="2" fill="#FDA4AF" />
    <Rect x="9" y="24" width="4" height="4" rx="1" fill="#FFF" />
    <Rect x="9" y="32" width="4" height="4" rx="1" fill="#FFF" />
    <Rect x="35" y="24" width="4" height="4" rx="1" fill="#FFF" />
    <Rect x="35" y="32" width="4" height="4" rx="1" fill="#FFF" />

    {/* Main Tower */}
    <Rect x="13" y="10" width="22" height="34" rx="3" fill="url(#hotelBody)" />
    
    {/* Hotel 'H' Sign / Header */}
    <Path d="M19 6 L29 6 L27 10 L21 10 Z" fill="url(#hotelRoof)" />
    <Rect x="20.5" y="12" width="7" height="4" rx="1" fill="#FFF" />
    <Path d="M22.5 13.5 L22.5 16.5 M25.5 13.5 L25.5 16.5 M22.5 15 L25.5 15" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />

    {/* Windows grid */}
    <Rect x="16" y="18" width="4.5" height="4.5" rx="1" fill="#38BDF8" />
    <Rect x="23" y="18" width="4.5" height="4.5" rx="1" fill="#38BDF8" />
    <Rect x="28" y="18" width="4.5" height="4.5" rx="1" fill="#38BDF8" />
    
    <Rect x="16" y="25" width="4.5" height="4.5" rx="1" fill="#FEF08A" />
    <Rect x="23" y="25" width="4.5" height="4.5" rx="1" fill="#38BDF8" />
    <Rect x="28" y="25" width="4.5" height="4.5" rx="1" fill="#FEF08A" />

    {/* Entrance Canopy & Door */}
    <Path d="M18 34 L30 34 L32 37 L16 37 Z" fill="#0284C7" />
    <Rect x="20" y="37" width="8" height="7" rx="1" fill="url(#hotelDoor)" />
    <Path d="M24 37 L24 44" stroke="#FFF" strokeWidth="1" strokeOpacity="0.6" />
  </Svg>
);

// 3. HOMESTAY (House / Villa - Cute green roof & chimney)
export const HomestayIcon = ({ size = 36 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <SvgGradient id="roofGrad" x1="10" y1="12" x2="38" y2="24" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#34D399" />
        <Stop offset="100%" stopColor="#059669" />
      </SvgGradient>
      <SvgGradient id="houseBody" x1="12" y1="24" x2="36" y2="44" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#FED7AA" />
        <Stop offset="100%" stopColor="#FDBA74" />
      </SvgGradient>
    </Defs>
    {/* Chimney */}
    <Rect x="31" y="12" width="4" height="10" rx="1" fill="#EA580C" />
    <Circle cx="33" cy="9" r="1.5" fill="#E2E8F0" opacity="0.8" />
    <Circle cx="35" cy="6" r="2" fill="#E2E8F0" opacity="0.6" />

    {/* House walls */}
    <Rect x="11" y="22" width="26" height="20" rx="2" fill="url(#houseBody)" />
    
    {/* Pitched Roof */}
    <Path d="M24 6 L7 22 L11 23 L24 10 L37 23 L41 22 Z" fill="url(#roofGrad)" />
    
    {/* Cozy Window */}
    <Rect x="14" y="26" width="7" height="7" rx="1.5" fill="#38BDF8" />
    <Path d="M17.5 26 L17.5 33 M14 29.5 L21 29.5" stroke="#FFF" strokeWidth="1.2" />

    {/* Door */}
    <Rect x="26" y="27" width="8" height="15" rx="2" fill="#C2410C" />
    <Circle cx="32" cy="35" r="1" fill="#FEF08A" />
    
    {/* Step */}
    <Rect x="24" y="42" width="12" height="2" rx="1" fill="#78716C" />
  </Svg>
);

// 4. TOUR (Folded Map with 3D Location Pin)
export const TourMapIcon = ({ size = 36 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <SvgGradient id="mapLeft" x1="6" y1="12" x2="18" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#38BDF8" />
        <Stop offset="100%" stopColor="#0284C7" />
      </SvgGradient>
      <SvgGradient id="mapMid" x1="18" y1="10" x2="30" y2="38" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#22D3EE" />
        <Stop offset="100%" stopColor="#06B6D4" />
      </SvgGradient>
      <SvgGradient id="mapRight" x1="30" y1="12" x2="42" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#38BDF8" />
        <Stop offset="100%" stopColor="#0369A1" />
      </SvgGradient>
      <SvgGradient id="pinGrad" x1="20" y1="10" x2="28" y2="24" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#EF4444" />
        <Stop offset="100%" stopColor="#B91C1C" />
      </SvgGradient>
    </Defs>
    {/* Map Fold 1 (Left) */}
    <Polygon points="6,15 18,10 18,36 6,41" fill="url(#mapLeft)" />
    {/* Map Fold 2 (Middle) */}
    <Polygon points="18,10 30,15 30,41 18,36" fill="url(#mapMid)" />
    {/* Map Fold 3 (Right) */}
    <Polygon points="30,15 42,10 42,36 30,41" fill="url(#mapRight)" />

    {/* Green Land / Contours */}
    <Path d="M8 22 Q12 20 16 23 L18 22 L18 29 Q14 26 8 30 Z" fill="#34D399" opacity="0.9" />
    <Path d="M20 18 Q25 24 28 19 L30 20 L30 27 Q26 29 20 24 Z" fill="#34D399" opacity="0.9" />
    <Path d="M32 23 Q36 21 40 25 L40 31 Q36 28 32 30 Z" fill="#34D399" opacity="0.9" />

    {/* Road Dash lines */}
    <Path d="M12 32 Q24 20 36 26" stroke="#FEF08A" strokeWidth="2" strokeDasharray="3 2" />

    {/* 3D Location Pin in center */}
    <Path
      d="M24 10 C20 10 17 13 17 17 C17 22 24 29 24 29 C24 29 31 22 31 17 C31 13 28 10 24 10 Z"
      fill="url(#pinGrad)"
    />
    <Circle cx="24" cy="16" r="3" fill="#FFF" />
  </Svg>
);

// 5. THUÊ XE (Car - Cute 3D Red Car)
export const CarRentalIcon = ({ size = 36 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <SvgGradient id="carBody" x1="6" y1="20" x2="42" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#F87171" />
        <Stop offset="50%" stopColor="#EF4444" />
        <Stop offset="100%" stopColor="#DC2626" />
      </SvgGradient>
      <SvgGradient id="carWindow" x1="12" y1="14" x2="36" y2="24" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#BAE6FD" />
        <Stop offset="100%" stopColor="#38BDF8" />
      </SvgGradient>
    </Defs>
    {/* Car Roof & Cabin */}
    <Path d="M14 22 L18 14 L30 14 L35 22 Z" fill="url(#carWindow)" />
    <Path d="M23.5 14 L23.5 22" stroke="#FFF" strokeWidth="1.5" />

    {/* Main Car Chassis */}
    <Path
      d="M6 24 C6 22 8 21 11 21 L37 21 C40 21 42 23 42 26 L42 33 C42 35 40 36 38 36 L36 36 C36 32 30 32 30 36 L18 36 C18 32 12 32 12 36 L8 36 C6.5 36 6 35 6 33 Z"
      fill="url(#carBody)"
    />

    {/* Headlights */}
    <Rect x="39" y="25" width="3" height="4" rx="1.5" fill="#FEF08A" />
    <Rect x="6" y="26" width="2.5" height="3" rx="1" fill="#FCA5A5" />

    {/* Wheels */}
    <Circle cx="15" cy="36" r="5" fill="#334155" />
    <Circle cx="15" cy="36" r="2.5" fill="#CBD5E1" />
    <Circle cx="33" cy="36" r="5" fill="#334155" />
    <Circle cx="33" cy="36" r="2.5" fill="#CBD5E1" />

    {/* Door handle & line */}
    <Rect x="20" y="25" width="4" height="1.5" rx="0.7" fill="#FFF" opacity="0.9" />
  </Svg>
);

// 6. CAMPING (Tent - 3D Purple / Magenta Tent)
export const CampingTentIcon = ({ size = 36 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <SvgGradient id="tentOuter" x1="12" y1="12" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#C084FC" />
        <Stop offset="100%" stopColor="#9333EA" />
      </SvgGradient>
      <SvgGradient id="tentInner" x1="16" y1="26" x2="28" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#FBBF24" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </SvgGradient>
    </Defs>
    {/* Ground mat / Base */}
    <Ellipse cx="24" cy="40" rx="18" ry="3.5" fill="#15803D" opacity="0.6" />

    {/* Tent side wall */}
    <Polygon points="24,10 6,38 20,38" fill="#7E22CE" />
    
    {/* Tent main canopy */}
    <Polygon points="24,10 20,38 42,38" fill="url(#tentOuter)" />

    {/* Open tent flap (Interior) */}
    <Polygon points="24,14 18,38 30,38" fill="#4C1D95" />
    <Polygon points="24,18 20,38 28,38" fill="url(#tentInner)" />

    {/* Wooden Support Poles */}
    <Path d="M24 8 L24 11 M22 9 L26 11" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
    <Path d="M4 40 L7 37 M41 37 L44 40" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />

    {/* Flag on top */}
    <Polygon points="24,6 29,8 24,10" fill="#EF4444" />
  </Svg>
);

// 7. ẨM THỰC (Food Bowl - Steaming Bowl with Delicacies)
export const FoodBowlIcon = ({ size = 36 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <SvgGradient id="bowlGrad" x1="10" y1="24" x2="38" y2="44" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#FFF" />
        <Stop offset="100%" stopColor="#FDE68A" />
      </SvgGradient>
    </Defs>
    {/* Steam vapor */}
    <Path d="M19 14 Q17 10 20 6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <Path d="M24 13 Q22 8 25 4" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <Path d="M29 14 Q27 10 30 6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

    {/* Food Ingredients */}
    <Circle cx="20" cy="22" r="5" fill="#FB923C" />
    <Circle cx="28" cy="21" r="5.5" fill="#FEF08A" />
    <Circle cx="28" cy="21" r="3" fill="#F59E0B" />
    <Path d="M14 24 Q24 20 34 24" fill="#84CC16" />
    <Circle cx="16" cy="23" r="2" fill="#22C55E" />
    <Circle cx="32" cy="22" r="2.5" fill="#EF4444" />

    {/* Chopsticks */}
    <Path d="M10 16 L38 24 M12 13 L40 21" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />

    {/* Ceramic Bowl */}
    <Path
      d="M8 24 C8 35 15 42 24 42 C33 42 40 35 40 24 Z"
      fill="url(#bowlGrad)"
      stroke="#D97706"
      strokeWidth="1.5"
    />
    
    {/* Bowl rim & ring */}
    <Ellipse cx="24" cy="24" rx="16" ry="3.5" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
    <Rect x="18" y="41" width="12" height="3" rx="1.5" fill="#D97706" />
  </Svg>
);

// 8. LÊN KẾ HOẠCH AI (AI Robot Head - Cute 3D Friendly Robot)
export const AiRobotIcon = ({ size = 36 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <SvgGradient id="robotBody" x1="12" y1="12" x2="36" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#C7D2FE" />
        <Stop offset="50%" stopColor="#818CF8" />
        <Stop offset="100%" stopColor="#6366F1" />
      </SvgGradient>
      <SvgGradient id="robotScreen" x1="14" y1="18" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#1E1B4B" />
        <Stop offset="100%" stopColor="#312E81" />
      </SvgGradient>
    </Defs>
    {/* Antenna */}
    <Path d="M24 13 L24 7" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="24" cy="6" r="3" fill="#F43F5E" />
    <Circle cx="25" cy="5" r="1" fill="#FFF" />

    {/* Ears */}
    <Rect x="7" y="21" width="4" height="8" rx="2" fill="#818CF8" />
    <Rect x="37" y="21" width="4" height="8" rx="2" fill="#818CF8" />

    {/* Head Chassis */}
    <Rect x="10" y="13" width="28" height="24" rx="7" fill="url(#robotBody)" />

    {/* Face Display / Screen */}
    <Rect x="13" y="17" width="22" height="16" rx="4" fill="url(#robotScreen)" />

    {/* Visor / Eyes (Glowing Friendly Cyan) */}
    <Circle cx="19" cy="23" r="3" fill="#38BDF8" />
    <Circle cx="19.8" cy="22.2" r="1" fill="#FFF" />
    <Circle cx="29" cy="23" r="3" fill="#38BDF8" />
    <Circle cx="29.8" cy="22.2" r="1" fill="#FFF" />

    {/* Smiling Mouth */}
    <Path d="M20 28 Q24 31 28 28" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />

    {/* Cheeks */}
    <Circle cx="15.5" cy="26" r="1.5" fill="#FDA4AF" opacity="0.8" />
    <Circle cx="32.5" cy="26" r="1.5" fill="#FDA4AF" opacity="0.8" />
  </Svg>
);

// 9. AI MASCOT CHARACTER (Full Body Waving Cute Robot for Season Card)
export const AiMascotCharacter = ({ size = 68 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Defs>
      <SvgGradient id="mascotBody" x1="16" y1="12" x2="48" y2="56" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="70%" stopColor="#E0F2FE" />
        <Stop offset="100%" stopColor="#BAE6FD" />
      </SvgGradient>
      <SvgGradient id="mascotScreen" x1="20" y1="20" x2="44" y2="36" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#0F172A" />
        <Stop offset="100%" stopColor="#0284C7" />
      </SvgGradient>
    </Defs>
    {/* Floating Shadow */}
    <Ellipse cx="32" cy="58" rx="16" ry="3.5" fill="#0284C7" opacity="0.18" />

    {/* Antenna */}
    <Path d="M32 14 L32 8" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="32" cy="6" r="3" fill="#0EA5E9" />
    <Circle cx="33" cy="5" r="1" fill="#FFF" />

    {/* Ears */}
    <Circle cx="15" cy="25" r="3" fill="#0284C7" />
    <Circle cx="49" cy="25" r="3" fill="#0284C7" />

    {/* Head */}
    <Rect x="16" y="14" width="32" height="24" rx="10" fill="url(#mascotBody)" stroke="#0284C7" strokeWidth="1.5" />
    
    {/* Screen */}
    <Rect x="20" y="18" width="24" height="15" rx="6" fill="url(#mascotScreen)" />
    
    {/* Eyes (Happy Curved Arches) */}
    <Path d="M24 26 Q26 23 28 26" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <Path d="M36 26 Q38 23 40 26" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" fill="none" />

    {/* Smile */}
    <Path d="M30 30 Q32 32 34 30" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Torso / Body */}
    <Path d="M23 38 C23 38 21 52 25 52 L39 52 C43 52 41 38 41 38 Z" fill="url(#mascotBody)" stroke="#0284C7" strokeWidth="1.5" />
    
    {/* AI Emblem on Chest */}
    <Circle cx="32" cy="45" r="5" fill="#0284C7" />
    <Path d="M30 46.5 L31.5 43 L32.5 43 L34 46.5 M30.8 45.5 L33.2 45.5" stroke="#FFF" strokeWidth="0.9" />

    {/* Waving Arm (Right) */}
    <Path d="M41 40 Q49 35 52 28" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
    <Circle cx="52" cy="28" r="3" fill="#0EA5E9" />

    {/* Resting Arm (Left) */}
    <Path d="M23 40 Q17 44 16 48" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
    <Circle cx="16" cy="48" r="3" fill="#0EA5E9" />

    {/* Sparkle Stars */}
    <Path d="M54 12 L55.5 15.5 L59 17 L55.5 18.5 L54 22 L52.5 18.5 L49 17 L52.5 15.5 Z" fill="#F59E0B" />
    <Path d="M12 10 L13 12 L15 13 L13 14 L12 16 L11 14 L9 13 L11 12 Z" fill="#38BDF8" />
  </Svg>
);

// 10. TRUST BADGES
export const TrustShieldIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2 L4 5 V11 C4 16.5 7.5 21.5 12 23 C16.5 21.5 20 16.5 20 11 V5 L12 2 Z" fill="#0284C7" />
    <Path d="M8.5 11.5 L11 14 L15.5 9.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const TrustMedalIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 3 L12 10 L16 3" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="12" cy="14" r="7" fill="#F59E0B" />
    <Circle cx="12" cy="14" r="5" fill="#FBBF24" />
    <Path d="M12 11 L13 13 L15.5 13.5 L13.5 15 L14 17.5 L12 16 L10 17.5 L10.5 15 L8.5 13.5 L11 13 Z" fill="#FFF" />
  </Svg>
);

export const TrustHeadsetIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 12 C4 7.5 7.5 4 12 4 C16.5 4 20 7.5 20 12" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
    <Rect x="3" y="11" width="4" height="7" rx="2" fill="#7C3AED" />
    <Rect x="17" y="11" width="4" height="7" rx="2" fill="#7C3AED" />
    <Path d="M19 18 V20 C19 21 18 22 17 22 H14" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
    <Circle cx="13" cy="22" r="1.5" fill="#7C3AED" />
  </Svg>
);

export const TrustTicketIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="12" rx="3" fill="#EC4899" />
    <Circle cx="3" cy="12" r="2.5" fill="#FFFFFF" />
    <Circle cx="21" cy="12" r="2.5" fill="#FFFFFF" />
    <Path d="M12 8 L13 10.5 L15.5 11 L13.5 12.5 L14 15 L12 13.5 L10 15 L10.5 12.5 L8.5 11 L11 10.5 Z" fill="#FFF" />
  </Svg>
);
