// =========================
// SIGWEB V1.1
// Base para integração com Google Sheets
// =========================

const map = L.map('map');

const osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { maxZoom: 19 }
);

const esri = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
);

esri.addTo(map);

const base = {
  "Imagem de Satélite": esri,
  "OpenStreetMap": osm
};

const overlays = {};

// =========================
// GOOGLE SHEETS
// =========================

let bancoDados = [];

async function carregarBanco() {

    const resposta = await fetch(CONFIG.apiUrl);

    bancoDados = await resposta.json();

    console.log("Banco carregado:", bancoDados);

}

function buscarImovel(id){

    return bancoDados.find(item => Number(item.id) === Number(id));

}

// =========================

function styleIm() {
    return {
        color: "#F9A825",
        fillColor: "#FFD54F",
        weight: 2,
        fillOpacity: 0.3
    };
}

function styleRL() {
    return {
        color: "#2E7D32",
        fillColor: "#43A047",
        weight: 2,
        fillOpacity: 0.45
    };
}

function hover(e){
    e.target.setStyle({
        weight:4,
        fillOpacity:0.6
    });
}

function out(layer,style){
    layer.setStyle(style());
}

// =========================
// CARREGA O BANCO PRIMEIRO
// =========================

carregarBanco().then(() => {

    fetch("imoveis.geojson")

    .then(r=>r.json())

    .then(d=>{

        const im = L.geoJSON(d,{

            style:styleIm,

            onEachFeature:(feature,layer)=>{

                layer.on({
                    mouseover:hover,
                    mouseout:()=>out(layer,styleIm)
                });

                // POR ENQUANTO
                // Continua usando o GeoJSON.
                // No próximo passo o popup virá da planilha.

                // id do polígono
const id = feature.properties.ID;

// procura o imóvel na planilha
const p = buscarImovel(id);

if (!p) {
    layer.bindPopup("Imóvel não encontrado na planilha.");
    return;
}

const labels={
nome_imovel:"Imóvel",
proprietario:"Proprietário",
municipio:"Município",
estado:"Estado",
car:"CAR",
car_area_ha:"Área CAR (ha)",
matricula:"Matrícula",
matricula_area_ha:"Área Matrícula (ha)",
fonte_poligono:"Fonte do Polígono"
};

let html=`<div style="min-width:340px">
<h3 style="margin:0 0 8px 0">${p.nome_imovel||""}</h3>
<table style="width:100%;border-collapse:collapse;">`;

let comentarios="";

Object.entries(p).forEach(([campo,valor])=>{
 if(valor===""||valor==null)return;
 if(campo==="comentarios"){comentarios=valor;return;}
 let exib=valor;
 if(campo.endsWith("_link")){
   exib=`<a href="${valor}" target="_blank">📄 Abrir documento</a>`;
 }
 html+=`<tr><td style="font-weight:bold;padding:4px;border-bottom:1px solid #eee">${labels[campo]||campo}</td><td style="padding:4px;border-bottom:1px solid #eee;word-break:break-word">${exib}</td></tr>`;
});
html+="</table>";
if(comentarios){
 html+=`<div style="margin-top:10px;padding:8px;background:#f7f7f7;border-left:4px solid #2E7D32">
 <b>📝 Comentários</b><div style="margin-top:6px;white-space:pre-wrap;line-height:1.5">${comentarios}</div></div>`;
}
html+="</div>";
layer.bindPopup(html);;

            }

        }).addTo(map);

        overlays["Imóveis"] = im;

        L.control.layers(base,overlays).addTo(map);

        map.fitBounds(im.getBounds());

        fetch("reserva_legal.geojson")

        .then(r=>r.json())

        .then(g=>{

            const rl=L.geoJSON(g,{

                style:styleRL,

                onEachFeature:(f,l)=>{

                    l.on({
                        mouseover:hover,
                        mouseout:()=>out(l,styleRL)
                    });

                }

            }).addTo(map);

            overlays["Reserva Legal"] = rl;

        });

    });

});

const legend = L.control({
    position:"bottomleft"
});

legend.onAdd=function(){

    let div=L.DomUtil.create("div","legend");

    div.innerHTML=`
        <b>Legenda</b><br>
        <span style="color:#F9A825">■</span> Imóveis<br>
        <span style="color:#2E7D32">■</span> Reserva Legal
    `;

    return div;

};

legend.addTo(map);