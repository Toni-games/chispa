/* Cubiverso · multijugador por salas con código (conexión directa entre jugadores) */
(function(){
const PREFIX='cubiverso-v1-';
let peer=null,conns=[],host=false,code='',myId='',game='',players={},H={};
const emit=(ev,...a)=>{(H[ev]||[]).forEach(f=>{try{f(...a)}catch(e){console.warn(e)}})};
function meInfo(){const s=window.CubiAvatar?CubiAvatar.state():{name:'Jugador',eq:null};return {name:s.name||'Jugador',eq:s.eq}}
function available(){return !!window.Peer&&!!window.RTCPeerConnection}
function rid(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s}
function remember(){if(!window.CubiAvatar)return;const s=CubiAvatar.state();s.friends=s.friends||[];
  Object.entries(players).forEach(([id,p])=>{if(id===myId||!p||!p.name)return;const f=s.friends.find(x=>x.name===p.name);
    if(f){f.last=Date.now();f.game=game}else s.friends.unshift({name:p.name,last:Date.now(),game})});s.friends=s.friends.slice(0,40);CubiAvatar.save(s)}
function broadcast(obj,except){conns.forEach(c=>{if(c!==except&&c.open){try{c.send(obj)}catch(e){}}})}
function sendPlayers(){const msg={t:'__players',players};broadcast(msg);emit('players',players);remember()}
function setup(c){conns.push(c);
  c.on('data',d=>{if(!d||typeof d!=='object')return;
    if(d.t==='__hello'&&host){players[c.peer]=d.p;sendPlayers();emit('join',c.peer,d.p);return}
    if(d.t==='__players'){players=d.players;emit('players',players);remember();return}
    if(d.t==='__bye'){return}
    if(host){d.from=d.from||c.peer;broadcast(d,c)}emit('msg',d,d.from||c.peer)});
  c.on('close',()=>{conns=conns.filter(x=>x!==c);if(host){delete players[c.peer];sendPlayers();emit('leave',c.peer)}else{emit('disconnected')}});
  c.on('error',e=>emit('error',e))}
function create(g){return new Promise((res,rej)=>{if(!available())return rej(new Error('noweb'));leave();game=g;host=true;code=rid();
  peer=new Peer(PREFIX+g+'-'+code);let done=false;
  peer.on('open',id=>{myId=id;players={[id]:meInfo()};done=true;emit('players',players);res(code)});
  peer.on('connection',c=>setup(c));
  peer.on('error',e=>{if(!done){if(e.type==='unavailable-id'){peer.destroy();create(g).then(res,rej)}else rej(e)}else emit('error',e)});
  setTimeout(()=>{if(!done)rej(new Error('timeout'))},12000)})}
function join(g,c){return new Promise((res,rej)=>{if(!available())return rej(new Error('noweb'));leave();game=g;host=false;code=String(c||'').trim().toUpperCase();
  peer=new Peer();let done=false;
  peer.on('open',id=>{myId=id;const conn=peer.connect(PREFIX+g+'-'+code,{reliable:true});setup(conn);
    conn.on('open',()=>{conn.send({t:'__hello',p:meInfo()});done=true;res(code)})});
  peer.on('error',e=>{if(!done)rej(e.type==='peer-unavailable'?new Error('nosala'):e);else emit('error',e)});
  setTimeout(()=>{if(!done)rej(new Error('timeout'))},12000)})}
function send(obj){if(!peer)return;obj.from=myId;if(host)broadcast(obj);else if(conns[0]&&conns[0].open){try{conns[0].send(obj)}catch(e){}}}
function leave(){try{conns.forEach(c=>c.close())}catch(e){}conns=[];if(peer){try{peer.destroy()}catch(e){}}peer=null;players={};code='';host=false}
function on(ev,fn){(H[ev]=H[ev]||[]).push(fn)}
function errText(e){const m=e&&(e.message||e.type)||'';
  if(m==='noweb')return 'El multijugador funciona en la app de Cubiverso y en su web de GitHub. Dentro de la página de Claude no se puede.';
  if(m==='nosala')return 'No existe ninguna sala con ese código. Revisa que esté bien escrito y que tu amigo siga dentro.';
  if(m==='timeout')return 'No se ha podido conectar. Comprueba tu conexión a internet y vuelve a probar.';
  return 'No se ha podido conectar ('+m+'). Prueba otra vez.'}
window.CubiMulti={available,create,join,send,leave,on,errText,get code(){return code},get isHost(){return host},get myId(){return myId},get online(){return !!peer&&!!myId},players:()=>players};
})();
