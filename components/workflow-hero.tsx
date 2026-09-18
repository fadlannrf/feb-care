import {Icon} from '@/components/icon';

type WorkflowStep={
  number:string;
  label:string;
  visual:'send'|'review'|'update'|'resolve';
  connectors:('right'|'down')[];
};

const steps:WorkflowStep[]=[
  {number:'01',label:'KIRIM',visual:'send',connectors:['right','down']},
  {number:'02',label:'TINJAU',visual:'review',connectors:['down']},
  {number:'03',label:'PERBARUI',visual:'update',connectors:['right']},
  {number:'04',label:'SELESAI',visual:'resolve',connectors:[]},
];

function Pointer(){return <svg className="workflow-pointer" viewBox="0 0 32 36" aria-hidden="true"><path d="M4 3.5 28.2 20l-10.1 1.8 5.6 9.2-6.2 3.6-5.3-9.1-8.2 6.3Z"/></svg>}

function StepVisual({type}:{type:WorkflowStep['visual']}){
  if(type==='send')return <div className="workflow-send-visual"><span className="workflow-user"><Icon name="users" size={21}/></span><div className="workflow-bubble"><i/><i/></div><div className="workflow-message"><i/><i/><b/><b/><b/></div></div>;
  if(type==='review')return <div className="workflow-review-visual"><span className="workflow-user"><Icon name="users" size={21}/></span><div className="workflow-document"><i/><i/><b/><b/><i className="short"/><span className="workflow-avatar"/></div><Pointer/></div>;
  if(type==='update')return <div className="workflow-update-visual"><span className="workflow-signal"/><div className="workflow-notice"><span><Icon name="bell" size={27}/></span><div><i/><i/><i/></div></div></div>;
  return <div className="workflow-resolve-visual"><span className="workflow-resolve-ring"><Icon name="check" size={53}/></span><i/><i/></div>;
}

export function WorkflowHero(){return <div className="workflow-hero" aria-label="Alur laporan: kirim, tinjau, perbarui, selesai"><div className="workflow-heading"><span className="mono">ALUR LAPORAN</span><span><i/> Responsif dan transparan</span></div><div className="workflow-stages">{steps.map(step=><article className={`workflow-stage workflow-stage-${step.visual}`} key={step.number} tabIndex={0} aria-label={`${step.number} ${step.label}`}><header><span>{step.number}</span><strong>{step.label}</strong></header><StepVisual type={step.visual}/>{step.connectors.map(direction=><span className={`workflow-connector workflow-connector-${direction}`} key={direction} aria-hidden="true"><Icon name={direction==='right'?'chevron':'down'} size={19}/></span>)}</article>)}</div><p className="workflow-caption">Kirim laporan, pantau peninjauan, terima pembaruan, lalu lihat penyelesaiannya.</p></div>}
