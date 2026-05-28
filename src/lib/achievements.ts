import { Trophy, Star, Zap, Rocket, ZapOff, Target, ShoppingCart, Timer, ShieldCheck, Heart } from 'lucide-react';
import type { Achievement } from './game-types';

const tierColors = {
bronze: 'text-[#cd7f32]', silver: 'text-[#c0c0c0]', gold: 'text-[#ffd700]',
diamond: 'text-[#b9f2ff]', master: 'text-[#9d72e8]',
};

export const achievementsList: Achievement[] = [
{
id: 'level_milestone', name: 'achievements.level_milestone.name', description: 'achievements.level_milestone.description',
icon: (tier) => ({ component: Trophy, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 5, reward: { score: 500 } },
{ name: 'achievements.tiers.silver', goal: 15, reward: { score: 2000 } },
{ name: 'achievements.tiers.gold', goal: 30, reward: { score: 5000 } },
],
},
{
id: 'score_milestone', name: 'achievements.score_milestone.name', description: 'achievements.score_milestone.description',
icon: (tier) => ({ component: Star, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 10000, reward: { score: 1000 } },
{ name: 'achievements.tiers.silver', goal: 100000, reward: { score: 10000 } },
{ name: 'achievements.tiers.gold', goal: 500000, reward: { score: 50000 } },
],
},
{
id: 'combo_master', name: 'achievements.combo_master.name', description: 'achievements.combo_master.description',
icon: (tier) => ({ component: Zap, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 5, reward: { score: 500 } },
{ name: 'achievements.tiers.silver', goal: 10, reward: { score: 2000 } },
{ name: 'achievements.tiers.gold', goal: 15, reward: { score: 5000 } },
],
},
{
id: 'chain_reaction', name: 'achievements.chain_reaction.name', description: 'achievements.chain_reaction.description',
icon: (tier) => ({ component: Rocket, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 15, reward: { score: 1000 } },
{ name: 'achievements.tiers.silver', goal: 30, reward: { score: 4000 } },
{ name: 'achievements.tiers.gold', goal: 50, reward: { score: 10000 } },
],
},
{
id: 'pacifist', name: 'achievements.pacifist.name', description: 'achievements.pacifist.description',
icon: (tier) => ({ component: ZapOff, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 1, reward: { score: 2000 } },
{ name: 'achievements.tiers.gold', goal: 5, reward: { score: 10000 } },
],
},
{
id: 'sniper', name: 'achievements.sniper.name', description: 'achievements.sniper.description',
icon: (tier) => ({ component: Target, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 20, reward: { score: 1500 } },
{ name: 'achievements.tiers.gold', goal: 100, reward: { score: 10000 } },
],
},
{
id: 'big_spender', name: 'achievements.big_spender.name', description: 'achievements.big_spender.description',
icon: (tier) => ({ component: ShoppingCart, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 5000, reward: { score: 1000 } },
{ name: 'achievements.tiers.gold', goal: 50000, reward: { score: 10000 } },
],
},
{
id: 'rapid_fire', name: 'achievements.rapid_fire.name', description: 'achievements.rapid_fire.description',
icon: (tier) => ({ component: Timer, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 50, reward: { score: 2000 } },
{ name: 'achievements.tiers.gold', goal: 250, reward: { score: 15000 } },
],
},
{
id: 'survivor', name: 'achievements.survivor.name', description: 'achievements.survivor.description',
icon: (tier) => ({ component: ShieldCheck, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 3, reward: { score: 3000 } },
{ name: 'achievements.tiers.gold', goal: 10, reward: { score: 15000 } },
],
},
{
id: 'perfectionist', name: 'achievements.perfectionist.name', description: 'achievements.perfectionist.description',
icon: (tier) => ({ component: Heart, className: Object.values(tierColors)[Math.min(tier, 4)] }),
tiers: [
{ name: 'achievements.tiers.bronze', goal: 1, reward: { score: 5000 } },
{ name: 'achievements.tiers.gold', goal: 5, reward: { score: 25000 } },
],
},
];
