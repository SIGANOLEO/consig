const map=L.map('map');
const osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19});
const esri=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
esri.addTo(map);
const base={'Imagem de Satélite':esri,'OpenStreetMap':osm};
const overlays={};
function styleIm(){return{color:'#F9A825',fillColor:'#FFD54F',weight:2,fillOpacity:.3}}
function styleRL(){return{color:'#2E7D32',fillColor:'#43A047',weight:2,fillOpacity:.45}}
function hover(e){e.target.setStyle({weight:4,fillOpacity:.6})}
function out(layer,style){layer.setStyle(style())}
fetch('imoveis.geojson').then(r=>r.json()).then(d=>{
 const im=L.geoJSON(d,{style:styleIm,onEachFeature:(f,l)=>{l.on({mouseover:hover,mouseout:()=>out(l,styleIm)});
 const p=f.properties; let doc=p.link_car||p.car_link;
 let html=`<b>${p.nome_imove||''}</b><br><b>Proprietário:</b> ${p.proprietar||'-'}<br><b>Município:</b> ${p.municipio||'-'}<br><b>Área CAR:</b> ${p.car_area_h||'-'} ha<br><b>CAR:</b> ${p.car||'-'}<hr><b>Documentos</b><br>`;
 html+=doc&&doc!='link'?`<a target='_blank' href='${doc}'>📄 Visualizar Demonstrativo do CAR</a>`:'Documento não disponível.';
 l.bindPopup(html);}}).addTo(map); overlays['Imóveis']=im; L.control.layers(base,overlays).addTo(map); map.fitBounds(im.getBounds());
 fetch('reserva_legal.geojson').then(r=>r.json()).then(g=>{const rl=L.geoJSON(g,{style:styleRL,onEachFeature:(f,l)=>{l.on({mouseover:hover,mouseout:()=>out(l,styleRL)})}}).addTo(map); overlays['Reserva Legal']=rl;});
});
const legend=L.control({position:'bottomleft'});legend.onAdd=function(){let d=L.DomUtil.create('div','legend');d.innerHTML='<b>Legenda</b><br><span style="color:#F9A825">■</span> Imóveis<br><span style="color:#2E7D32">■</span> Reserva Legal';return d};legend.addTo(map);