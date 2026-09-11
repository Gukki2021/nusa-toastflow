/* Reviewed display identities: July/August final PDFs + September appointment plan.
   Aliases are explicit. Never guess a person's surname or merge on a first name.
   Club affiliations are separate from names and only rendered in the left column. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ToastFlowPeople=api;})(typeof self!=='undefined'?self:this,function(){
  const people=[
    {name:'Jonta KOGA',credentials:'PI2',aliases:['Jonta Koga']},
    {name:'Sandy GOH',credentials:'PM3',aliases:['Sandy W. Goh','Sandy Goh','Sandy']},
    {name:'XU Jiaqi',credentials:'PM1',aliases:['Jiaqi Xu','Xu Jiaqi']},
    {name:'LAU Kwong Fook',credentials:'ATMB, CL',aliases:['Kwong Fook Lau','Lau Kwong Fook']},
    {name:'Jeanie LEE',credentials:'ATMB, CL',aliases:['Jeanie Lee Chin Ying','Jeanie Lee']},
    {name:'LER Wee Meng',credentials:'ATMB, CL',aliases:['Wee Meng Ler','Ler Wee Meng']},
    {name:'Kelvin SIM',credentials:'PI2',aliases:['Kelvin Sim']},
    {name:'Sabrina XU',credentials:'PI3',aliases:['Sabrina X. Xu','Sabrina Xu']},
    {name:'WEE Gee Shing',credentials:'PI4',aliases:['Wee Gee Shing','Wee GeeShing']},
    {name:'TU Yu',credentials:'CC',aliases:['Yu Tu','Tu Yu']},
    {name:'GOH Shu Ching',credentials:'PM5, EH3',aliases:['Shu Ching Goh','Goh Shu Ching','Shuching']},
    {name:'Jayden TEO',credentials:'',aliases:['Jayden Teo']},
    {name:'Sara LIM',credentials:'',aliases:['Sara Lim']},
    {name:'Winona LIM',credentials:'',aliases:['Winona Lim']},
    {name:'CHEN Qin',credentials:'VC5',aliases:['Chen Qin']},
    {name:'Attapol PINSA',credentials:'LP1',aliases:['Attapol Pinsa'],club:'Toa Payoh Central CC',visiting:true},
    {name:'Jai Ganesh Supra',credentials:'PI3',aliases:['Jai Ganesh Supra'],club:'Ace the Place CC',visiting:true,surnameReview:true},
    {name:'Sam LIM',credentials:'DTM',aliases:['Sam Lim'],club:'Lion City',visiting:true},
    {name:'Shelley CHOW',credentials:'VC1',aliases:['Shelley Chow'],club:'LCS',visiting:true},
    {name:'Eugene LOW',credentials:'PI5',aliases:['Eugene Low'],club:'SRC'},
    {name:'Gordon YIT',credentials:'PM4',aliases:['Gordon Yit'],visiting:true},
    {name:'Vincent CHEN',credentials:'SR3',aliases:['Vincent Chen'],club:'Tampines Changkat',visiting:true},
    {name:'Vincent CHUA',credentials:'',aliases:['Vincent Chua'],club:'Cairnhill TMC',visiting:true},
    {name:'Marc WONG',credentials:'',aliases:['Marc Wong'],club:'Anchorvale CC',visiting:true}
  ];
  const clean=s=>String(s||'').replace(/\([^)]*\)/g,'').replace(/[?*+]/g,'').replace(/,\s*(?:[A-Z]{2,5}\s*\d?|CL)\b.*$/i,'').replace(/\s+/g,' ').trim();
  const key=s=>clean(s).toLowerCase();
  const aliases=new Map();people.forEach(p=>[p.name,...p.aliases].forEach(n=>aliases.set(key(n),p)));
  function find(name){return aliases.get(key(name))||null;}
  function canonical(name){return find(name)?.name||clean(name);}
  function label(name){const p=find(name);return p?p.name+(p.credentials?', '+p.credentials:'')+(p.visiting?'*':''):clean(name);}
  return {people,find,canonical,label,clean};
});
