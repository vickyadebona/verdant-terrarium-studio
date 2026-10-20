import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Volume2,
  VolumeX,
  Shuffle,
  SlidersHorizontal,
  ShoppingBag,
  User as UserIcon,
  LogIn,
  LogOut,
} from 'lucide-react';
import type { LightingMode } from '../types/terrarium';
import { PRESETS } from '../data';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface TopNavBarProps {
  lighting: LightingMode;
  onSetLighting: (mode: LightingMode) => void;
  humidity: number;
  onTriggerMist: () => void;
  muted: boolean;
  onToggleMute: () => void;
  totalPrice: number;
  onOpenBlueprintModal: () => void;
  onLoadPreset: (key: string) => void;
  onRandomize: () => void;
  showMobilePresets: boolean;
  onToggleMobilePresets: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  lighting,
  onSetLighting,
  humidity,
  onTriggerMist,
  muted,
  onToggleMute,
  totalPrice,
  onOpenBlueprintModal,
  onLoadPreset,
  onRandomize,
  showMobilePresets,
  onToggleMobilePresets,
}) => {
  const { openCart, itemCount, openTrackerModal, orders } = useCart();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  return (
    <>
      <header className="shrink-0 border-b border-stone-800/80 bg-stone-900/80 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 z-30">
        {/* Brand Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="truncate">
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-stone-100 flex items-center gap-2">
              <span className="truncate">TerraScape</span>
              <span className="hidden md:inline-block text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                Custom Terrariums &amp; Smart Hardware
              </span>
            </h1>
            <p className="hidden sm:block text-xs text-stone-400 truncate">
              Design your botanical layout &amp; equip custom-engineered lighting/misting circuits
            </p>
          </div>
        </div>

        {/* Desktop Preset Ecosystems */}
        <div className="hidden 2xl:flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider text-stone-400 mr-1">Presets:</span>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => onLoadPreset(key)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700/80 transition cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={onRandomize}
            title="Randomize Terrarium"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-200 border border-emerald-700/60 flex items-center gap-1 transition cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise</span>
          </button>
        </div>

        {/* Lighting, Micro-Climate & Order Blueprint CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Presets Toggle Button */}
          <button
            onClick={onToggleMobilePresets}
            className={`2xl:hidden px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              showMobilePresets
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-stone-800/90 border-stone-700 text-stone-300'
            }`}
            title="Presets & Randomizer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {/* Lighting Switcher */}
          <div className="flex items-center bg-stone-800/90 p-0.5 sm:p-1 rounded-xl border border-stone-700/70">
            <button
              onClick={() => onSetLighting('day')}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                lighting === 'day'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Daylight Spectrum"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Day</span>
            </button>
            <button
              onClick={() => onSetLighting('golden')}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                lighting === 'golden'
                  ? 'bg-orange-500/25 text-orange-300 border border-orange-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Golden Hour PWM Dimming"
            >
              <Sunset className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Golden</span>
            </button>
            <button
              onClick={() => onSetLighting('night')}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                lighting === 'night'
                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Night UV Bioluminescence"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Night</span>
            </button>
          </div>

          <button
            onClick={onTriggerMist}
            className="px-2.5 py-1.5 sm:py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Test Ultrasonic Piezo Mist"
          >
            <CloudRain className="w-4 h-4" />
            <span className="hidden sm:inline">{humidity}%</span>
          </button>

          <button
            onClick={onToggleMute}
            className="hidden sm:flex p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 transition cursor-pointer"
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Workshop Order Tracker Button (if customer has placed orders) */}
          {orders.length > 0 && (
            <button
              onClick={() => openTrackerModal()}
              className="px-2.5 py-1.5 sm:py-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-emerald-300 border border-emerald-700/60 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Track Active Studio Builds"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Tracker</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-200">
                {orders.length}
              </span>
            </button>
          )}

          {/* Account / Auth Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-stone-800/90 hover:bg-stone-750 text-stone-200 border border-stone-700/80 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                title={`Signed in as ${user?.name}`}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-emerald-400/60"
                  />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="hidden md:inline max-w-[90px] truncate">{user?.name.split(' ')[0]}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-2.5 z-50 text-xs text-stone-200 animate-fade-in">
                  <div className="px-2 py-1.5 border-b border-stone-800 mb-1.5">
                    <p className="font-semibold text-stone-100 truncate">{user?.name}</p>
                    <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      {user?.provider === 'google' ? 'Google Account' : 'Verified Email'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-800 text-rose-300 hover:text-rose-200 flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() =>
                openAuthModal({
                  title: 'Sign In to TerraScape',
                  message:
                    'Sign in with Google or your email to link custom terrarium blueprints, track workshop assembly, and manage orders.',
                })
              }
              className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-stone-800/90 hover:bg-stone-750 text-stone-300 hover:text-stone-100 border border-stone-700/80 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Sign In / Create Account"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Build Tray Slide-over Cart CTA */}
          <button
            onClick={openCart}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Open Your Jar"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Your Jar</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-[11px] font-bold">
              {itemCount}
            </span>
          </button>

          {/* Primary Review & Order Custom Build CTA */}
          <button
            onClick={onOpenBlueprintModal}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <span>Review Build</span>
            <span className="px-1.5 py-0.5 rounded-md bg-stone-950/20 text-stone-950 font-bold">
              ${totalPrice}
            </span>
          </button>
        </div>
      </header>

      {/* Collapsible Mobile / Tablet Presets Bar */}
      {showMobilePresets && (
        <div className="2xl:hidden shrink-0 bg-stone-900/95 border-b border-stone-800 px-3 py-2 flex items-center gap-2 overflow-x-auto z-20">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 shrink-0">
            Presets:
          </span>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => onLoadPreset(key)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 shrink-0"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={onRandomize}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 flex items-center gap-1 shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Me</span>
          </button>
        </div>
      )}
    </>
  );
};
