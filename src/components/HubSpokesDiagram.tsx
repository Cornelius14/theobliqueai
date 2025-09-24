import React from "react";

export default function HubSpokesDiagram(){
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="relative w-full max-w-5xl">
        <style>{`
          .hiw-svg{width:100%;height:auto}
          .hub{animation:pulse 2.4s ease-in-out infinite}
          @keyframes pulse{0%{transform:scale(1);opacity:.9}50%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:.9}}
          .flow{stroke-dasharray:6 10;animation:flow 8s linear infinite}
          @keyframes flow{to{stroke-dashoffset:-1000}}
          @media (prefers-color-scheme: light){
            .stroke-muted{stroke:rgba(0,0,0,.12)}
            .text-strong{fill:#0f172a}
            .text-soft{fill:rgba(15,23,42,.65)}
            .chip{fill:rgba(15,23,42,.08)}
            .node{fill:#0b1220;opacity:.08}
          }
          @media (prefers-color-scheme: dark){
            .stroke-muted{stroke:rgba(255,255,255,.14)}
            .text-strong{fill:#e5e7eb}
            .text-soft{fill:rgba(229,231,235,.7)}
            .chip{fill:rgba(229,231,235,.08)}
            .node{fill:#0b1220;opacity:.95}
          }
        `}</style>

        <svg className="hiw-svg" viewBox="0 0 980 560" role="img" aria-labelledby="t d">
          <title id="t">How Oblique AI Works</title><desc id="d">Hub & spokes diagram for mandate→meeting orchestration.</desc>
          <defs>
            <radialGradient id="gHub" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#0ea5e9"/>
            </radialGradient>
            <linearGradient id="gLink" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#a78bfa"/>
            </linearGradient>
          </defs>

          {/* Center hub */}
          <g transform="translate(490,275)">
            <circle r="78" fill="url(#gHub)" className="hub"/>
            <text className="text-strong" textAnchor="middle" y="-4" style={{fontWeight:700,fontSize:16}}>Oblique AI</text>
            <text className="text-soft" textAnchor="middle" y="14" style={{fontSize:12}}>Orchestrates mandate → meeting</text>
          </g>

          {[
            {x:165,y:110,title:"Your Mandate",desc:"Type criteria in natural language",chips:["multifamily","industrial","land"]},
            {x:815,y:150,title:"LLM Parse",desc:"Understands any RE intent",chips:["acq","refi","mezz","JV"]},
            {x:835,y:340,title:"Universal Schema",desc:"Normalized buy-box",chips:["market","size","budget"]},
            {x:620,y:465,title:"Targeting",desc:"Owners/age/asset/market",chips:["65+","1980+","off-market"]},
            {x:360,y:480,title:"Outreach Engine",desc:"Email • SMS • Voicemail • Calls",chips:["sequenced","AI agent","throttled"]},
            {x:160,y:385,title:"Qualification & Red Flags",desc:"Gate & flag deal-killers",chips:["title","zoning","env"]},
            {x:135,y:215,title:"Meetings Booked",desc:"Calendar handoff",chips:["routing","timezones","reminders"]},
            {x:490,y:75,title:"CRM Sync",desc:"Pipeline & notes updated",chips:["Prospected","Qualified","Booked"]},
          ].map((node,i)=>(
            <g key={i}>
              <line x1={490} y1={275} x2={node.x} y2={node.y} stroke="url(#gLink)" strokeWidth="2.2" className="flow stroke-muted"/>
              <g transform={`translate(${node.x},${node.y})`}>
                <circle r="62" className="node"/>
                <text className="text-strong" textAnchor="middle" y="-6" style={{fontWeight:600,fontSize:12}}>{node.title}</text>
                <text className="text-soft" textAnchor="middle" y="12" style={{fontSize:11}}>{node.desc}</text>
                {node.chips.slice(0,3).map((c,idx)=>(
                  <g key={idx} transform={`translate(${-36+idx*36},32)`}>
                    <rect className="chip" rx="6" ry="6" x="-18" y="-10" width="36" height="20"/>
                    <text className="text-strong" textAnchor="middle" dominantBaseline="middle" style={{fontSize:10.5}}>{c}</text>
                  </g>
                ))}
              </g>
            </g>
          ))}

          {/* legend */}
          <g transform="translate(18,535)">
            <circle r="6" fill="url(#gHub)"/><text x="14" y="4" className="text-soft" style={{fontSize:12}}>AI hub</text>
            <circle cx="110" r="6" className="node"/><text x="124" y="4" className="text-soft" style={{fontSize:12}}>Stage</text>
            <line x1="210" y1="0" x2="250" y2="0" stroke="url(#gLink)" strokeWidth="2.2" className="flow"/>
            <text x="260" y="4" className="text-soft" style={{fontSize:12}}>Live orchestration</text>
          </g>
        </svg>
      </div>
    </div>
  );
}