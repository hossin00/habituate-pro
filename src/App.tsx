import { useState } from 'react';
import { Flame, Plus, Check, X, BarChart2, Target, Trash2, Star } from 'lucide-react';
import { format, startOfWeek, addDays, subDays, isToday, parseISO } from 'date-fns';

interface Habit { id:string; name:string; emoji:string; color:string; streak:number; completions:string[]; goal:number; createdAt:number; }
const COLORS=['#22c55e','#3b82f6','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#f97316','#ef4444'];
const EMOJIS=['🏃','💪','📚','🧘','💧','🥗','😴','✍️','🎸','🗣️','🧹','💊'];
const SAVE='hp_habits_v1';
const loadH=():Habit[]=>{try{return JSON.parse(localStorage.getItem(SAVE)||'[]')}catch{return[]}};
const today=new Date().toISOString().split('T')[0];

export default function App() {
  const [habits,setHabits]=useState<Habit[]>(loadH);
  const [showAdd,setShowAdd]=useState(false);
  const [tab,setTab]=useState<'today'|'stats'>('today');

  const save=(items:Habit[])=>{setHabits(items);localStorage.setItem(SAVE,JSON.stringify(items))};

  const toggle=(id:string)=>{
    save(habits.map(h=>{
      if(h.id!==id)return h;
      const done=h.completions.includes(today);
      const completions=done?h.completions.filter(d=>d!==today):[...h.completions,today];
      // Recalculate streak
      let streak=0;
      const d=new Date();
      while(true){
        const ds=d.toISOString().split('T')[0];
        if(completions.includes(ds)){streak++;d.setDate(d.getDate()-1);}
        else break;
      }
      return{...h,completions,streak};
    }));
  };

  const todayDone=habits.filter(h=>h.completions.includes(today)).length;
  const pct=habits.length?Math.round(todayDone/habits.length*100):0;
  
  // Last 7 days for mini calendar
  const last7=[...Array(7)].map((_,i)=>{
    const d=subDays(new Date(),6-i);
    return{date:d.toISOString().split('T')[0],label:format(d,'E')[0],isToday:isToday(d)};
  });

  return (
    <div style={{minHeight:'100vh',background:'#080a08',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:'1px solid #14332050',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px #22c55e30'}}><Flame size={16} color="white"/></div>
          <div><div style={{fontWeight:'700',fontSize:'16px',color:'white',lineHeight:1}}>Habituate Pro</div>
          <div style={{fontSize:'11px',color:'#14532d',marginTop:'2px'}}>{todayDone}/{habits.length} done today</div></div>
        </div>
        <div style={{display:'flex',gap:'4px'}}>
          {(['today','stats'] as const).map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'6px 12px',borderRadius:'7px',background:tab===t?'#22c55e20':'none',border:`1px solid ${tab===t?'#22c55e':'transparent'}`,color:tab===t?'#4ade80':'#14532d',fontSize:'12px',cursor:'pointer',fontFamily:'Inter',textTransform:'capitalize'}}>{t}</button>)}
        </div>
      </header>

      {tab==='today'&&<>
        {/* Progress */}
        {habits.length>0&&<div style={{padding:'14px 20px',borderBottom:'1px solid #14332050'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
            <span style={{fontSize:'13px',fontWeight:'600',color:'white'}}>Today — {format(new Date(),'EEEE, MMM d')}</span>
            <span style={{fontSize:'13px',fontWeight:'700',color:'#22c55e'}}>{pct}%</span>
          </div>
          <div style={{height:'6px',background:'#143320',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#22c55e,#34d399)',borderRadius:'3px',transition:'width 0.5s ease'}}/>
          </div>
        </div>}

        <div style={{flex:1,overflow:'auto',padding:'12px 20px'}}>
          <button onClick={()=>setShowAdd(true)} style={{display:'flex',alignItems:'center',gap:'8px',width:'100%',padding:'12px 16px',borderRadius:'12px',background:'transparent',border:'1px dashed #22c55e30',color:'#34d399',fontSize:'13px',fontWeight:'500',cursor:'pointer',fontFamily:'Inter',marginBottom:'12px',transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='#22c55e'} onMouseLeave={e=>e.currentTarget.style.borderColor='#22c55e30'}>
            <Plus size={14}/> Add habit
          </button>
          {habits.length===0?(
            <div style={{textAlign:'center',padding:'40px 20px'}}>
              <div style={{fontSize:'52px',marginBottom:'16px'}}>🔥</div>
              <h3 style={{fontSize:'20px',fontWeight:'700',color:'white',marginBottom:'8px'}}>Build your first habit</h3>
              <p style={{color:'#14532d',fontSize:'14px',lineHeight:'1.6',maxWidth:'240px',margin:'0 auto'}}>Start small. Track daily. Build streaks that transform your life.</p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {habits.map(h=>{
                const done=h.completions.includes(today);
                return <div key={h.id} style={{background:'#0a140a',border:`1px solid ${done?h.color+'40':'#14332050'}`,borderRadius:'12px',padding:'14px',display:'flex',alignItems:'center',gap:'12px',transition:'all 0.2s'}}>
                  <button onClick={()=>toggle(h.id)} style={{width:'40px',height:'40px',borderRadius:'12px',background:done?h.color:h.color+'15',border:`1px solid ${h.color}50`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'20px',transition:'all 0.2s',flexShrink:0}}>
                    {done?'✓':h.emoji}
                  </button>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:done?'#6b7280':'white',fontSize:'13px',fontWeight:'500',textDecoration:done?'line-through':'none'}}>{h.name}</div>
                    <div style={{display:'flex',gap:'8px',marginTop:'4px'}}>
                      <span style={{fontSize:'11px',color:h.color}}>🔥 {h.streak} day streak</span>
                      <span style={{fontSize:'11px',color:'#14532d'}}>{h.completions.length} total</span>
                    </div>
                  </div>
                  {/* Mini week view */}
                  <div style={{display:'flex',gap:'3px',flexShrink:0}}>
                    {last7.map(d=>(
                      <div key={d.date} style={{width:'20px',height:'20px',borderRadius:'4px',background:h.completions.includes(d.date)?h.color:d.isToday?'#143320':'#0a0a0a',border:d.isToday?`1px solid ${h.color}40`:'1px solid transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <div style={{fontSize:'7px',color:h.completions.includes(d.date)?'white':'#14532d'}}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>save(habits.filter(x=>x.id!==h.id))} style={{padding:'4px',background:'none',border:'none',cursor:'pointer',color:'#14532d',flexShrink:0}}><Trash2 size={13}/></button>
                </div>;
              })}
            </div>
          )}
        </div>
      </>}

      {tab==='stats'&&(
        <div style={{flex:1,overflow:'auto',padding:'16px 20px'}}>
          {habits.length===0?(
            <div style={{textAlign:'center',padding:'40px 20px'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>📊</div>
              <p style={{color:'#14532d',fontSize:'14px'}}>Add habits to see your stats.</p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {habits.sort((a,b)=>b.streak-a.streak).map(h=>{
                const totalDays=Math.ceil((Date.now()-h.createdAt)/(86400000))||1;
                const rate=Math.round(h.completions.length/totalDays*100);
                return <div key={h.id} style={{background:'#0a140a',border:'1px solid #14332050',borderRadius:'12px',padding:'16px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                    <span style={{fontSize:'24px'}}>{h.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{color:'white',fontSize:'14px',fontWeight:'500'}}>{h.name}</div>
                      <div style={{color:'#14532d',fontSize:'11px',marginTop:'2px'}}>Best streak: {h.streak} days</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'22px',fontWeight:'700',color:h.color}}>{rate}%</div>
                      <div style={{fontSize:'10px',color:'#14532d'}}>success rate</div>
                    </div>
                  </div>
                  <div style={{height:'5px',background:'#143320',borderRadius:'3px',overflow:'hidden'}}>
                    <div style={{width:`${rate}%`,height:'100%',background:h.color,borderRadius:'3px'}}/>
                  </div>
                </div>;
              })}
            </div>
          )}
        </div>
      )}

      {showAdd&&(
        <div style={{position:'fixed',inset:0,background:'#00000080',zIndex:50,display:'flex',alignItems:'flex-end'}} onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <HabitForm onAdd={h=>{save([h,...habits]);setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>
        </div>
      )}
    </div>
  );
}

function HabitForm({onAdd,onClose}:{onAdd:(h:Habit)=>void;onClose:()=>void}) {
  const [name,setName]=useState('');
  const [emoji,setEmoji]=useState('🏃');
  const [color,setColor]=useState('#22c55e');
  const inp={width:'100%',background:'#080a08',border:'1px solid #14332050',borderRadius:'10px',padding:'11px 14px',color:'white',fontSize:'14px',outline:'none',fontFamily:'Inter'};
  return (
    <div style={{width:'100%',background:'#0a140a',borderRadius:'20px 20px 0 0',border:'1px solid #14332050',padding:'24px',maxHeight:'80vh',overflowY:'auto'}}>
      <div style={{width:'36px',height:'3px',background:'#143320',borderRadius:'2px',margin:'0 auto 20px'}}/>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'18px'}}>
        <h3 style={{color:'white',fontSize:'16px',fontWeight:'700',fontFamily:'Inter'}}>New Habit</h3>
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#14532d'}}><X size={16}/></button>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Habit name *" style={inp} autoFocus onFocus={e=>e.target.style.borderColor='#22c55e'} onBlur={e=>e.target.style.borderColor='#14332050'}/>
        <div>
          <div style={{fontSize:'11px',color:'#14532d',marginBottom:'8px'}}>Pick an emoji</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
            {EMOJIS.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{width:'36px',height:'36px',borderRadius:'8px',border:`1px solid ${emoji===e?'#22c55e':'#14332050'}`,background:emoji===e?'#22c55e15':'transparent',fontSize:'18px',cursor:'pointer'}}>{e}</button>)}
          </div>
        </div>
        <div>
          <div style={{fontSize:'11px',color:'#14532d',marginBottom:'8px'}}>Pick a color</div>
          <div style={{display:'flex',gap:'6px'}}>
            {COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:'28px',height:'28px',borderRadius:'50%',background:c,border:`2px solid ${color===c?'white':c+'60'}`,cursor:'pointer',transition:'all 0.15s',transform:color===c?'scale(1.2)':'scale(1)'}}/>)}
          </div>
        </div>
        <button onClick={()=>{if(!name.trim())return;onAdd({id:crypto.randomUUID(),name:name.trim(),emoji,color,streak:0,completions:[],goal:1,createdAt:Date.now()});}} disabled={!name.trim()} style={{padding:'14px',borderRadius:'12px',background:!name.trim()?'#143320':'#22c55e',border:'none',color:'white',fontSize:'15px',fontWeight:'700',cursor:!name.trim()?'not-allowed':'pointer',fontFamily:'Inter',opacity:!name.trim()?0.5:1}}>Create Habit</button>
      </div>
    </div>
  );
}
