// Curves and timing adapted from the user's site/public/reference/js/app.js.
export const motion={hop:'cubic-bezier(.87,0,.13,1)',common:'cubic-bezier(.23,.65,.74,1.09)',menu:1000,text:750,stagger:50} as const;
export function hop(t:number){if(t<=0)return 0;if(t>=1)return 1;let lo=0,hi=1,u=t;for(let i=0;i<18;i++){u=(lo+hi)/2;const x=3*(1-u)*(1-u)*u*.87+3*(1-u)*u*u*.13+u*u*u;if(x<t)lo=u;else hi=u;}return 3*(1-u)*u*u+u*u*u;}
