"use client";
import React from 'react';

const FlashEffect = ({ active }: { active: boolean }) => { if (!active) return null; return <div className="fixed inset-0 bg-white pointer-events-none animate-flash z-[1000]" />; };

export default FlashEffect;
